import Groq from "groq-sdk";
import { NextResponse } from "next/server";
import { generateQuestionPrompt } from "@/lib/prompt-template";
import { prisma } from "@/lib/prisma";

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
    const { subject, chapter, freeText } = body;

    // バリデーション
    if (!subject || !chapter) {
      return NextResponse.json(
        { error: "科目と章は必須です" },
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

    // プロンプトを生成
    const prompt = generateQuestionPrompt({
      subject,
      chapter,
      freeText: freeText || "",
      rejectedQuestions,
    });

    // LLMを呼び出し
    const res = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

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

    // バリデーション
    if (!parsedQuestion.question || !parsedQuestion.choices || !parsedQuestion.answer) {
      return NextResponse.json(
        { error: "生成された問題の形式が正しくありません", parsedQuestion },
        { status: 500 }
      );
    }

    return NextResponse.json({
      question: parsedQuestion,
    });
  } catch (error) {
    console.error("Error generating question:", error);
    return NextResponse.json(
      { error: "問題の生成中にエラーが発生しました" },
      { status: 500 }
    );
  }
}