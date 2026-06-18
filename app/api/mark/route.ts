import { addMark, dummyUserId, getMarks, removeMark } from "@/lib/master-drill-store";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const userId = url.searchParams.get("userId") ?? dummyUserId;

  return Response.json({ marks: await getMarks(userId) });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | { questionId?: number; userId?: string; markTitle?: string }
    | null;

  if (!body?.questionId) {
    return Response.json({ message: "questionId は必須です。" }, { status: 400 });
  }

  const mark = await addMark({
    userId: body.userId ?? dummyUserId,
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
  const url = new URL(request.url);
  const questionId = Number(url.searchParams.get("questionId") ?? "0");
  const userId = url.searchParams.get("userId") ?? dummyUserId;

  const result = await removeMark({ userId, questionId });

  return Response.json({ removed: result.removed });
}