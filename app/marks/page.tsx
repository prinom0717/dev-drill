import { redirect } from "next/navigation";

import { getSessionUser } from "@/lib/auth/server-session";
import { MarkConfig } from "@/app/_components/mark-config";

export default async function MarksPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_-48px_rgba(15,23,42,0.35)] sm:p-8">
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-700">Settings</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              チェックマーク設定
            </h1>
            <p className="mt-3 text-sm text-slate-600">
              チェックマークのタイトルをカスタマイズ
            </p>
          </div>
        </div>
      </section>

      <MarkConfig userId={user.id} />
    </main>
  );
}
