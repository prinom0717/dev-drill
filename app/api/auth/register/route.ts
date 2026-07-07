import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";
import { validateRegisterInput } from "@/lib/auth/user-validation";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userid, password, email } = body;

    // バリデーション
    const validation = validateRegisterInput({ userid, password, email });
    if (!validation.isValid) {
      return NextResponse.json(
        { message: "入力内容を確認してください", errors: validation.errors },
        { status: 400 }
      );
    }

    const trimmedUserid = userid.trim();
    const trimmedEmail = email?.trim() || null;

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
        role: "user",
        failed_attempts: 0,
        locked: false,
        deleted: false,
      },
      select: {
        id: true,
        userid: true,
        email: true,
        role: true,
        created_at: true,
      },
    });

    return NextResponse.json(
      {
        message: "ユーザー登録が完了しました",
        user: newUser,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "ユーザー登録中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
