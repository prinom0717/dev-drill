"use client";

import { useEffect, useState } from "react";

type Question = any;

export default function AdminQuestionsClient() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchList();
  }, []);

  async function fetchList() {
    setLoading(true);
    const res = await fetch(`/api/questions?count=200`);
    const data = await res.json();
    setQuestions(data.questions || []);
    setLoading(false);
  }

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const payload = {
      qualificationId: String(fd.get("qualificationId") || "fe"),
      chapterId: Number(fd.get("chapterId") || 1),
      questionType: "choice",
      questionText: String(fd.get("questionText") || ""),
      choices: String(fd.get("choices") || "").split(",").map((s: any) => s.trim()).filter(Boolean),
      answer: Number(fd.get("answer") || 1),
      explanation: String(fd.get("explanation") || ""),
      difficulty: Number(fd.get("difficulty") || 1),
    };

    await fetch(`/api/questions`, { method: "POST", body: JSON.stringify(payload) });
    form.reset();
    await fetchList();
  }

  async function handleDelete(id: number) {
    if (!confirm("削除してよいですか？")) return;
    await fetch(`/api/questions?id=${id}`, { method: "DELETE" });
    await fetchList();
  }

  async function handleEdit(q: Question) {
    const newText = prompt("問題文を編集", q.questionText);
    if (newText === null) return;
    const newChoices = prompt("選択肢をカンマ区切りで入力", q.choices.join(", "));
    if (newChoices === null) return;

    const payload = {
      id: q.id,
      fields: {
        questionText: newText,
        choices: String(newChoices).split(",").map((s: any) => s.trim()),
      },
    };

    await fetch(`/api/questions`, { method: "PUT", body: JSON.stringify(payload) });
    await fetchList();
  }

  return (
    <div className="prose mx-auto max-w-4xl p-6">
      <h1 className="text-xl font-semibold">問題管理</h1>

      <form onSubmit={handleAdd} className="space-y-2 rounded-md border p-4">
        <div className="flex gap-2">
          <input name="qualificationId" placeholder="資格ID (例: fe)" className="w-32 rounded border px-2" />
          <input name="chapterId" placeholder="章ID" className="w-24 rounded border px-2" />
          <input name="difficulty" placeholder="難易度" className="w-24 rounded border px-2" />
        </div>
        <input name="questionText" placeholder="問題文" className="w-full rounded border px-2" />
        <input name="choices" placeholder="選択肢 (カンマ区切り)" className="w-full rounded border px-2" />
        <div className="flex gap-2">
          <input name="answer" placeholder="正解のインデックス (1から)" className="w-48 rounded border px-2" />
          <input name="explanation" placeholder="解説" className="flex-1 rounded border px-2" />
        </div>
        <div>
          <button className="rounded bg-amber-600 px-4 py-2 text-white">追加</button>
        </div>
      </form>

      <div className="mt-6">
        <h2 className="text-lg font-semibold">既存の問題 ({questions.length})</h2>
        {loading ? (
          <p>読み込み中…</p>
        ) : (
          <ul className="space-y-2">
            {questions.map((q: any) => (
              <li key={q.id} className="flex items-start justify-between rounded border p-3">
                <div>
                  <div className="text-sm font-medium">{q.id} — {q.questionText}</div>
                  <div className="text-xs text-slate-600">{q.qualificationId} / 章{q.chapterId} / 難易度:{q.difficulty}</div>
                  <div className="mt-1 text-sm">{q.choices?.map((c:any,i:number)=>(<div key={i}>{i+1}. {c}</div>))}</div>
                </div>
                <div className="flex flex-col gap-2">
                  <button onClick={() => handleEdit(q)} className="rounded border px-3 py-1 text-sm">編集</button>
                  <button onClick={() => handleDelete(q.id)} className="rounded bg-red-600 px-3 py-1 text-sm text-white">削除</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}