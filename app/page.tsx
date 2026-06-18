import Link from "next/link";

import { dummyUserId, getQualifications, getStats } from "@/lib/master-drill-store";

export default function Home() {
  const qualifications = getQualifications();
  const stats = getStats(dummyUserId);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <section className="overflow-hidden rounded-[2rem] border border-amber-200/70 bg-white/80 px-6 py-8 shadow-[0_20px_70px_-40px_rgba(120,53,15,0.45)] backdrop-blur sm:px-8">
        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr] lg:items-end">
          <div className="space-y-4">
            <p className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold tracking-[0.2em] text-amber-700 uppercase">
              Problem Drill App
            </p>
            <div className="space-y-3">
              <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
                資格試験を、章別でもランダムでも、すぐ解ける。
              </h1>
              <p className="max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                まずは選択問題に集中し、正誤判定と解説、学習履歴までをひと通り回せる最初の版です。後からログイン、弱点分析、記述問題、管理機能へ広げられます。
              </p>
            </div>
          </div>

          <div className="grid gap-3 rounded-[1.5rem] border border-slate-200 bg-slate-950 p-5 text-slate-100">
            <div>
              <p className="text-sm text-slate-400">ダミー user_id</p>
              <p className="mt-1 text-2xl font-semibold">{dummyUserId}</p>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-2xl bg-white/5 p-3">
                <p className="text-xs text-slate-400">総解答数</p>
                <p className="mt-1 text-xl font-semibold">{stats.totalAnswers }</p>
              </div>
              <div className="rounded-2xl bg-white/5 p-3">
                <p className="text-xs text-slate-400">正答数</p>
                <p className="mt-1 text-xl font-semibold">{stats.correctAnswers }</p>
              </div>
              <div className="rounded-2xl bg-white/5 p-3">
                <p className="text-xs text-slate-400">正答率</p>
                <p className="mt-1 text-xl font-semibold">{stats.accuracy}%</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="qualifications" className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">資格一覧</h2>
            <p className="mt-1 text-sm text-slate-600">試験ごとに章別出題へ進めます。</p>
          </div>
          <Link
            href="/qualifications/fe/history"
            className="hidden rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-amber-300 hover:text-amber-700 sm:inline-flex"
          >
            学習履歴を見る
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {qualifications.map((qualification) => (
            <Link
              key={qualification.id}
              href={`/qualifications/${qualification.id}`}
              className="group rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_20px_50px_-40px_rgba(15,23,42,0.4)] transition duration-200 hover:-translate-y-1 hover:border-amber-300 hover:shadow-[0_24px_60px_-32px_rgba(245,158,11,0.45)]"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-lg font-semibold text-slate-900">{qualification.name}</p>
                  <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                    選択問題
                  </span>
                </div>
                <p className="text-sm leading-6 text-slate-600">{qualification.description}</p>
                <p className="text-sm font-medium text-amber-700 transition group-hover:translate-x-0.5">
                  章別出題へ進む →
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
