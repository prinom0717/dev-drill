import Groq from "groq-sdk";
import { NextResponse } from "next/server";
import { generateGradeAnswerPrompt } from "@/lib/prompt-template";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

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
    const { questionText, correctAnswer, userAnswer, acceptableAnswers } = body;

    // バリデーション
    if (!questionText || !correctAnswer || !userAnswer) {
      return NextResponse.json(
        { error: "問題文、正解、ユーザーの回答は必須です" },
        { status: 400 }
      );
    }

    // プロンプトを生成
    const prompt = generateGradeAnswerPrompt({
      questionText,
      correctAnswer,
      userAnswer,
      acceptableAnswers,
    });

    // LLMを呼び出し
    const res = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3, // 判定は低めの温度で安定させる
    });

    const content = res.choices[0].message.content;

    if (!content) {
      return NextResponse.json(
        { error: "回答の判定に失敗しました" },
        { status: 500 }
      );
    }

    // JSONをパース
    let parsedResult;
    try {
      // コードブロックからコンテンツを抽出
      const jsonStr = extractCodeBlock(content);
      parsedResult = JSON.parse(jsonStr);
    } catch (e) {
      console.error("JSON parse error:", e);
      return NextResponse.json(
        { error: "判定結果の解析に失敗しました", rawContent: content },
        { status: 500 }
      );
    }

    // バリデーション
    if (typeof parsedResult.isCorrect !== "boolean") {
      return NextResponse.json(
        { error: "判定結果の形式が正しくありません", parsedResult },
        { status: 500 }
      );
    }

    return NextResponse.json({
      isCorrect: parsedResult.isCorrect,
      confidence: parsedResult.confidence || 0.5,
      reasoning: parsedResult.reasoning || "",
    });
  } catch (error) {
    console.error("Error grading answer:", error);
    return NextResponse.json(
      { error: "回答の判定中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
