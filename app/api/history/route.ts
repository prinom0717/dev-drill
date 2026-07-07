import { getHistory } from "@/lib/master-drill-store";
import { requireAuth, isAuthError } from "@/lib/auth/require-auth";

export async function GET(request: Request) {
  // 認証チェック
  const authResult = await requireAuth(request);
  if (isAuthError(authResult)) {
    return authResult;
  }

  const user = authResult;

  const url = new URL(request.url);
  const examId = url.searchParams.get("examId");
  const chapterId = url.searchParams.get("chapterId");

  const options: any = {};
  if (examId) options.examId = Number(examId);
  if (chapterId) options.chapterId = Number(chapterId);

  return Response.json({ history: await getHistory(user.id, options) });
}