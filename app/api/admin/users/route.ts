import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireAuth, isAuthError } from "@/lib/auth/require-auth";
import { hashPassword } from "@/lib/auth/password";
import { validateCreateUserInput } from "@/lib/auth/user-validation";

export async function GET(request: NextRequest) {
  // 認証チェック
  const authResult = await requireAuth(request);
  if (isAuthError(authResult)) {
    return authResult;
  }

  const user = authResult;

  // admin権限チェック
  if (user.role !== "admin") {
    return NextResponse.json(
      { message: "権限がありません。" },
      { status: 403 }
    );
  }

  try {
    // ユーザー一覧取得（deleted=trueは除外）
    const users = await prisma.user.findMany({
      where: {
        deleted: false,
      },
      select: {
        id: true,
        userid: true,
        email: true,
        role: true,
        failed_attempts: true,
        locked: true,
        created_at: true,
        updated_at: true,
      },
      orderBy: {
        created_at: "desc",
      },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return NextResponse.json(
      { message: "ユーザー一覧の取得に失敗しました" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // 認証チェック
  const authResult = await requireAuth(request);
  if (isAuthError(authResult)) {
    return authResult;
  }

  const user = authResult;

  // admin権限チェック
  if (user.role !== "admin") {
    return NextResponse.json(
      { message: "権限がありません。" },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { userid, password, email, role } = body;

    // バリデーション
    const validation = validateCreateUserInput({ userid, password, email });
    if (!validation.isValid) {
      return NextResponse.json(
        { message: "入力内容を確認してください", errors: validation.errors },
        { status: 400 }
      );
    }

    // roleのバリデーション
    if (role && !["admin", "editor", "user"].includes(role)) {
      return NextResponse.json(
        { message: "無効なロールです" },
        { status: 400 }
      );
    }

    const trimmedUserid = userid.trim();
    const trimmedEmail = email?.trim() || null;
    const userRole = role || "user";

    // useridの重複チェック
    const existingUser = await prisma.user.findUnique({
      where: { userid: trimmedUserid },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "このユーザーIDは既に使用されています" },
        { status: 409 }
      );
    }

    // emailの重複チェック（emailが提供されている場合）
    if (trimmedEmail) {
      const existingEmail = await prisma.user.findUnique({
        where: { email: trimmedEmail },
      });

      if (existingEmail) {
        return NextResponse.json(
          { message: "このメールアドレスは既に使用されています" },
          { status: 409 }
        );
      }
    }

    // パスワードハッシュ化
    const passwordHash = await hashPassword(password);

    // ユーザー作成
    const newUser = await prisma.user.create({
      data: {
        userid: trimmedUserid,
        password_hash: passwordHash,
        email: trimmedEmail,
        role: userRole,
        failed_attempts: 0,
        locked: false,
        deleted: false,
      },
      select: {
        id: true,
        userid: true,
        email: true,
        role: true,
        failed_attempts: true,
        locked: true,
        created_at: true,
        updated_at: true,
      },
    });

    return NextResponse.json(
      {
        message: "ユーザーを作成しました",
        user: newUser,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create user:", error);
    return NextResponse.json(
      { message: "ユーザー作成に失敗しました" },
      { status: 500 }
    );
  }
}
