import Link from "next/link";
import { notFound } from "next/navigation";

import {
  dummyUserId,
  getQuestionById,
  getQualificationById,
} from "@/lib/master-drill-store";

export default async function ResultPage({
  params,
  searchParams,
}: {
  params: Promise<{ qualificationId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { qualificationId } = await params;
  const query = await searchParams;
  const qualification = getQualificationById(qualificationId);

  if (!qualification) {
    notFound();
  }

  const questionId = Number(query.questionId ?? "0");
  const userAnswer = Number(query.userAnswer ?? "0");
  const isCorrect = query.isCorrect === "1";
  const currentIndex = Number(query.index ?? "0");
  const questionIds = typeof query.questionIds === "string"
    ? query.questionIds
        .split(",")
        .map((value) => Number(value))
        .filter((value) => Number.isFinite(value) && value > 0)
    : [];
  const question = getQuestionById(questionId);

  if (!question) {
    notFound();
  }

  const chosenAnswer = question.choices[userAnswer - 1] ?? "未回答";
  const correctAnswer = question.choices[question.answer - 1] ?? "未設定";
  const nextQuestionId = questionIds[currentIndex + 1] ?? null;
  const nextLink = nextQuestionId
    ? `/qualifications/${qualificationId}/play?mode=${query.mode === "random" ? "random" : "chapter"}&index=${currentIndex + 1}&questionIds=${questionIds.join(",")}${
        typeof query.chapterId === "string" ? `&chapterId=${query.chapterId}` : ""
      }`
    : `/qualifications/${qualificationId}`;

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_-48px_rgba(15,23,42,0.35)] sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-700">Result</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          {isCorrect ? "正解" : "不正解"}
        </h1>
        <p className="mt-3 text-sm text-slate-600">{qualification.name}</p>

        <div className={`mt-6 rounded-[1.5rem] border p-5 ${isCorrect ? "border-emerald-200 bg-emerald-50" : "border-rose-200 bg-rose-50"}`}>
          <p className="text-sm font-medium text-slate-600">問題</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">{question.questionText}</p>

          <dl className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-white/80 p-4">
              <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">あなたの解答</dt>
              <dd className="mt-2 text-sm font-medium text-slate-900">{chosenAnswer}</dd>
            </div>
            <div className="rounded-2xl bg-white/80 p-4">
              <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">正解</dt>
              <dd className="mt-2 text-sm font-medium text-slate-900">{correctAnswer}</dd>
            </div>
          </dl>
        </div>

        <div className="mt-6 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">解説</p>
          <p className="mt-2 leading-7 text-slate-700">{question.explanation}</p>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href={nextLink}
          className="rounded-full bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-700"
        >
          {nextQuestionId ? "次の問題へ" : "資格ページへ戻る"}
        </Link>
        {/* 解き直すボタンを追加 */}
        <Link
          href={`/qualifications/${qualificationId}/play?mode=review&questionId=${questionId}`}
          className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-amber-300 hover:text-amber-700"
        >
          この問題を解き直す
        </Link>
        <Link
          href={`/qualifications/${qualificationId}/history?userId=${dummyUserId}`}
          className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-amber-300 hover:text-amber-700"
        >
          履歴を見る
        </Link>
      </div>
      </section>
    </main>
  );
}