"use client";

import { useEffect, useState } from "react";

type Exam = { id: number; examName: string; description: string };
type Chapter = { id: number; examId: number; chapterNumber: number; chapterTitle: string; coverage: string | null };
type Question = any;

type TabType = "exams" | "chapters" | "questions";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<TabType>("exams");
  
  // 試験管理用
  const [exams, setExams] = useState<Exam[]>([]);
  const [editingExamId, setEditingExamId] = useState<number | null>(null);
  
  // 章管理用
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<number | null>(null);
  const [editingChapterId, setEditingChapterId] = useState<number | null>(null);
  
  // 問題管理用
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedChapterIdForQuestions, setSelectedChapterIdForQuestions] = useState<number | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeTab === "exams") fetchExams();
    if (activeTab === "chapters") {
      fetchExams();
      if (selectedExamId) fetchChapters(selectedExamId);
    }
    if (activeTab === "questions") {
      fetchExams();
      if (selectedExamId) {
        fetchChapters(selectedExamId);
        if (selectedChapterIdForQuestions) fetchQuestions();
      }
    }
  }, [activeTab, selectedExamId, selectedChapterIdForQuestions]);

  // 試験管理
  async function fetchExams() {
    try {
      const res = await fetch("/api/exams");
      const data = await res.json();
      setExams(data.exams || []);
    } catch (e) {
      console.error("Failed to fetch exams", e);
    }
  }

  async function handleAddExam(e: React.FormEvent<HTMLFormElement>) {
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

  async function handleDeleteExam(id: number) {
    if (!confirm("削除してよいですか？関連する章と問題も削除されます。")) return;
    try {
      await fetch(`/api/exams?id=${id}`, { method: "DELETE" });
      await fetchExams();
    } catch (e) {
      console.error("Failed to delete exam", e);
      alert("削除に失敗しました");
    }
  }

  async function handleUpdateExam(id: number, examName: string, description: string) {
    try {
      await fetch("/api/exams", {
        method: "PUT",
        body: JSON.stringify({ id, examName, description }),
      });
      setEditingExamId(null);
      await fetchExams();
    } catch (e) {
      console.error("Failed to update exam", e);
      alert("更新に失敗しました");
    }
  }

  // 章管理
  async function fetchChapters(examId: number) {
    try {
      const res = await fetch(`/api/exams/${examId}/chapters`);
      const data = await res.json();
      setChapters(data.chapters || []);
    } catch (e) {
      console.error("Failed to fetch chapters", e);
    }
  }

  async function handleAddChapter(e: React.FormEvent<HTMLFormElement>) {
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

  async function handleDeleteChapter(id: number) {
    if (!confirm("削除してよいですか？関連する問題も削除されます。")) return;
    try {
      await fetch(`/api/chapters?id=${id}`, { method: "DELETE" });
      if (selectedExamId) await fetchChapters(selectedExamId);
    } catch (e) {
      console.error("Failed to delete chapter", e);
      alert("削除に失敗しました");
    }
  }

  async function handleUpdateChapter(id: number, chapterNumber: number, chapterTitle: string, coverage: string) {
    try {
      await fetch("/api/chapters", {
        method: "PUT",
        body: JSON.stringify({ id, chapterNumber, chapterTitle, coverage }),
      });
      setEditingChapterId(null);
      if (selectedExamId) await fetchChapters(selectedExamId);
    } catch (e) {
      console.error("Failed to update chapter", e);
      alert("更新に失敗しました");
    }
  }

  // 問題管理
  async function fetchQuestions() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedExamId) params.append("qualificationId", String(selectedExamId));
      if (selectedChapterIdForQuestions) params.append("chapterId", String(selectedChapterIdForQuestions));
      params.append("includeExamChapter", "true");
      params.append("count", "200");

      const res = await fetch(`/api/questions?${params.toString()}`);
      const data = await res.json();
      setQuestions(data.questions || []);
    } catch (e) {
      console.error("Failed to fetch questions", e);
      setQuestions([]);
    }
    setLoading(false);
  }

  async function handleAddQuestion(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedChapterIdForQuestions) {
      alert("章を選択してください");
      return;
    }

    const form = e.currentTarget;
    const fd = new FormData(form);
    const payload = {
      qualificationId: String(selectedExamId || ""),
      chapterId: selectedChapterIdForQuestions,
      questionType: "choice",
      questionText: String(fd.get("questionText") || ""),
      choices: String(fd.get("choices") || "").split("\n").map((s: any) => s.trim()).filter(Boolean),
      answer: Number(fd.get("answer") || 1),
      explanation: String(fd.get("explanation") || ""),
      difficulty: Number(fd.get("difficulty") || 1),
    };

    try {
      await fetch(`/api/questions`, { method: "POST", body: JSON.stringify(payload) });
      form.reset();
      await fetchQuestions();
    } catch (e) {
      console.error("Failed to add question", e);
      alert("問題の追加に失敗しました");
    }
  }

  async function handleDeleteQuestion(id: number) {
    if (!confirm("削除してよいですか？")) return;
    try {
      await fetch(`/api/questions?id=${id}`, { method: "DELETE" });
      await fetchQuestions();
    } catch (e) {
      console.error("Failed to delete question", e);
      alert("削除に失敗しました");
    }
  }

  async function handleEditQuestion(q: Question) {
    setEditingQuestion(q);
    setShowEditModal(true);
  }

  async function handleUpdateQuestion(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editingQuestion) return;

    const form = e.currentTarget;
    const fd = new FormData(form);
    const payload = {
      id: editingQuestion.id,
      fields: {
        questionText: String(fd.get("questionText") || ""),
        choices: String(fd.get("choices") || "").split("\n").map((s: any) => s.trim()).filter(Boolean),
        answer: Number(fd.get("answer") || 1),
        explanation: String(fd.get("explanation") || ""),
        difficulty: Number(fd.get("difficulty") || 1),
      },
    };

    try {
      await fetch(`/api/questions`, { method: "PUT", body: JSON.stringify(payload) });
      setShowEditModal(false);
      setEditingQuestion(null);
      await fetchQuestions();
    } catch (e) {
      console.error("Failed to update question", e);
      alert("更新に失敗しました");
    }
  }

  return (
    <div className="prose mx-auto max-w-6xl p-6">
      <h1 className="text-2xl font-semibold">管理画面</h1>

      <div className="mb-6">
        <div className="flex gap-2 border-b">
          <button
            onClick={() => setActiveTab("exams")}
            className={`px-4 py-2 text-sm font-medium ${activeTab === "exams" ? "border-b-2 border-amber-600 text-amber-700" : "text-slate-600 hover:text-amber-700"}`}
          >
            試験管理
          </button>
          <button
            onClick={() => setActiveTab("chapters")}
            className={`px-4 py-2 text-sm font-medium ${activeTab === "chapters" ? "border-b-2 border-amber-600 text-amber-700" : "text-slate-600 hover:text-amber-700"}`}
          >
            章管理
          </button>
          <button
            onClick={() => setActiveTab("questions")}
            className={`px-4 py-2 text-sm font-medium ${activeTab === "questions" ? "border-b-2 border-amber-600 text-amber-700" : "text-slate-600 hover:text-amber-700"}`}
          >
            問題管理
          </button>
        </div>
      </div>

      {activeTab === "exams" && (
        <div className="space-y-6">
          <form onSubmit={handleAddExam} className="space-y-2 rounded-md border p-4">
            <input name="examName" placeholder="試験名" className="w-full rounded border px-2" />
            <textarea name="description" placeholder="説明" className="w-full rounded border px-2 min-h-[60px]" rows={2} />
            <div>
              <button className="rounded bg-amber-600 px-4 py-2 text-white">追加</button>
            </div>
          </form>

          <div>
            <h2 className="text-lg font-semibold">既存の試験 ({exams.length})</h2>
            <ul className="space-y-2">
              {exams.map((exam: any) => (
                <li key={exam.id} className="rounded border p-3">
                  {editingExamId === exam.id ? (
                    <div className="space-y-2">
                      <input defaultValue={exam.examName} id={`edit-exam-name-${exam.id}`} className="w-full rounded border px-2" />
                      <textarea defaultValue={exam.description} id={`edit-exam-desc-${exam.id}`} className="w-full rounded border px-2 min-h-[60px]" rows={2} />
                      <div className="flex gap-2">
                        <button onClick={() => {
                          const nameInput = document.getElementById(`edit-exam-name-${exam.id}`) as HTMLInputElement;
                          const descInput = document.getElementById(`edit-exam-desc-${exam.id}`) as HTMLTextAreaElement;
                          handleUpdateExam(exam.id, nameInput.value, descInput.value);
                        }} className="rounded bg-blue-600 px-3 py-1 text-sm text-white">保存</button>
                        <button onClick={() => setEditingExamId(null)} className="rounded border px-3 py-1 text-sm">キャンセル</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-sm font-medium">{exam.examName}</div>
                        <div className="text-xs text-slate-600">{exam.description}</div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => setEditingExamId(exam.id)} className="rounded border px-3 py-1 text-sm">編集</button>
                        <button onClick={() => handleDeleteExam(exam.id)} className="rounded bg-red-600 px-3 py-1 text-sm text-white">削除</button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {activeTab === "chapters" && (
        <div className="space-y-6">
          <div className="mb-4">
            <select
              value={selectedExamId || ""}
              onChange={(e) => setSelectedExamId(Number(e.target.value) || null)}
              className="w-48 rounded border px-2"
            >
              <option value="">試験を選択</option>
              {exams.map((exam) => (
                <option key={exam.id} value={exam.id}>{exam.examName}</option>
              ))}
            </select>
          </div>

          <form onSubmit={handleAddChapter} className="space-y-2 rounded-md border p-4">
            <div className="flex gap-2">
              <input name="chapterNumber" placeholder="章番号" className="w-24 rounded border px-2" />
              <input name="chapterTitle" placeholder="章タイトル" className="flex-1 rounded border px-2" />
            </div>
            <textarea name="coverage" placeholder="範囲（任意）" className="w-full rounded border px-2 min-h-[60px]" rows={2} />
            <div>
              <button className="rounded bg-amber-600 px-4 py-2 text-white">追加</button>
            </div>
          </form>

          <div>
            <h2 className="text-lg font-semibold">既存の章 ({chapters.length})</h2>
            <ul className="space-y-2">
              {chapters.map((chapter: any) => (
                <li key={chapter.id} className="rounded border p-3">
                  {editingChapterId === chapter.id ? (
                    <div className="space-y-2">
                      <input type="number" defaultValue={chapter.chapterNumber} id={`edit-chapter-num-${chapter.id}`} className="w-24 rounded border px-2" />
                      <input defaultValue={chapter.chapterTitle} id={`edit-chapter-title-${chapter.id}`} className="flex-1 rounded border px-2" />
                      <textarea defaultValue={chapter.coverage || ""} id={`edit-chapter-coverage-${chapter.id}`} className="w-full rounded border px-2 min-h-[60px]" rows={2} />
                      <div className="flex gap-2">
                        <button onClick={() => {
                          const numInput = document.getElementById(`edit-chapter-num-${chapter.id}`) as HTMLInputElement;
                          const titleInput = document.getElementById(`edit-chapter-title-${chapter.id}`) as HTMLInputElement;
                          const coverageInput = document.getElementById(`edit-chapter-coverage-${chapter.id}`) as HTMLTextAreaElement;
                          handleUpdateChapter(chapter.id, Number(numInput.value), titleInput.value, coverageInput.value);
                        }} className="rounded bg-blue-600 px-3 py-1 text-sm text-white">保存</button>
                        <button onClick={() => setEditingChapterId(null)} className="rounded border px-3 py-1 text-sm">キャンセル</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-sm font-medium">第{chapter.chapterNumber}章: {chapter.chapterTitle}</div>
                        {chapter.coverage && <div className="text-xs text-slate-600">{chapter.coverage}</div>}
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => setEditingChapterId(chapter.id)} className="rounded border px-3 py-1 text-sm">編集</button>
                        <button onClick={() => handleDeleteChapter(chapter.id)} className="rounded bg-red-600 px-3 py-1 text-sm text-white">削除</button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {activeTab === "questions" && (
        <div className="space-y-6">
          <div className="flex gap-4">
            <select
              value={selectedExamId || ""}
              onChange={(e) => setSelectedExamId(Number(e.target.value) || null)}
              className="w-48 rounded border px-2"
            >
              <option value="">試験を選択</option>
              {exams.map((exam) => (
                <option key={exam.id} value={exam.id}>{exam.examName}</option>
              ))}
            </select>
            <select
              value={selectedChapterIdForQuestions || ""}
              onChange={(e) => setSelectedChapterIdForQuestions(Number(e.target.value) || null)}
              className="w-48 rounded border px-2"
              disabled={!selectedExamId}
            >
              <option value="">章を選択</option>
              {chapters.map((chapter) => (
                <option key={chapter.id} value={chapter.id}>{chapter.chapterTitle}</option>
              ))}
            </select>
          </div>

          <form onSubmit={handleAddQuestion} className="space-y-2 rounded-md border p-4">
            <div className="flex gap-2">
              <select name="difficulty" className="w-24 rounded border px-2">
                <option value="1">難易度1</option>
                <option value="2">難易度2</option>
                <option value="3">難易度3</option>
                <option value="4">難易度4</option>
                <option value="5">難易度5</option>
              </select>
            </div>
            <textarea name="questionText" placeholder="問題文" className="w-full rounded border px-2 min-h-[80px]" rows={3} />
            <textarea name="choices" placeholder="選択肢（改行区切りで4つ）" className="w-full rounded border px-2 min-h-[80px]" rows={4} />
            <div className="flex gap-2">
              <input name="answer" placeholder="正解の行番号 (1から)" className="w-48 rounded border px-2" />
            </div>
            <textarea name="explanation" placeholder="解説" className="w-full rounded border px-2 min-h-[80px]" rows={3} />
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
                      <div className="text-xs text-slate-600">{q.examName || q.qualificationId} / {q.chapterTitle || `章${q.chapterId}`} / 難易度:{q.difficulty}</div>
                      <div className="mt-1 text-sm">{q.choices?.map((c:any,i:number)=>(<div key={i}>{i+1}. {c}</div>))}</div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button onClick={() => handleEditQuestion(q)} className="rounded border px-3 py-1 text-sm">編集</button>
                      <button onClick={() => handleDeleteQuestion(q.id)} className="rounded bg-red-600 px-3 py-1 text-sm text-white">削除</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="mt-6 rounded-md border p-4">
            <h2 className="text-lg font-semibold">CSV一括インポート</h2>
            <div className="mb-2 text-sm text-slate-600">
              フォーマット: 試験名,章名,問題文,選択肢1,選択肢2,選択肢3,選択肢4,正解インデックス,解説,難易度
            </div>
            <div className="mb-2 text-xs text-slate-500">
              ※ 試験名・章名が既存のデータと一致する場合は、その試験・章に登録されます
            </div>
            <div className="mb-2 text-xs text-slate-500">
              例: ITパスポート試験,暗号技術,公開鍵暗号方式で正しい説明はどれか,暗号化と復号に同じ鍵を使う,公開鍵と秘密鍵の組を使う,平文をそのまま送信する,必ずハッシュ関数だけで暗号化する,2,公開鍵暗号方式では鍵の組を利用する,2
            </div>
            <textarea
              id="csv-text"
              className="w-full rounded border px-2 py-1 font-mono text-sm"
              placeholder="CSVテキストを貼り付け..."
              rows={6}
            />
            <div className="mt-2">
              <button
                onClick={() => {
                  const csvText = (document.getElementById("csv-text") as HTMLTextAreaElement).value;
                  if (!csvText.trim()) {
                    alert("CSVテキストを入力してください");
                    return;
                  }

                  // CSVパースとインポート処理（admin-questions-clientと同様）
                  // 簡単化のためここに実装
                  handleCSVImport(csvText);
                }}
                className="rounded bg-blue-600 px-4 py-2 text-white"
              >
                CSVインポート
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && editingQuestion && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">問題を編集</h2>
            <form onSubmit={handleUpdateQuestion} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">難易度</label>
                <select name="difficulty" defaultValue={editingQuestion.difficulty} className="w-48 rounded border px-2">
                  <option value="1">難易度1</option>
                  <option value="2">難易度2</option>
                  <option value="3">難易度3</option>
                  <option value="4">難易度4</option>
                  <option value="5">難易度5</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">問題文</label>
                <textarea name="questionText" defaultValue={editingQuestion.questionText} className="w-full rounded border px-2 min-h-[80px]" rows={3} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">選択肢（改行区切りで4つ）</label>
                <textarea name="choices" defaultValue={editingQuestion.choices?.join("\n") || ""} className="w-full rounded border px-2 min-h-[80px]" rows={4} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">正解の行番号 (1から)</label>
                <input name="answer" type="number" defaultValue={editingQuestion.answer} className="w-48 rounded border px-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">解説</label>
                <textarea name="explanation" defaultValue={editingQuestion.explanation || ""} className="w-full rounded border px-2 min-h-[80px]" rows={3} />
              </div>
              <div className="flex gap-3">
                <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-white">更新</button>
                <button type="button" onClick={() => setShowEditModal(false)} className="rounded border px-4 py-2">キャンセル</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// CSVインポート関数を追加
async function handleCSVImport(csvText: string) {
  const lines = csvText.trim().split("\n");
  const questions = [];
  const startIndex = lines[0].startsWith("試験名") || lines[0].startsWith("examName") ? 1 : 0;

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const parts = line.split(",").map(p => p.trim());

    if (parts.length >= 8) {
      const examName = parts[0];
      const chapterTitle = parts[1];
      const question = {
        examName,
        chapterTitle,
        questionType: "choice",
        questionText: parts[2],
        choices: parts.slice(3, 7),
        answer: Number(parts[7]),
        explanation: parts[8] || "",
        difficulty: Number(parts[9]) || 1,
      };

      if (!examName || !chapterTitle) continue;
      if (isNaN(question.answer) || question.answer < 1 || question.answer > 4) continue;
      if (question.choices.length !== 4) continue;

      questions.push(question);
    }
  }

  try {
    const res = await fetch(`/api/questions/bulk`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questions }),
    });

    const data = await res.json();
    if (data.ok) {
      const successCount = data.results.filter((r: any) => r.success).length;
      alert(`${successCount}件の問題をインポートしました`);
      (document.getElementById("csv-text") as HTMLTextAreaElement).value = "";
      // 問題リストを更新
      location.reload();
    } else {
      alert(`インポートに失敗しました: ${data.message}`);
    }
  } catch (e) {
    console.error("CSVインポート失敗", e);
    alert("CSVインポートに失敗しました");
  }
}
