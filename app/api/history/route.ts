import { dummyUserId, getHistory } from "@/lib/master-drill-store";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const userId = url.searchParams.get("userId") ?? dummyUserId;
  const examId = url.searchParams.get("examId");
  const chapterId = url.searchParams.get("chapterId");

  const options: any = {};
  if (examId) options.examId = Number(examId);
  if (chapterId) options.chapterId = Number(chapterId);

  return Response.json({ history: await getHistory(userId, options) });
}