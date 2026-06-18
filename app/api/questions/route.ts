import { getQuestions, addQuestion, updateQuestion, deleteQuestion } from "@/lib/master-drill-store";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const qualificationId = url.searchParams.get("qualificationId") ?? "fe";
  const chapterId = Number(url.searchParams.get("chapterId") ?? "0");
  const mode = url.searchParams.get("mode") ?? "chapter";
  const count = Number(url.searchParams.get("count") ?? "10");

  const questions = await getQuestions({
    qualificationId,
    chapterId: mode === "chapter" && Number.isFinite(chapterId) && chapterId > 0 ? chapterId : undefined,
    limit: Number.isFinite(count) && count > 0 ? count : undefined,
    random: mode === "random",
  });

  return Response.json({ questions });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const question = await addQuestion(body);
    return Response.json({ ok: true, question });
  } catch (err: any) {
    return Response.json({ ok: false, message: err?.message ?? String(err) }, { status: 400 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const updated = await updateQuestion(body);
    if (!updated) return Response.json({ ok: false, message: "Question not found" }, { status: 404 });
    return Response.json({ ok: true, question: updated });
  } catch (err: any) {
    return Response.json({ ok: false, message: err?.message ?? String(err) }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const idParam = url.searchParams.get("id");
    let id = idParam ? Number(idParam) : undefined;
    if (!id) {
      const body = await request.json();
      id = Number(body?.id);
    }

    if (!id) return Response.json({ ok: false, message: "id required" }, { status: 400 });

    const removed = await deleteQuestion(id);
    return Response.json({ ok: true, removed });
  } catch (err: any) {
    return Response.json({ ok: false, message: err?.message ?? String(err) }, { status: 400 });
  }
}