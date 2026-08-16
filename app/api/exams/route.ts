import { getExams, addExam, updateExam, deleteExam } from "@/lib/master-drill-store";
import { requireRole, isAuthError } from "@/lib/auth/require-auth";

export async function GET() {
  const exams = await getExams();
  return Response.json({ exams });
}

export async function POST(request: Request) {
  const authResult = await requireRole(request, ["admin", "editor", "host"]);
  if (isAuthError(authResult)) {
    return authResult;
  }

  try {
    const body = await request.json();
    const exam = await addExam(body);
    return Response.json({ ok: true, exam });
  } catch (err: any) {
    return Response.json({ ok: false, message: err?.message ?? String(err) }, { status: 400 });
  }
}

export async function PUT(request: Request) {
  const authResult = await requireRole(request, ["admin", "editor", "host"]);
  if (isAuthError(authResult)) {
    return authResult;
  }

  try {
    const body = await request.json();
    const { id, ...data } = body;
    const updated = await updateExam(Number(id), data);
    if (!updated) return Response.json({ ok: false, message: "Exam not found" }, { status: 404 });
    return Response.json({ ok: true, exam: updated });
  } catch (err: any) {
    return Response.json({ ok: false, message: err?.message ?? String(err) }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const authResult = await requireRole(request, ["admin", "editor", "host"]);
  if (isAuthError(authResult)) {
    return authResult;
  }

  try {
    const url = new URL(request.url);
    const idParam = url.searchParams.get("id");
    if (!idParam) {
      const body = await request.json();
      const id = Number(body?.id);
      if (!id) return Response.json({ ok: false, message: "id required" }, { status: 400 });
      await deleteExam(id);
      return Response.json({ ok: true });
    }
    await deleteExam(Number(idParam));
    return Response.json({ ok: true });
  } catch (err: any) {
    return Response.json({ ok: false, message: err?.message ?? String(err) }, { status: 400 });
  }
}
