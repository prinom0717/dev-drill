"use client";

import Link from "next/link";
import { useState } from "react";

export default function HeaderClient() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex items-center gap-3">
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
          <div className="absolute right-0 mt-2 w-52 rounded-md border bg-white p-2 shadow-md z-50">
            <Link href="/" className="block px-3 py-2 text-sm hover:bg-slate-50" onClick={() => setOpen(false)}>ホーム</Link>
            <div className="border-t my-1"></div>
            <Link href="/admin/questions" className="block px-3 py-2 text-sm hover:bg-slate-50" onClick={() => setOpen(false)}>出題管理</Link>
            <div className="border-t my-1"></div>
            <Link href="/#qualifications" className="block px-3 py-2 text-sm hover:bg-slate-50" onClick={() => setOpen(false)}>資格一覧</Link>
            <Link href="/history" className="block px-3 py-2 text-sm hover:bg-slate-50" onClick={() => setOpen(false)}>履歴</Link>
          </div>
        )}
      </div>
    </div>
  );
}
