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
  const qualification = await getQualificationById(qualificationId);

  if (!qualification) {
    notFound();
  }

  const mode: "random" | "mistakes" | "review" | "unanswered" | "chapter" = query.mode === "random" || query.mode === "mistakes" || query.mode === "review" || query.mode === "unanswered" ? query.mode : "chapter";
  const chapterId = Number(query.chapterId ?? query.chapter ?? "0");
  const questionIdsFromUrl = parseQuestionIds(query.questionIds);
  const count = Number(query.count ?? "0");
  const reviewQuestionId = Number(query.questionId ?? "0");

  let orderedQuestions: any[] = [];
  let currentQuestion: any = null;
  let currentIndex = 0;
  let chapter: any = null;

  // 単一問題のレビューモード
  if (mode === "review" && reviewQuestionId > 0) {
    const reviewQuestion = await getQuestionById(reviewQuestionId);
    if (reviewQuestion) {
      orderedQuestions = [reviewQuestion];
      currentQuestion = reviewQuestion;
      currentIndex = 0;
    }
  } else if (mode === "mistakes") {
    // 不正解問題のみのモード
    const history = await getHistory(dummyUserId);
    const wrongAnswers = history
      .filter((entry: any) => !entry.latestAnswer.isCorrect && entry.question?.qualificationId === qualificationId)
      .map((entry: any) => entry.questionId)
      .filter((id: any, index: any, self: any) => self.indexOf(id) === index); // 重複を除去

    let mistakeQuestions: any[] = [];
    if (wrongAnswers.length > 0) {
      mistakeQuestions = (await getQuestions({
        qualificationId,
      })).filter((question: any) => wrongAnswers.includes(question.id));
    }

    orderedQuestions = mistakeQuestions;
    currentQuestion = mistakeQuestions[0] || null;
    currentIndex = 0;
  } else if (mode === "unanswered") {
    // 未出題問題のみのモード
    const history = await getHistory(dummyUserId, { examId: Number(qualificationId) });
    const answeredQuestionIds = history
      .map((entry: any) => entry.questionId)
      .filter((id: any, index: any, self: any) => self.indexOf(id) === index); // 重複を除去

    const allQuestions = await getQuestions({
      qualificationId,
    });

    const unansweredQuestions = allQuestions.filter((question: any) => !answeredQuestionIds.includes(question.id));
    orderedQuestions = unansweredQuestions;
    currentQuestion = unansweredQuestions[0] || null;
    currentIndex = 0;
  } else {
    // random or chapter mode
    if (questionIdsFromUrl.length > 0) {
      // URL から questionIds が渡されている場合、個別に取得して整合性を保証
      const questionsFromIds = await Promise.all(
        questionIdsFromUrl.map((questionId) => getQuestionById(questionId))
      );
      orderedQuestions = questionsFromIds.filter((q): q is NonNullable<typeof q> => q !== null);
    } else {
      // 初回アクセス時は getQuestions() を使用
      const questions = await getQuestions({
        qualificationId,
        chapterId: mode === "chapter" ? chapterId : undefined,
        random: mode === "random",
        limit: count > 0 ? count : (mode === "random" ? 10 : undefined),
      });
      orderedQuestions = questions;
    }
    currentIndex = Number(query.index ?? "0");
    currentQuestion = orderedQuestions[currentIndex] ?? orderedQuestions[0] ?? null;

    chapter =
      mode === "chapter" && Number.isFinite(chapterId)
        ? await getChapterById(qualificationId, chapterId)
        : null;
  }

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
              {mode === "random"
                ? `ランダム出題 ${orderedQuestions.length} 問を1問ずつ`
                : mode === "review"
                ? "単一問題の復習"
                : mode === "unanswered"
                ? `未出題問題 ${orderedQuestions.length} 問を1問ずつ解く`
                : mode === "mistakes"
                ? `間違えた問題 ${orderedQuestions.length} 問を1問ずつ解く`
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
          {mode === "unanswered" ? (
            <div>
              <p className="text-lg font-semibold">未出題問題はありません</p>
              <p className="mt-2 text-sm">すべての問題に解答済みです。他のモードをお試しください。</p>
            </div>
          ) : mode === "mistakes" ? (
            <div>
              <p className="text-lg font-semibold">間違えた問題はありません</p>
              <p className="mt-2 text-sm">すべての問題を正解しています。素晴らしい！</p>
            </div>
          ) : (
            <p>この条件では問題が見つかりませんでした。</p>
          )}
        </section>
      ) : (
        <QuizPlayClient
          qualificationId={qualificationId}
          question={currentQuestion}
          questionIds={orderedQuestions.map((question: any) => question.id)}
          currentIndex={currentIndex}
          mode={mode}
          chapterId={chapterId}
        />
      )}
    </main>
  );
}