export const runtime = 'nodejs'

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { getSessionUser } from "@/lib/auth/session";
import { canEditQuestions, canManageUsers } from "@/lib/auth/roles";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ログインページと登録ページ、トップページは認証不要
  if (pathname === "/login" || pathname === "/register" || pathname === "/") {
    return NextResponse.next();
  }

  // 学習関連ページは認証必須
  if (pathname.startsWith("/qualifications") && (pathname.includes("/play") || pathname.includes("/history"))) {
    const user = await getSessionUser(request);
    if (!user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // セッションからユーザー情報を取得
  const user = await getSessionUser(request);

  // 未認証の場合はログインページへリダイレクト
  if (!user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // /admin/user のアクセス制御（adminのみ）
  if (pathname.startsWith("/admin/user")) {
    if (!canManageUsers(user.role)) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // /admin/questions のアクセス制御（admin/editorのみ）
  if (pathname.startsWith("/admin/questions")) {
    if (!canEditQuestions(user.role)) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // /admin/* のアクセス制御（userはアクセス不可）
  if (pathname.startsWith("/admin")) {
    if (user.role === "user") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes (handled by API routes themselves)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
};
