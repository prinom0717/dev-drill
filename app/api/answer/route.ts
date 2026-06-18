import { dummyUserId, recordAnswer } from "@/lib/master-drill-store";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | { questionId?: number; userAnswer?: number | string; userId?: string }
    | null;

  if (!body?.questionId || body.userAnswer === undefined) {
    return Response.json({ message: "questionId と userAnswer は必須です。" }, { status: 400 });
  }

  const answer = await recordAnswer({
    userId: body.userId ?? dummyUserId,
    questionId: body.questionId,
    userAnswer: Number(body.userAnswer),
  });

  return Response.json({
    answer,
    isCorrect: answer.isCorrect,
    correctAnswer: answer.correctAnswer,
    question: answer.question,
  });
}