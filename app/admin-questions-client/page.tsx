"use client";

import { useEffect, useState } from "react";

type Question = any;
type Exam = { id: number; examName: string; description: string };
type Chapter = { id: number; examId: number; chapterNumber: number; chapterTitle: string; coverage: string | null };

function parseCSV(csvText: string): Array<{ qualificationId: string; chapterId: number; questionType: "choice"; questionText: string; choices: string[]; answer: number; explanation: string; difficulty: number }> {
  const lines = csvText.trim().split("\n");
  const questions = [];

  // ヘッダー行をスキップ（最初の行がヘッダーの場合）
  const startIndex = lines[0].startsWith("examId") || lines[0].startsWith("試験ID") ? 1 : 0;

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // カンマで分割ただし、カンマが引用符で囲まれている場合は考慮しない簡易実装
    const parts = line.split(",").map(p => p.trim());
    
    // フォーマット: examId,chapterNumber,questionText,choice1,choice2,choice3,choice4,answer,explanation,difficulty
    // chapterNumberは章番号（1,2,3...）で、後でDBのchapterIdに変換されます
    if (parts.length >= 8) {
      const question = {
        qualificationId: parts[0],
        chapterId: Number(parts[1]),
        questionType: "choice" as const,
        questionText: parts[2],
        choices: parts.slice(3, 7), // 4つの選択肢
        answer: Number(parts[7]),
        explanation: parts[8] || "",
        difficulty: Number(parts[9]) || 1,
      };
      
      // バリデーション
      if (isNaN(question.chapterId) || question.chapterId <= 0) {
        console.warn(`無効なchapterId: ${parts[1]} 行 ${i + 1}`);
        continue;
      }
      if (isNaN(question.answer) || question.answer < 1 || question.answer > 4) {
        console.warn(`無効なanswer: ${parts[7]} 行 ${i + 1}`);
        continue;
      }
      if (question.choices.length !== 4) {
        console.warn(`選択肢が4つありません: 行 ${i + 1}`);
        continue;
      }
      
      questions.push(question);
    } else {
      console.warn(`CSVフォーマットエラー: 行 ${i + 1} カラム数が不足しています (${parts.length}カラム)`);
    }
  }

  console.log(`CSVパース結果: ${questions.length}件の問題を検出`);
  return questions;
}

