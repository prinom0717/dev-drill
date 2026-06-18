"use client";

import Link from "next/link";
import { useState } from "react";

export default function HeaderClient() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex items-center gap-3">
      <Link
        href="/debug"
        className="rounded-full bg-amber-600 px-4 py-2 text-white transition hover:bg-amber-700"
      >
        問題管理
      </Link>

      <div className="relative">
        <button
          aria-label="メニュー"
          onClick={() => setOpen((s) => !s)}
          className="inline-flex items-center justify-center h-10 w-10 rounded-md border bg-white"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18" />
            <path d="M3 12h18" />
            <path d="M3 18h18" />
          </svg>
        </button>

        {open && (
          <div className="absolute right-0 mt-2 w-44 rounded-md border bg-white p-2 shadow-md">
            <Link href="/#qualifications" className="block px-3 py-2 text-sm hover:bg-slate-50">資格一覧</Link>
            <Link href="/qualifications/fe/history" className="block px-3 py-2 text-sm hover:bg-slate-50">履歴</Link>
            <Link href="/" className="block px-3 py-2 text-sm hover:bg-slate-50">ホーム</Link>
          </div>
        )}
      </div>
    </div>
  );
}
