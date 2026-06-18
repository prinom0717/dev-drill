import { dummyUserId, getHistory } from "@/lib/master-drill-store";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const userId = url.searchParams.get("userId") ?? dummyUserId;

  return Response.json({ history: getHistory(userId) });
}