"use client";

import { useState, useEffect } from "react";

type ResultMarkButtonsProps = {
  questionId: number;
  currentMarks: number[];
};

export function ResultMarkButtons({ questionId, currentMarks }: ResultMarkButtonsProps) {
  const [marks, setMarks] = useState<Set<number>>(new Set(currentMarks));
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

  useEffect(() => {
    // Fetch mark config
    async function fetchConfig() {
      try {
        const response = await fetch("/api/mark/config");
        if (response.ok) {
          const configData = await response.json();
          setMarkTitles({
            1: configData.config.markType1,
            2: configData.config.markType2,
            3: configData.config.markType3,
          });
        }
      } catch (error) {
        console.error("Failed to fetch mark config:", error);
      }
    }

    fetchConfig();
  }, []);

  async function handleMarkToggle(markType: number) {
    try {
      if (marks.has(markType)) {
        // Remove mark
        await fetch(`/api/mark?questionId=${questionId}&markType=${markType}`, {
          method: "DELETE",
        });
        setMarks((prev) => {
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
            questionId,
            markType,
          }),
        });

        if (response.ok) {
          setMarks((prev) => new Set([...prev, markType]));
        }
      }
    } catch (error) {
      console.error("Failed to toggle mark:", error);
    }
  }

  return (
    <div className="flex gap-2 mt-2">
      {[1, 2, 3].map((markType) => (
        <button
          key={markType}
          type="button"
          onClick={() => handleMarkToggle(markType)}
          className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition ${
            marks.has(markType)
              ? markColors[markType as keyof typeof markColors].active
              : markColors[markType as keyof typeof markColors].inactive
          }`}
        >
          <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-current">
            {marks.has(markType) && "✓"}
          </span>
          <span>{markTitles[markType as keyof typeof markTitles]}</span>
        </button>
      ))}
    </div>
  );
}
