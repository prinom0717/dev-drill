"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { CircularProgress, Box, Button } from "@mui/material";

import type { Question } from "@/lib/master-drill-store";
import { QuestionIssueModal } from "./question-issue-modal";
import { DescriptiveAnswerInput } from "./descriptive-answer-input";

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [issueModalOpen, setIssueModalOpen] = useState(false);
  const [currentMarks, setCurrentMarks] = useState<Set<number>>(new Set());
  const [markTitles, setMarkTitles] = useState<{ 1: string; 2: string; 3: string }>({
    1: "チェック1",
    2: "チェック2",
    3: "チェック3",
  });

  const markColors = {
    1: {
      active: "border-amber-500 bg-amber-50 text-amber-700",
      inactive: "border-slate-200 bg-slate-50 text-slate-600 hover:border-amber-300 hover:bg-amber-50",
    },
    2: {
      active: "border-blue-500 bg-blue-50 text-blue-700",
      inactive: "border-slate-200 bg-slate-50 text-slate-600 hover:border-blue-300 hover:bg-blue-50",
    },
    3: {
      active: "border-green-500 bg-green-50 text-green-700",
      inactive: "border-slate-200 bg-slate-50 text-slate-600 hover:border-green-300 hover:bg-green-50",
    },
  };

  // Fetch current marks and mark config when question changes
  useEffect(() => {
    if (!question) return;

    async function fetchMarks() {
      try {
        // Fetch current marks for this question
        const marksResponse = await fetch("/api/mark");
        if (marksResponse.ok) {
          const marksData = await marksResponse.json();
          const questionMarks = marksData.marks
            .filter((m: any) => m.questionId === question.id)
            .map((m: any) => m.markType);
          setCurrentMarks(new Set(questionMarks));
        }

        // Fetch mark config
        const configResponse = await fetch("/api/mark/config");
        if (configResponse.ok) {
          const configData = await configResponse.json();
          setMarkTitles({
            1: configData.config.markType1,
            2: configData.config.markType2,
            3: configData.config.markType3,
          });
        }
      } catch (error) {
        console.error("Failed to fetch marks:", error);
      }
    }

    fetchMarks();
  }, [question]);

  async function handleMarkToggle(markType: number) {
    if (!question) return;

    try {
      if (currentMarks.has(markType)) {
        // Remove mark
        await fetch(`/api/mark?questionId=${question.id}&markType=${markType}`, {
          method: "DELETE",
        });
        setCurrentMarks((prev) => {
          const newSet = new Set(prev);
          newSet.delete(markType);
          return newSet;
        });
      } else {
        // Add mark
        const response = await fetch("/api/mark", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            questionId: question.id,
            markType,
          }),
        });

        if (response.ok) {
          setCurrentMarks((prev) => new Set([...prev, markType]));
        }
      }
    } catch (error) {
      console.error("Failed to toggle mark:", error);
    }
  }

  async function handleAnswer(questionId: number, userAnswer: number | string) {
    setPendingQuestionId(questionId);
    setIsSubmitting(true);
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
      setIsSubmitting(false);
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
    <div className="relative space-y-4">
      {isSubmitting && (
        <Box 
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            bgcolor: "rgba(255,255,255,0.7)",
            zIndex: 10,
            borderRadius: "1.5rem",
            gap: 2,
          }}
        >
          <CircularProgress />
          <span className="text-sm text-slate-600">
            {question?.questionType === "descriptive" ? "AIで判定中..." : "処理中..."}
          </span>
        </Box>
      )}
      
      {errorMessage ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {errorMessage}
        </div>
      ) : null}

      {!question ? null : (
        <article className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_20px_50px_-44px_rgba(15,23,42,0.3)]">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
              <span>Q{currentIndex + 1}</span>
              <span className="h-1 w-1 rounded-full bg-amber-300" />
              <span>難易度 {question.difficulty}</span>
            </div>
            <div className="flex gap-2">
              <Button
                size="small"
                variant="outlined"
                onClick={() => setIssueModalOpen(true)}
                disabled={pendingQuestionId !== null}
                sx={{ fontSize: '0.75rem' }}
              >
                不備を起票
              </Button>
            </div>
          </div>
          <h3 className="mt-3 text-lg font-semibold text-slate-900" style={{ margin: "0 10px", whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{question.questionText}</h3>

          {question.questionType === "choice" ? (
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
                  <span className="leading-6" style={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>{choice}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="mt-4">
              <DescriptiveAnswerInput
                onSubmit={(answer) => handleAnswer(question.id, answer)}
                disabled={pendingQuestionId !== null}
                isLoading={isSubmitting}
              />
            </div>
          )}
        </article>
      )}

      {/* Mark buttons - separate section */}
      {question && (
        <article className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_20px_50px_-44px_rgba(15,23,42,0.3)]">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">チェックマーク</p>
          <div className="mt-4 flex gap-2">
            {[1, 2, 3].map((markType) => (
              <button
                key={markType}
                type="button"
                onClick={() => handleMarkToggle(markType)}
                disabled={pendingQuestionId !== null}
                className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition ${
                  currentMarks.has(markType)
                    ? markColors[markType as keyof typeof markColors].active
                    : markColors[markType as keyof typeof markColors].inactive
                }`}
              >
                <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-current">
                  {currentMarks.has(markType) && "✓"}
                </span>
                <span>{markTitles[markType as keyof typeof markTitles]}</span>
              </button>
            ))}
          </div>
        </article>
      )}

      {question && (
        <QuestionIssueModal
          open={issueModalOpen}
          onClose={() => setIssueModalOpen(false)}
          questionId={question.id}
        />
      )}
    </div>
  );
}