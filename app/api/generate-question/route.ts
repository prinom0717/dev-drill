import Groq from "groq-sdk";
import { NextResponse } from "next/server";
import { generateQuestionPrompt, generateDescriptiveQuestionPrompt } from "@/lib/prompt-template";
import { prisma } from "@/lib/prisma";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// 利用するモデルの優先順位（429発生時に順次切り替え）
const MODEL_PRIORITY = [
  "openai/gpt-oss-120b",
  "openai/gpt-oss-20b",
];

/**
 * コードブロックからコンテンツを抽出する関数
 * ```json, ```python, ``` の各パターンに対応
 */
function extractCodeBlock(content: string): string {
  // 優先順位: json → python → 汎用コードブロック
  const patterns = [
    /```json\s*([\s\S]*?)\s*```/g,
    /```python\s*([\s\S]*?)\s*```/g,
    /```\s*([\s\S]*?)\s*```/g
  ];

  for (const pattern of patterns) {
    content = content.replace(pattern, (_, code) => {
      // コードブロックの中身だけ取り出し
      const inner = code.trim();

      // 実際の改行を \n にエスケープ
      const escaped = inner.replace(/\n/g, "\\n");

      return escaped;
    });
  }

  return content.trim();
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { subject, chapter, freeText, questionType } = body;

    // バリデーション
    if (!subject || !chapter) {
      return NextResponse.json(
        { error: "科目と章は必須です" },
        { status: 400 }
      );
    }

    if (questionType && questionType !== "choice" && questionType !== "descriptive") {
      return NextResponse.json(
        { error: "問題タイプは 'choice' または 'descriptive' である必要があります" },
        { status: 400 }
      );
    }

    // 不採用問題を取得（重複を避けるため）
    const rejectedQuestions = await prisma.rejectedQuestion.findMany({
      select: {
        question_text: true,
      },
      take: 50, // 最近の50件に制限してプロンプトが長くなりすぎないようにする
    });

    // 採用した問題から直近3問を取得（重複を避けるため）
    const recentQuestions = await prisma.question.findMany({
      select: {
        question_text: true,
      },
      orderBy: {
        created_at: 'desc',
      },
      take: 1, // 直近3問
    });

    // 採用した問題と不採用問題を結合
    const allRejectedQuestions = [
      ...rejectedQuestions,
      ...recentQuestions,
    ];

    // プロンプトを生成（問題タイプに応じて分岐）
    const prompt = questionType === "descriptive"
      ? generateDescriptiveQuestionPrompt({
          subject,
          chapter,
          freeText: freeText || "",
          rejectedQuestions: allRejectedQuestions,
        })
      : generateQuestionPrompt({
          subject,
          chapter,
          freeText: freeText || "",
          rejectedQuestions: allRejectedQuestions,
        });

    // LLMを呼び出し（429エラー時はモデルを順次フォールバック）
    let res = null;
    let usedModel = "";
    // 最小待機時間
    let minWaitSeconds = Infinity;

    for (const model of MODEL_PRIORITY) {
      try {
        res = await groq.chat.completions.create({
          model,
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
        });
        usedModel = model;
        break; // 成功した場合はループを抜ける
      } catch (err: any) {
        console.log(err);
        if (err?.status === 429) {
          const errMsg = err.message || "";

          // 1. エラーメッセージ本文から個々の数値を正規表現で抽出
          const modelMatch = errMsg.match(/model `([^`]+)`/);
          const limitMatch = errMsg.match(/Limit (\d+)/);
          const usedMatch = errMsg.match(/Used (\d+)/);
          const requestedMatch = errMsg.match(/Requested (\d+)/);
          const timeMatch = errMsg.match(/try again in ([^\.]+)/); // 例: 8m31

          // 2. 変数化（抽出できない場合は N/A）
          const modelName = modelMatch ? modelMatch[1] : model;
          const limitTokens = limitMatch ? parseInt(limitMatch[1], 10) : null;
          const usedTokens = usedMatch ? parseInt(usedMatch[1], 10) : null;
          const requestedTokens = requestedMatch ? parseInt(requestedMatch[1], 10) : null;
          
          // 残りトークン枠の計算 (Limit - Used)
          const remainingDailyTokens = (limitTokens !== null && usedTokens !== null) 
            ? limitTokens - usedTokens 
            : null;

          // 3. ヘッダーから retry-after (秒数) を取得
          const retryAfterHeader = err.headers?.get?.('retry-after') || err.headers?.['retry-after'];
          const retryAfterSeconds = retryAfterHeader ? parseInt(retryAfterHeader, 10) : 0;
          const waitTimeText = timeMatch ? timeMatch[1] : `${retryAfterSeconds}s`;

          // 4. 個々の項目を明確に分けてログ出力
          console.warn(
            `[Rate Limit 429 - 1日上限(TPD)到達]\n` +
            `  ・対象モデル   : ${modelName}\n` +
            `  ・1日上限(Limit): ${limitTokens?.toLocaleString() ?? 'N/A'} tokens\n` +
            `  ・本日使用(Used) : ${usedTokens?.toLocaleString() ?? 'N/A'} tokens\n` +
            `  ・1日残り枠     : ${remainingDailyTokens?.toLocaleString() ?? 'N/A'} tokens\n` +
            `  ・今回要求(Req)  : ${requestedTokens?.toLocaleString() ?? 'N/A'} tokens\n` +
            `  ・次回利用可能  : 約${waitTimeText}後 (${retryAfterSeconds}秒)\n` +
            `  -> 次のフォールバックモデルへ切り替えます。`
          );

          // 5. 最小待機時間の更新判定
          if (retryAfterSeconds > 0 && retryAfterSeconds < minWaitSeconds) {
            minWaitSeconds = retryAfterSeconds;
          }

          continue; // 次のモデルへフォールバック
        }
        throw err; // それ以外のエラー（401や構文エラーなど）は例外としてスロー
      }
    }

    // 全てのモデルで429等が発生し応答が得られなかった場合
    if (!res) {
      const minWaitText = minWaitSeconds !== Infinity 
        ? `${Math.floor(minWaitSeconds / 60)}分${minWaitSeconds % 60}秒`
        : "不明";
      return NextResponse.json(
        { error: "利用制限に達したため問題生成に失敗しました。"+minWaitSeconds
         },
        { status: 429 }
      );
    }

    const content = res.choices[0].message.content;

    if (!content) {
      return NextResponse.json(
        { error: "問題の生成に失敗しました" },
        { status: 500 }
      );
    }

    // JSONをパース
    let parsedQuestion;
    try {
      // コードブロックからコンテンツを抽出
      const jsonStr = extractCodeBlock(content);
      parsedQuestion = JSON.parse(jsonStr);
    } catch (e) {
      console.error("JSON parse error:", e);
      return NextResponse.json(
        { error: "生成された問題の解析に失敗しました", rawContent: content },
        { status: 500 }
      );
    }

    // バリデーション（問題タイプに応じて分岐）
    if (questionType === "descriptive") {
      // 記述式問題のバリデーション
      if (!parsedQuestion.question || !parsedQuestion.answer) {
        return NextResponse.json(
          { error: "生成された問題の形式が正しくありません", parsedQuestion },
          { status: 500 }
        );
      }
    } else {
      // 選択式問題のバリデーション
      if (!parsedQuestion.question || !parsedQuestion.choices || !parsedQuestion.answer) {
        return NextResponse.json(
          { error: "生成された問題の形式が正しくありません", parsedQuestion },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      question: parsedQuestion,
      questionType: questionType || "choice",
      usedModel, // 実際に使用されたモデル名をレスポンスに渡す（任意）
    });
  } catch (error) {
    console.error("Error generating question:", error);
    return NextResponse.json(
      { error: "問題の生成中にエラーが発生しました" },
      { status: 500 }
    );
  }
}