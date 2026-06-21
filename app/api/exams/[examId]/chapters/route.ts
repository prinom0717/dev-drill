import { getChapters } from "@/lib/master-drill-store";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ examId: string }> }
) {
  const { examId } = await params;
  const examIdNum = Number(examId);
  if (isNaN(examIdNum)) {
    return Response.json({ error: "Invalid examId" }, { status: 400 });
  }

  const chapters = await getChapters(examIdNum);
  return Response.json({ chapters });
}
