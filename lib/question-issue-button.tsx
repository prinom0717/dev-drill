"use client";

import { QuestionIssueModal } from "@/app/_components/question-issue-modal";
import { useState } from "react";

interface QuestionIssueButtonProps {
  questionId: number;
}

export function QuestionIssueButton({ questionId }: QuestionIssueButtonProps) {
  const [issueModalOpen, setIssueModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIssueModalOpen(true)}
        className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-amber-300 hover:text-amber-700"
      >
        不備を起票
      </button>
      <QuestionIssueModal
        open={issueModalOpen}
        onClose={() => setIssueModalOpen(false)}
        questionId={questionId}
      />
    </>
  );
}
