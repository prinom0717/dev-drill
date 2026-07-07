import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { signToken } from "@/lib/auth/jwt";
import { setAuthCookie } from "@/lib/auth/cookies";
import { validateLoginInput } from "@/lib/auth/user-validation";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userid, password } = body;

    // バリデーション
    const validation = validateLoginInput({ userid, password });
    if (!validation.isValid) {
      return NextResponse.json(
        { message: "入力内容を確認してください", errors: validation.errors },
        { status: 400 }
      );
    }

    // ユーザー検索
    const user = await prisma.user.findUnique({
      where: { userid: userid.trim() },
    });

    // ユーザーが存在しない場合
    if (!user) {
      return NextResponse.json(
        { message: "ユーザーIDまたはパスワードが正しくありません" },
        { status: 401 }
      );
    }

    // 論理削除済みの場合
    if (user.deleted) {
      return NextResponse.json(
        { message: "ユーザーIDまたはパスワードが正しくありません" },
        { status: 401 }
      );
    }

    // ロックされている場合
    if (user.locked) {
      return NextResponse.json(
        { message: "アカウントがロックされています。管理者にお問い合わせください" },
        { status: 403 }
      );
    }

    // パスワード検証
    const isPasswordValid = await verifyPassword(password, user.password_hash);

    if (!isPasswordValid) {
      // 失敗回数をインクリメント
      const newFailedAttempts = user.failed_attempts + 1;
      const shouldLock = newFailedAttempts >= 5;

      await prisma.user.update({
        where: { id: user.id },
        data: {
          failed_attempts: newFailedAttempts,
          locked: shouldLock,
        },
      });

      if (shouldLock) {
        return NextResponse.json(
          { message: "ログイン失敗が多すぎるため、アカウントがロックされました" },
          { status: 403 }
        );
      }

      return NextResponse.json(
        { message: "ユーザーIDまたはパスワードが正しくありません" },
        { status: 401 }
      );
    }

    // パスワードが正しい場合、失敗回数をリセット
    await prisma.user.update({
      where: { id: user.id },
      data: { failed_attempts: 0 },
    });

    // JWTトークンを発行
    const token = await signToken({
      userId: user.id,
      userid: user.userid,
      role: user.role as any,
    });

    // レスポンスを作成
    const response = NextResponse.json({
      message: "ログインしました",
      user: {
        id: user.id,
        userid: user.userid,
        role: user.role,
      },
    });

    // HttpOnly Cookieにトークンを設定
    setAuthCookie(response, token);

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { message: "ログイン処理中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
