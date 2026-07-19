import Link from "next/link";
import { notFound } from "next/navigation";

import {
  getChaptersForQualification,
  getQualificationById,
} from "@/lib/master-drill-store";
import { QualificationClient } from "@/app/_components/qualification-client";

export default async function QualificationPage({
  params,
}: {
  params: Promise<{ qualificationId: string }>;
}) {
  const { qualificationId } = await params;
  const [qualification, chapters] = await Promise.all([
    getQualificationById(qualificationId),
    getChaptersForQualification(qualificationId),
  ]);
  if (!qualification) {
    notFound();
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_-46px_rgba(15,23,42,0.35)] sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">Qualification</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              {qualification.name}
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
              {qualification.description}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href={`/qualifications/${qualificationId}/history`}
              className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-amber-300 hover:text-amber-700"
            >
              学習履歴
            </Link>
            <Link
              href={`/qualifications/${qualificationId}/play?mode=random&count=10`}
              className="rounded-full bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-700"
            >
              ランダム出題
            </Link>
            <Link
              href={`/qualifications/${qualificationId}/play?mode=unanswered`}
              className="rounded-full bg-[#F5CBA7] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#F5CBA7]"
            >
              未出題問題
            </Link>
            <QualificationClient qualificationId={qualificationId} />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">章別に解く</h2>
          <p className="mt-1 text-sm text-slate-600">章を選ぶと、その範囲の問題だけを出題します。</p>          
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {chapters.map((chapter: any) => (
            <Link
              key={chapter.id}
              href={`/qualifications/${qualificationId}/play?mode=chapter&chapterId=${chapter.id}&count=5`}
              className="rounded-[1.4rem] border border-slate-200 bg-white p-5 transition hover:border-amber-300 hover:shadow-[0_20px_50px_-36px_rgba(245,158,11,0.45)]"
            >
              <p className="text-base font-semibold text-slate-900">{chapter.title}</p>
              <p className="mt-2 text-sm text-slate-600">この章の選択問題をまとめて演習します。</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-4 rounded-[1.75rem] border border-amber-200 bg-amber-50/70 p-6 sm:grid-cols-[1.2fr_0.8fr] sm:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-700">Quick start</p>
          <h2 className="mt-2 text-xl font-semibold">最短で演習を始める</h2>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            まずはランダム出題で全体を広く確認し、苦手な章は章別出題に戻る流れが使いやすいです。
          </p>
        </div>
        <div className="flex justify-start sm:justify-end">
          <Link
            href={`/qualifications/${qualificationId}/play?mode=random&count=10`}
            className="inline-flex rounded-full bg-amber-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-amber-700"
          >
            今すぐ解く
          </Link>
        </div>
      </section>
    </main>
  );
}
