import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { chapterId, questionText, choices, answer, explanation } = body;

    // バリデーション
    if (!chapterId) {
      return NextResponse.json(
        { error: "章IDは必須です" },
        { status: 400 }
      );
    }

    if (!questionText || questionText.trim().length === 0) {
      return NextResponse.json(
        { error: "問題文は必須です" },
        { status: 400 }
      );
    }

    if (!choices || !Array.isArray(choices) || choices.length !== 4) {
      return NextResponse.json(
        { error: "選択肢は4つ必要です" },
        { status: 400 }
      );
    }

    if (typeof answer !== 'number' || answer < 1 || answer > 4) {
      return NextResponse.json(
        { error: "正解番号は1〜4の範囲で指定してください" },
        { status: 400 }
      );
    }

    // 不採用問題を保存
    const rejectedQuestion = await prisma.rejectedQuestion.create({
      data: {
        chapter_id: chapterId,
        question_text: questionText,
        choices: choices,
        answer: answer,
        explanation: explanation || null,
      },
    });

    return NextResponse.json({
      success: true,
      rejectedQuestion,
    });
  } catch (error) {
    console.error("Error saving rejected question:", error);
    return NextResponse.json(
      { error: "不採用問題の保存中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
