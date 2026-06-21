import { bulkAddQuestion, getExamIdByName, getChapterIdByTitle } from "@/lib/master-drill-store";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { questions } = body;

    if (!Array.isArray(questions)) {
      return Response.json({ ok: false, message: "questions must be an array" }, { status: 400 });
    }

    // 試験名・章名からIDを解決
    const resolvedQuestions = await Promise.all(questions.map(async (q: any) => {
      // 試験名から試験IDを取得
      if (q.examName) {
        const examId = await getExamIdByName(q.examName);
        if (!examId) {
          return { ...q, error: `試験「${q.examName}」が見つかりません` };
        }
        q.qualificationId = String(examId);
      }

      // 章名から章IDを取得
      if (q.chapterTitle && q.qualificationId) {
        const examId = Number(q.qualificationId);
        const chapterId = await getChapterIdByTitle(examId, q.chapterTitle);
        if (!chapterId) {
          return { ...q, error: `章「${q.chapterTitle}」が見つかりません` };
        }
        q.chapterId = chapterId;
      }

      return q;
    }));

    // エラーがあるものをフィルタリング
    const errors = resolvedQuestions.filter((q: any) => q.error);
    const validQuestions = resolvedQuestions.filter((q: any) => !q.error);

    if (errors.length > 0) {
      return Response.json({ 
        ok: false, 
        message: `${errors.length}件のエラーがあります: ${errors.map((e: any) => e.error).join(", ")}`,
        errors 
      }, { status: 400 });
    }

    const results = await bulkAddQuestion(validQuestions);
    return Response.json({ ok: true, results });
  } catch (err: any) {
    return Response.json({ ok: false, message: err?.message ?? String(err) }, { status: 400 });
  }
}
