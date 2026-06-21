"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import type { Question } from "@/lib/master-drill-store";

type Props = {
  qualificationId: string;
  question: Question;
  questionIds: number[];
  currentIndex: number;
  mode: "chapter" | "random" | "mistakes" | "review" | "unanswered";
  chapterId?: number;
};

export function QuizPlayClient({
  qualificationId,
  question,
  questionIds,
  currentIndex,
  mode,
  chapterId,
}: Props) {
  const router = useRouter();
  const [pendingQuestionId, setPendingQuestionId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleAnswer(questionId: number, userAnswer: number) {
    setPendingQuestionId(questionId);
    setErrorMessage(null);

    const response = await fetch("/api/answer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        questionId,
        userAnswer: String(userAnswer),
      }),
    });

    if (!response.ok) {
      setPendingQuestionId(null);
      setErrorMessage("解答の保存に失敗しました。");
      return;
    }

    const payload = (await response.json()) as {
      isCorrect: boolean;
      correctAnswer: number;
    };

    const searchParams = new URLSearchParams({
      questionId: String(questionId),
      userAnswer: String(userAnswer),
      isCorrect: payload.isCorrect ? "1" : "0",
      mode,
      index: String(currentIndex),
      questionIds: questionIds.join(","),
    });

    if (typeof chapterId === "number") {
      searchParams.set("chapterId", String(chapterId));
    }

    router.push(`/qualifications/${qualificationId}/result?${searchParams.toString()}`);
  }

  return (
    <div className="space-y-4">
      {errorMessage ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {errorMessage}
        </div>
      ) : null}

      <article className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_20px_50px_-44px_rgba(15,23,42,0.3)]">
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
          <span>Q{currentIndex + 1}</span>
          <span className="h-1 w-1 rounded-full bg-amber-300" />
          <span>難易度 {question.difficulty}</span>
        </div>
        <h3 className="mt-3 text-lg font-semibold text-slate-900">{question.questionText}</h3>

        <div className="mt-4 grid gap-3">
          {question.choices.map((choice, choiceIndex) => (
            <button
                key={choice}
                type="button"
                disabled={pendingQuestionId !== null}
                onTouchStart={() => handleAnswer(question.id, choiceIndex + 1)}
                onClick={() => handleAnswer(question.id, choiceIndex + 1)}
                className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm text-slate-800 transition hover:border-amber-300 hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
              <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-xs font-semibold text-amber-700">
                {choiceIndex + 1}
                </span>
              <span className="leading-6">{choice}</span>
            </button>
          ))}
        </div>
      </article>
    </div>
  );
}