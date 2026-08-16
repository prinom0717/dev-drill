"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthContext";

export default function HeaderClient() {
  const [open, setOpen] = useState(false);
  const { user, loading, refreshSession } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    setOpen(false);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      await refreshSession();
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Failed to logout:", error);
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "host":
        return "ホスト";
      case "admin":
        return "管理者";
      case "editor":
        return "編集者";
      case "user":
        return "一般ユーザー";
      default:
        return role;
    }
  };

  return (
    <div className="flex items-center gap-3">
      {loading ? (
        <div className="h-6 w-20 bg-slate-200 rounded animate-pulse"></div>
      ) : user ? (
        <>
          <div className="text-sm text-slate-600">
            <span className="font-medium">{user.userid}</span>
          </div>
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

                {/* 管理機能メニュー */}
                {user.role === "host" && (
                  <>
                    <Link href="/admin/stats" className="block px-3 py-2 text-sm hover:bg-slate-50" onClick={() => setOpen(false)}>分析</Link>
                    <div className="border-t my-1"></div>
                  </>
                )}

                {/* ユーザー管理 - adminとhostのみ */}
                {(user.role === "admin" || user.role === "host") && (
                  <Link href="/admin/users" className="block px-3 py-2 text-sm hover:bg-slate-50" onClick={() => setOpen(false)}>ユーザー管理</Link>
                )}

                {/* 出題管理と起票管理 - admin, editor, host */}
                {(user.role === "admin" || user.role === "editor" || user.role === "host") && (
                  <>
                    <Link href="/admin/questions" className="block px-3 py-2 text-sm hover:bg-slate-50" onClick={() => setOpen(false)}>出題管理</Link>
                    <Link href="/admin/question-issues" className="block px-3 py-2 text-sm hover:bg-slate-50" onClick={() => setOpen(false)}>起票管理</Link>
                    <div className="border-t my-1"></div>
                  </>
                )}

                {/* 一般機能メニュー - 全ユーザー */}
                <Link href="/#qualifications" className="block px-3 py-2 text-sm hover:bg-slate-50" onClick={() => setOpen(false)}>資格一覧</Link>
                <Link href="/history" className="block px-3 py-2 text-sm hover:bg-slate-50" onClick={() => setOpen(false)}>履歴</Link>
                <div className="border-t my-1"></div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 text-red-600"
                >
                  ログアウト
                </button>
              </div>
            )}
          </div>
        </>
      ) : (
        <>
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="text-sm font-medium text-slate-700 hover:text-amber-700"
          >
            ログイン
          </Link>
          <span className="text-slate-300">|</span>
          <Link
            href="/register"
            className="text-sm font-medium text-slate-700 hover:text-amber-700"
          >
            新規登録
          </Link>
        </div>
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
                <Link href="/login" className="block px-3 py-2 text-sm hover:bg-slate-50" onClick={() => setOpen(false)}>ログイン</Link>
                <Link href="/register" className="block px-3 py-2 text-sm hover:bg-slate-50" onClick={() => setOpen(false)}>新規登録</Link>
                <div className="border-t my-1"></div>
                <Link href="/#qualifications" className="block px-3 py-2 text-sm hover:bg-slate-50" onClick={() => setOpen(false)}>資格一覧</Link>
                <Link href="/history" className="block px-3 py-2 text-sm hover:bg-slate-50" onClick={() => setOpen(false)}>履歴</Link>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
