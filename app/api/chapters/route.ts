import { getChapters, addChapter, updateChapter, deleteChapter } from "@/lib/master-drill-store";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const examId = url.searchParams.get("examId");
  
  if (!examId) {
    return Response.json({ ok: false, message: "examId required" }, { status: 400 });
  }

  try {
    const chapters = await getChapters(Number(examId));
    return Response.json({ chapters });
  } catch (err: any) {
    return Response.json({ ok: false, message: err?.message ?? String(err) }, { status: 400 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const chapter = await addChapter(body);
    return Response.json({ ok: true, chapter });
  } catch (err: any) {
    return Response.json({ ok: false, message: err?.message ?? String(err) }, { status: 400 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...data } = body;
    const updated = await updateChapter(Number(id), data);
    if (!updated) return Response.json({ ok: false, message: "Chapter not found" }, { status: 404 });
    return Response.json({ ok: true, chapter: updated });
  } catch (err: any) {
    return Response.json({ ok: false, message: err?.message ?? String(err) }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const idParam = url.searchParams.get("id");
    if (!idParam) {
      const body = await request.json();
      const id = Number(body?.id);
      if (!id) return Response.json({ ok: false, message: "id required" }, { status: 400 });
      await deleteChapter(id);
      return Response.json({ ok: true });
    }
    await deleteChapter(Number(idParam));
    return Response.json({ ok: true });
  } catch (err: any) {
    return Response.json({ ok: false, message: err?.message ?? String(err) }, { status: 400 });
  }
}
