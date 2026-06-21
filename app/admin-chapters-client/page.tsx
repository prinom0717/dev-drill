"use client";

import { useEffect, useState } from "react";

type Exam = { id: number; examName: string; description: string };
type Chapter = { id: number; examId: number; chapterNumber: number; chapterTitle: string; coverage: string | null };

export default function AdminChaptersClient() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    fetchExams();
  }, []);

  useEffect(() => {
    if (selectedExamId) {
      fetchChapters(selectedExamId);
    } else {
      setChapters([]);
    }
  }, [selectedExamId]);

  async function fetchExams() {
    try {
      const res = await fetch("/api/exams");
      const data = await res.json();
      setExams(data.exams || []);
      if (data.exams && data.exams.length > 0) {
        setSelectedExamId(data.exams[0].id);
      }
    } catch (e) {
      console.error("Failed to fetch exams", e);
    }
  }

  async function fetchChapters(examId: number) {
    setLoading(true);
    try {
      const res = await fetch(`/api/chapters?examId=${examId}`);
      const data = await res.json();
      setChapters(data.chapters || []);
    } catch (e) {
      console.error("Failed to fetch chapters", e);
    }
    setLoading(false);
  }

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedExamId) {
      alert("試験を選択してください");
      return;
    }

    const form = e.currentTarget;
    const fd = new FormData(form);
    const payload = {
      examId: selectedExamId,
      chapterNumber: Number(fd.get("chapterNumber") || 1),
      chapterTitle: String(fd.get("chapterTitle") || ""),
      coverage: String(fd.get("coverage") || ""),
    };

    try {
      await fetch("/api/chapters", { method: "POST", body: JSON.stringify(payload) });
      form.reset();
      await fetchChapters(selectedExamId);
    } catch (e) {
      console.error("Failed to add chapter", e);
      alert("章の追加に失敗しました");
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("削除してよいですか？関連する問題も削除されます。")) return;
    try {
      await fetch(`/api/chapters?id=${id}`, { method: "DELETE" });
      if (selectedExamId) await fetchChapters(selectedExamId);
    } catch (e) {
      console.error("Failed to delete chapter", e);
      alert("削除に失敗しました");
    }
  }

  async function handleUpdate(id: number, chapterNumber: number, chapterTitle: string, coverage: string) {
    try {
      await fetch("/api/chapters", {
        method: "PUT",
        body: JSON.stringify({ id, chapterNumber, chapterTitle, coverage }),
      });
      setEditingId(null);
      if (selectedExamId) await fetchChapters(selectedExamId);
    } catch (e) {
      console.error("Failed to update chapter", e);
      alert("更新に失敗しました");
    }
  }

  return (
    <div className="prose mx-auto max-w-4xl p-6">
      <h1 className="text-xl font-semibold">章管理</h1>

      <form onSubmit={handleAdd} className="space-y-2 rounded-md border p-4">
        <div className="flex gap-2">
          <select
            value={selectedExamId || ""}
            onChange={(e) => setSelectedExamId(Number(e.target.value) || null)}
            className="w-48 rounded border px-2"
          >
            <option value="">試験を選択</option>
            {exams.map((exam) => (
              <option key={exam.id} value={exam.id}>
                {exam.examName}
              </option>
            ))}
          </select>
          <input name="chapterNumber" placeholder="章番号" className="w-24 rounded border px-2" />
        </div>
        <input name="chapterTitle" placeholder="章タイトル" className="w-full rounded border px-2" />
        <input name="coverage" placeholder="範囲（任意）" className="w-full rounded border px-2" />
        <div>
          <button className="rounded bg-amber-600 px-4 py-2 text-white">追加</button>
        </div>
      </form>

      <div className="mt-6">
        <h2 className="text-lg font-semibold">既存の章 ({chapters.length})</h2>
        {loading ? (
          <p>読み込み中…</p>
        ) : (
          <ul className="space-y-2">
            {chapters.map((chapter: any) => (
              <li key={chapter.id} className="rounded border p-3">
                {editingId === chapter.id ? (
                  <div className="space-y-2">
                    <input
                      type="number"
                      defaultValue={chapter.chapterNumber}
                      id={`edit-chapter-num-${chapter.id}`}
                      className="w-24 rounded border px-2"
                    />
                    <input
                      defaultValue={chapter.chapterTitle}
                      id={`edit-chapter-title-${chapter.id}`}
                      className="w-full rounded border px-2"
                    />
                    <input
                      defaultValue={chapter.coverage || ""}
                      id={`edit-chapter-coverage-${chapter.id}`}
                      className="w-full rounded border px-2"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          const numInput = document.getElementById(`edit-chapter-num-${chapter.id}`) as HTMLInputElement;
                          const titleInput = document.getElementById(`edit-chapter-title-${chapter.id}`) as HTMLInputElement;
                          const coverageInput = document.getElementById(`edit-chapter-coverage-${chapter.id}`) as HTMLInputElement;
                          handleUpdate(
                            chapter.id,
                            Number(numInput.value),
                            titleInput.value,
                            coverageInput.value
                          );
                        }}
                        className="rounded bg-blue-600 px-3 py-1 text-sm text-white"
                      >
                        保存
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="rounded border px-3 py-1 text-sm"
                      >
                        キャンセル
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-sm font-medium">
                        第{chapter.chapterNumber}章: {chapter.chapterTitle}
                      </div>
                      {chapter.coverage && (
                        <div className="text-xs text-slate-600">{chapter.coverage}</div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingId(chapter.id)}
                        className="rounded border px-3 py-1 text-sm"
                      >
                        編集
                      </button>
                      <button
                        onClick={() => handleDelete(chapter.id)}
                        className="rounded bg-red-600 px-3 py-1 text-sm text-white"
                      >
                        削除
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
