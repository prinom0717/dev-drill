"use client";

import { useState } from "react";
import { QuestionRequestModal } from "@/app/_components/question-request-modal";

interface QualificationClientProps {
  qualificationId: string;
}

export function QualificationClient({ qualificationId }: QualificationClientProps) {
  const [requestModalOpen, setRequestModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setRequestModalOpen(true)}
        className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-amber-300 hover:text-amber-700"
      >
        問題追加リクエスト
      </button>
      <QuestionRequestModal
        open={requestModalOpen}
        onClose={() => setRequestModalOpen(false)}
        qualificationId={parseInt(qualificationId)}
      />
    </>
  );
}
