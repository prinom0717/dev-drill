import { addMark, getMarks, removeMark } from "@/lib/master-drill-store";
import { requireAuth, isAuthError } from "@/lib/auth/require-auth";

export async function GET(request: Request) {
  // 認証チェック
  const authResult = await requireAuth(request);
  if (isAuthError(authResult)) {
    return authResult;
  }

  const user = authResult;

  return Response.json({ marks: await getMarks(user.id) });
}

export async function POST(request: Request) {
  // 認証チェック
  const authResult = await requireAuth(request);
  if (isAuthError(authResult)) {
    return authResult;
  }

  const user = authResult;

  const body = (await request.json().catch(() => null)) as
    | { questionId?: number; markTitle?: string }
    | null;

  if (!body?.questionId) {
    return Response.json({ message: "questionId は必須です。" }, { status: 400 });
  }

  const mark = await addMark({
    userId: user.id,
    questionId: body.questionId,
    markTitle: body.markTitle,
  });

  if (!mark) {
    return Response.json({ message: "問題が見つかりません。" }, { status: 404 });
  }

  if ("ok" in mark && mark.ok === false) {
    return Response.json({ message: mark.message }, { status: 409 });
  }

  return Response.json({ mark });
}

export async function DELETE(request: Request) {
  // 認証チェック
  const authResult = await requireAuth(request);
  if (isAuthError(authResult)) {
    return authResult;
  }

  const user = authResult;

  const url = new URL(request.url);
  const questionId = Number(url.searchParams.get("questionId") ?? "0");

  const result = await removeMark({ userId: user.id, questionId });

  return Response.json({ removed: result.removed });
}