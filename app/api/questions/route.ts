import { getQuestions } from "@/lib/master-drill-store";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const qualificationId = url.searchParams.get("qualificationId") ?? "fe";
  const chapterId = Number(url.searchParams.get("chapterId") ?? "0");
  const mode = url.searchParams.get("mode") ?? "chapter";
  const count = Number(url.searchParams.get("count") ?? "10");

  const questions = getQuestions({
    qualificationId,
    chapterId: mode === "chapter" && Number.isFinite(chapterId) && chapterId > 0 ? chapterId : undefined,
    limit: Number.isFinite(count) && count > 0 ? count : undefined,
    random: mode === "random",
  });

  return Response.json({ questions });
}