export default function AdminQuestionsClient() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<number | null>(null);
  const [selectedChapterId, setSelectedChapterId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [csvText, setCsvText] = useState("");
  const [csvImporting, setCsvImporting] = useState(false);

  useEffect(() => {
    fetchExams();
    fetchList();
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
      const res = await fetch(`/api/exams`);
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
    try {
      const res = await fetch(`/api/exams/${examId}/chapters`);
      const data = await res.json();
      setChapters(data.chapters || []);
      if (data.chapters && data.chapters.length > 0) {
        setSelectedChapterId(data.chapters[0].id);
      } else {
        setSelectedChapterId(null);
      }
    } catch (e) {
      console.error("Failed to fetch chapters", e);
      setChapters([]);
    }
  }

  async function fetchList() {
    setLoading(true);
    try {
      const res = await fetch(`/api/questions?count=200&includeExamChapter=true`);
      const data = await res.json();
      setQuestions(data.questions || []);
    } catch (e) {
      console.error("Failed to fetch questions", e);
      setQuestions([]);
    }
    setLoading(false);
  }

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedChapterId) {
      alert("章を選択してください");
      return;
    }

    const form = e.currentTarget;
    const fd = new FormData(form);
    const payload = {
      qualificationId: String(selectedExamId || ""),
      chapterId: selectedChapterId,
      questionType: "choice",
      questionText: String(fd.get("questionText") || ""),
      choices: String(fd.get("choices") || "").split(",").map((s: any) => s.trim()).filter(Boolean),
      answer: Number(fd.get("answer") || 1),
      explanation: String(fd.get("explanation") || ""),
      difficulty: Number(fd.get("difficulty") || 1),
    };

    try {
      await fetch(`/api/questions`, { method: "POST", body: JSON.stringify(payload) });
      form.reset();
      await fetchList();
    } catch (e) {
      console.error("Failed to add question", e);
      alert("問題の追加に失敗しました");
    }
  }

  async function handleCSVImport() {
    if (!csvText.trim()) {
      alert("CSVテキストを入力してください");
      return;
    }

    if (!selectedExamId) {
      alert("試験を選択してください");
      return;
    }

    setCsvImporting(true);
    try {
      const parsedQuestions = parseCSV(csvText);
      
      if (parsedQuestions.length === 0) {
        alert("有効な問題が見つかりませんでした。CSVフォーマットを確認してください。");
        setCsvImporting(false);
        return;
      }

      // 選択した試験の章を取得して、章番号を章IDに変換するマップを作成
      const chapterMap = new Map<number, number>();
      chapters.forEach(ch => {
        chapterMap.set(ch.chapterNumber, ch.id);
      });

      // CSVのchapterId（実際には章番号）をDBのchapterIdに変換
      const questionsWithCorrectChapterId = parsedQuestions.map(q => {
        const dbChapterId = chapterMap.get(q.chapterId);
        if (!dbChapterId) {
          console.warn(`章番号 ${q.chapterId} に対応する章が見つかりません`);
          return null;
        }
        return {
          ...q,
          qualificationId: String(selectedExamId),
          chapterId: dbChapterId,
        };
      }).filter(q => q !== null);

      if (questionsWithCorrectChapterId.length === 0) {
        alert("有効な章IDに変換できる問題がありませんでした。選択した試験に対応する章番号を確認してください。");
        setCsvImporting(false);
        return;
      }

      if (questionsWithCorrectChapterId.length < parsedQuestions.length) {
        alert(`${parsedQuestions.length - questionsWithCorrectChapterId.length}件の問題は章番号が無効のためスキップされました。`);
      }

      console.log(`インポートする問題数: ${questionsWithCorrectChapterId.length}`);
      
      const res = await fetch(`/api/questions/bulk`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ questions: questionsWithCorrectChapterId }),
      });

      console.log("APIレスポンス受信:", res.status);
      const data = await res.json();
      console.log("APIレスポンスデータ:", data);

      if (data.ok) {
        const successCount = data.results.filter((r: any) => r.success).length;
        const failCount = data.results.filter((r: any) => !r.success).length;
        
        if (failCount > 0) {
          console.error("失敗したインポート:", data.results.filter((r: any) => !r.success));
          alert(`${successCount}件成功、${failCount}件失敗しました。詳細はコンソールを確認してください。`);
        } else {
          alert(`${successCount}件の問題をインポートしました`);
        }
        
        setCsvText("");
        await fetchList();
      } else {
        alert(`インポートに失敗しました: ${data.message}`);
        console.error("インポートエラー:", data);
      }
    } catch (e) {
      console.error("Failed to import CSV", e);
      alert("CSVインポートに失敗しました: " + (e instanceof Error ? e.message : String(e)));
    }
    setCsvImporting(false);
  }

  async function handleDelete(id: number) {
    if (!confirm("削除してよいですか？")) return;
    try {
      await fetch(`/api/questions?id=${id}`, { method: "DELETE" });
      await fetchList();
    } catch (e) {
      console.error("Failed to delete question", e);
      alert("削除に失敗しました");
    }
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

    try {
      await fetch(`/api/questions`, { method: "PUT", body: JSON.stringify(payload) });
      await fetchList();
    } catch (e) {
      console.error("Failed to update question", e);
      alert("更新に失敗しました");
    }
  }

  return (
    <div className="prose mx-auto max-w-4xl p-6">
      <h1 className="text-xl font-semibold">問題管理</h1>

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
          <select
            value={selectedChapterId || ""}
            onChange={(e) => setSelectedChapterId(Number(e.target.value) || null)}
            className="w-48 rounded border px-2"
            disabled={!selectedExamId}
          >
            <option value="">章を選択</option>
            {chapters.map((chapter) => (
              <option key={chapter.id} value={chapter.id}>
                {chapter.chapterTitle}
              </option>
            ))}
          </select>
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

      <div className="mt-6 rounded-md border p-4">
        <h2 className="text-lg font-semibold">CSV一括インポート</h2>
        <div className="mb-2 text-sm text-slate-600">
          フォーマット: examId,chapterNumber,questionText,choice1,choice2,choice3,choice4,answer,explanation,difficulty
        </div>
        <div className="mb-2 text-xs text-slate-500">
          ※ chapterNumberは選択した試験の章番号（1,2,3...）を指定してください
        </div>
        <div className="mb-2 text-xs text-slate-500">
          例: 1,1,公開鍵暗号方式で正しい説明はどれか,暗号化と復号に同じ鍵を使う,公開鍵と秘密鍵の組を使う,平文をそのまま送信する,必ずハッシュ関数だけで暗号化する,2,公開鍵暗号方式では鍵の組を利用する,2
        </div>
        <div className="mb-2 text-xs text-slate-500">
          ※ 試験を選択している場合、CSV内のexamIdは選択した試験で上書きされます
        </div>
        <textarea
          value={csvText}
          onChange={(e) => setCsvText(e.target.value)}
          placeholder="CSVテキストを貼り付け..."
          className="w-full rounded border px-2 py-1 font-mono text-sm"
          rows={6}
        />
        <div className="mt-2">
          <button
            onClick={handleCSVImport}
            disabled={csvImporting}
            className="rounded bg-blue-600 px-4 py-2 text-white disabled:bg-slate-400"
          >
            {csvImporting ? "インポート中..." : "CSVインポート"}
          </button>
        </div>
      </div>

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
                  <div className="text-xs text-slate-600">
                    {q.examName || q.qualificationId} / {q.chapterTitle || `章${q.chapterId}`} / 難易度:{q.difficulty}
                  </div>
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