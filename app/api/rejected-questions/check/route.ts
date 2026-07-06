import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isSimilarText } from "@/lib/utils";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { questionText } = body;

    // バリデーション
    if (!questionText || questionText.trim().length === 0) {
      return NextResponse.json(
        { error: "問題文は必須です" },
        { status: 400 }
      );
    }

    // 不採用問題をすべて取得
    const rejectedQuestions = await prisma.rejectedQuestion.findMany({
      select: {
        id: true,
        question_text: true,
      },
    });

    // 類似度チェック
    const similarQuestions = rejectedQuestions.filter((rq) => {
      return isSimilarText(questionText, rq.question_text, 0.9);
    });

    if (similarQuestions.length > 0) {
      return NextResponse.json({
        isDuplicate: true,
        message: "過去に不採用となった問題と類似しています",
        similarCount: similarQuestions.length,
      });
    }

    return NextResponse.json({
      isDuplicate: false,
      message: "重複する問題は見つかりませんでした",
    });
  } catch (error) {
    console.error("Error checking duplicate question:", error);
    return NextResponse.json(
      { error: "重複チェック中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
