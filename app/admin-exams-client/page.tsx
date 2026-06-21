"use client";

import { useEffect, useState } from "react";

type Exam = { id: number; examName: string; description: string };

export default function AdminExamsClient() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    fetchExams();
  }, []);

  async function fetchExams() {
    setLoading(true);
    try {
      const res = await fetch("/api/exams");
      const data = await res.json();
      setExams(data.exams || []);
    } catch (e) {
      console.error("Failed to fetch exams", e);
    }
    setLoading(false);
  }

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const payload = {
      examName: String(fd.get("examName") || ""),
      description: String(fd.get("description") || ""),
    };

    try {
      await fetch("/api/exams", { method: "POST", body: JSON.stringify(payload) });
      form.reset();
      await fetchExams();
    } catch (e) {
      console.error("Failed to add exam", e);
      alert("試験の追加に失敗しました");
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("削除してよいですか？関連する章と問題も削除されます。")) return;
    try {
      await fetch(`/api/exams?id=${id}`, { method: "DELETE" });
      await fetchExams();
    } catch (e) {
      console.error("Failed to delete exam", e);
      alert("削除に失敗しました");
    }
  }

  async function handleUpdate(id: number, examName: string, description: string) {
    try {
      await fetch("/api/exams", {
        method: "PUT",
        body: JSON.stringify({ id, examName, description }),
      });
      setEditingId(null);
      await fetchExams();
    } catch (e) {
      console.error("Failed to update exam", e);
      alert("更新に失敗しました");
    }
  }

  return (
    <div className="prose mx-auto max-w-4xl p-6">
      <h1 className="text-xl font-semibold">試験管理</h1>

      <form onSubmit={handleAdd} className="space-y-2 rounded-md border p-4">
        <input name="examName" placeholder="試験名" className="w-full rounded border px-2" />
        <input name="description" placeholder="説明" className="w-full rounded border px-2" />
        <div>
          <button className="rounded bg-amber-600 px-4 py-2 text-white">追加</button>
        </div>
      </form>

      <div className="mt-6">
        <h2 className="text-lg font-semibold">既存の試験 ({exams.length})</h2>
        {loading ? (
          <p>読み込み中…</p>
        ) : (
          <ul className="space-y-2">
            {exams.map((exam: any) => (
              <li key={exam.id} className="rounded border p-3">
                {editingId === exam.id ? (
                  <div className="space-y-2">
                    <input
                      defaultValue={exam.examName}
                      id={`edit-exam-name-${exam.id}`}
                      className="w-full rounded border px-2"
                    />
                    <input
                      defaultValue={exam.description}
                      id={`edit-exam-desc-${exam.id}`}
                      className="w-full rounded border px-2"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          const nameInput = document.getElementById(`edit-exam-name-${exam.id}`) as HTMLInputElement;
                          const descInput = document.getElementById(`edit-exam-desc-${exam.id}`) as HTMLInputElement;
                          handleUpdate(exam.id, nameInput.value, descInput.value);
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
                      <div className="text-sm font-medium">{exam.examName}</div>
                      <div className="text-xs text-slate-600">{exam.description}</div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingId(exam.id)}
                        className="rounded border px-3 py-1 text-sm"
                      >
                        編集
                      </button>
                      <button
                        onClick={() => handleDelete(exam.id)}
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
