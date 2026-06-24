"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Exam = { id: number; examName: string; description: string };
type Chapter = { id: number; examId: number; chapterNumber: number; chapterTitle: string; coverage: string | null };

export default function HistoryPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<number | null>(null);
  const [selectedChapterId, setSelectedChapterId] = useState<number | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchExams();
  }, []);

  useEffect(() => {
    if (selectedExamId) {
      fetchChapters(selectedExamId);
    } else {
      setChapters([]);
      setSelectedChapterId(null);
    }
    fetchHistory();
  }, [selectedExamId, selectedChapterId]);

  async function fetchExams() {
    try {
      const res = await fetch("/api/exams");
      const data = await res.json();
      setExams(data.exams || []);
    } catch (e) {
      console.error("Failed to fetch exams", e);
    }
  }

  async function fetchChapters(examId: number) {
    try {
      const res = await fetch(`/api/exams/${examId}/chapters`);
      const data = await res.json();
      setChapters(data.chapters || []);
    } catch (e) {
      console.error("Failed to fetch chapters", e);
    }
  }

  async function fetchHistory() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedExamId) params.append("examId", String(selectedExamId));
      if (selectedChapterId) params.append("chapterId", String(selectedChapterId));
      
      const res = await fetch(`/api/history?${params.toString()}`);
      const data = await res.json();
      setHistory(data.history || []);
      
      // ステータスを取得
      const statsRes = await fetch("/api/stats");
      const statsData = await statsRes.json();
      setStats(statsData);
    } catch (e) {
      console.error("Failed to fetch history", e);
    }
    setLoading(false);
  }

  const filteredHistory = history;

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_-48px_rgba(15,23,42,0.35)] sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-700">History</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">学習履歴</h1>
            <p className="mt-3 text-sm text-slate-600">ダミー user_id の解答履歴を確認できます。</p>
          </div>
        </div>

        <div className="mt-6 flex gap-4">
          <select
            value={selectedExamId || ""}
            onChange={(e) => setSelectedExamId(Number(e.target.value) || null)}
            className="w-48 rounded border px-2"
          >
            <option value="">すべての試験</option>
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
            <option value="">すべての章</option>
            {chapters.map((chapter) => (
              <option key={chapter.id} value={chapter.id}>
                {chapter.chapterTitle}
              </option>
            ))}
          </select>
        </div>

        {stats && (
          <div className="mt-6 flex flex-wrap gap-4">
            <div className="grid gap-4 flex-1 sm:grid-cols-3">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">総解答数</p>
                <p className="mt-2 text-2xl font-semibold">{stats.totalAnswers}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">正答数</p>
                <p className="mt-2 text-2xl font-semibold">{stats.correctAnswers}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">正答率</p>
                <p className="mt-2 text-2xl font-semibold">{stats.accuracy}%</p>
              </div>
            </div>
            <div className="flex items-center">
              <Link
                href={`/qualifications/${selectedExamId || 'fe'}/play?mode=mistakes`}
                className="rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700"
              >
                間違えた問題を解く
              </Link>
            </div>
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            {selectedExamId || selectedChapterId ? "フィルタリング結果" : "最近の解答"}
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            {loading ? "読み込み中..." : `${filteredHistory.length}件の履歴を表示中`}
          </p>
        </div>

        {filteredHistory.length === 0 && !loading ? (
          <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">
            該当する履歴がありません。
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredHistory.map((entry: any) => (
              <article
                key={entry.questionId}
                className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_20px_50px_-44px_rgba(15,23,42,0.28)]"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Question</p>
                      <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600">
                        {entry.totalAttempts}回中{entry.correctCount}回正解 ({entry.accuracy}%)
                      </span>
                    </div>
                    <h3 className="mt-2 text-lg font-semibold text-slate-900" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{entry.question?.questionText}</h3>
                  </div>
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${entry.latestAnswer.isCorrect ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}
                  >
                    {entry.latestAnswer.isCorrect ? "正解" : "不正解"}
                  </span>
                </div>

                <dl className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">あなたの解答</dt>
                    <dd className="mt-2 text-sm text-slate-900">{entry.latestAnswer.userAnswer}</dd>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">解答日時</dt>
                    <dd className="mt-2 text-sm text-slate-900">{new Date(entry.latestAnswer.answeredAt).toLocaleString("ja-JP")}</dd>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">累積正答率</dt>
                    <dd className="mt-2 text-sm text-slate-900">{entry.accuracy}%</dd>
                  </div>
                </dl>
                <div className="mt-4 flex gap-2">
                  <Link
                    href={`/qualifications/${entry.question?.qualificationId || 'fe'}/play?mode=review&questionId=${entry.questionId}`}
                    className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-amber-300 hover:text-amber-700"
                  >
                    再挑戦
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
