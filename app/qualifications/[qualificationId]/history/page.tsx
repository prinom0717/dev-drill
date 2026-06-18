import Link from "next/link";
import { notFound } from "next/navigation";

import { dummyUserId, getHistory, getQualificationById, getStats } from "@/lib/master-drill-store";

export default async function HistoryPage({
  params,
}: {
  params: Promise<{ qualificationId: string }>;
}) {
  const { qualificationId } = await params;
  const qualification = getQualificationById(qualificationId);

  if (!qualification) {
    notFound();
  }

  const history = getHistory(dummyUserId).filter(
    (entry) => entry.question?.qualificationId === qualificationId,
  );
  const stats = getStats(dummyUserId);

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_-48px_rgba(15,23,42,0.35)] sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-700">History</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">学習履歴</h1>
            <p className="mt-3 text-sm text-slate-600">ダミー user_id の解答履歴を確認できます。</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href={`/qualifications/${qualificationId}/play?mode=random`}
              className="rounded-full bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-700"
            >
              演習に戻る
            </Link>
            {/* 不正解問題ボタンを追加 */}
            <Link
              href={`/qualifications/${qualificationId}/play?mode=mistakes`}
              className="rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700"
            >
              不正解問題を解く
            </Link>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">総解答数</p>
            <p className="mt-2 text-2xl font-semibold">{stats.totalAnswers}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">正答数</p>
            <p className="mt-2 text-2xl font-semibold">{stats.correctAnswers }</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">正答率</p>
            <p className="mt-2 text-2xl font-semibold">{stats.accuracy}%</p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">最近の解答</h2>
          <p className="mt-1 text-sm text-slate-600">履歴はダミー user_id の記録を最新順で表示しています。</p>
        </div>

        {history.length === 0 ? (
          <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">
            まだ履歴がありません。
          </div>
        ) : (
          <div className="grid gap-4">
            {history.map((entry) => (
              <article
                key={entry.id}
                className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_20px_50px_-44px_rgba(15,23,42,0.28)]"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Question</p>
                    <h3 className="mt-2 text-lg font-semibold text-slate-900">{entry.question?.questionText}</h3>
                  </div>
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${entry.isCorrect ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}
                  >
                    {entry.isCorrect ? "正解" : "不正解"}
                  </span>
                </div>

                <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">あなたの解答</dt>
                    <dd className="mt-2 text-sm text-slate-900">{entry.userAnswer}</dd>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">解答日時</dt>
                    <dd className="mt-2 text-sm text-slate-900">{new Date(entry.answeredAt).toLocaleString("ja-JP")}</dd>
                  </div>
                </dl>
                <div className="mt-4 flex gap-2">
                  <Link
                    href={`/qualifications/${qualificationId}/play?mode=review&questionId=${entry.questionId}`}
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