import { recordAnswer } from "@/lib/master-drill-store";
import { requireAuth, isAuthError } from "@/lib/auth/require-auth";

export async function POST(request: Request) {
  // 認証チェック
  const authResult = await requireAuth(request);
  if (isAuthError(authResult)) {
    return authResult;
  }

  const user = authResult;

  const body = (await request.json().catch(() => null)) as
    | { questionId?: number; userAnswer?: number | string }
    | null;

  if (!body?.questionId || body.userAnswer === undefined) {
    return Response.json({ message: "questionId と userAnswer は必須です。" }, { status: 400 });
  }

  const answer = await recordAnswer({
    userId: user.id,
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