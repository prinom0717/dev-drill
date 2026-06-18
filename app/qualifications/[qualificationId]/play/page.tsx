import Link from "next/link";
import { notFound } from "next/navigation";

import { QuizPlayClient } from "@/app/_components/quiz-play-client";
import {
  dummyUserId,
  getChapterById,
  getHistory,  // 追加
  getQualificationById,
  getQuestionById,  // 追加
  getQuestions,
} from "@/lib/master-drill-store";

function parseQuestionIds(rawValue: string | string[] | undefined) {
  if (typeof rawValue !== "string") {
    return [] as number[];
  }

  return rawValue
    .split(",")
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value) && value > 0);
}

export default async function PlayPage({
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

  const mode = query.mode === "random" || query.mode === "mistakes" || query.mode === "review" ? query.mode : "chapter";
  const chapterId = Number(query.chapterId ?? query.chapter ?? "0");
  const questionIdsFromUrl = parseQuestionIds(query.questionIds);
  const count = Number(query.count ?? "0");
  const reviewQuestionId = Number(query.questionId ?? "0");

  // 単一問題のレビューモード
  if (mode === "review" && reviewQuestionId > 0) {
    const reviewQuestion = getQuestionById(reviewQuestionId);
    if (reviewQuestion) {
      return (
        <QuizPlayClient
          qualificationId={qualificationId}
          question={reviewQuestion}
          questionIds={[reviewQuestionId]}
          currentIndex={0}
          mode="review"
          chapterId={undefined}
        />
      );
    }
  }

  // 不正解問題のみのモード
  if (mode === "mistakes") {
    const history = getHistory(dummyUserId);
    const wrongAnswers = history
      .filter((entry) => !entry.isCorrect && entry.question?.qualificationId === qualificationId)
      .map((entry) => entry.questionId)
      .filter((id, index, self) => self.indexOf(id) === index); // 重複を除去

    if (wrongAnswers.length > 0) {
      const mistakeQuestions = getQuestions({
        qualificationId,
      }).filter((question) => wrongAnswers.includes(question.id));

      return (
        <QuizPlayClient
          qualificationId={qualificationId}
          question={mistakeQuestions[0]}
          questionIds={mistakeQuestions.map((q) => q.id)}
          currentIndex={0}
          mode="mistakes"
          chapterId={undefined}
        />
      );
    }
  }

    const questions = getQuestions({
    qualificationId,
    chapterId: mode === "chapter" ? chapterId : undefined,
    random: mode === "random",
    limit: count > 0 ? count : undefined,
    });
  const orderedQuestions =
    questionIdsFromUrl.length > 0
      ? questionIdsFromUrl
          .map((questionId) => questions.find((question) => question.id === questionId))
          .filter((question): question is NonNullable<typeof question> => Boolean(question))
      : questions;
  const currentIndex = Number(query.index ?? "0");
  const currentQuestion = orderedQuestions[currentIndex] ?? orderedQuestions[0] ?? null;

  const chapter =
    mode === "chapter" && Number.isFinite(chapterId)
      ? getChapterById(qualificationId, chapterId)
      : null;

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_-48px_rgba(15,23,42,0.35)] sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-700">Practice</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              {qualification.name}
            </h1>
            <p className="mt-3 text-sm text-slate-600">
              {mode === "mistakes"
                ? `不正解問題 ${orderedQuestions.length} 問を復習`
                : mode === "random"
                ? `ランダム出題 ${orderedQuestions.length} 問を1問ずつ`
                : chapter
                ? `${chapter.title} を1問ずつ解く`
                : "章別出題"}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href={`/qualifications/${qualificationId}`}
              className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-amber-300 hover:text-amber-700"
            >
              資格ページへ戻る
            </Link>
            <Link
              href={`/qualifications/${qualificationId}/history`}
              className="rounded-full bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-700"
            >
              履歴を見る
            </Link>
          </div>
        </div>
      </section>

      {currentQuestion === null ? (
        <section className="rounded-[1.5rem] border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">
          この条件では問題が見つかりませんでした。
        </section>
      ) : (
        <QuizPlayClient
          qualificationId={qualificationId}
          question={currentQuestion}
          questionIds={orderedQuestions.map((question) => question.id)}
          currentIndex={currentIndex}
          mode={mode}
          chapterId={chapterId}
        />
      )}
    </main>
  );
}