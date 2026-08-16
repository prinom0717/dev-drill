import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireRole, isAuthError } from "@/lib/auth/require-auth";
import { getRoleLevel, ROLES } from "@/lib/auth/roles";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  // 認証チェック
  const authResult = await requireRole(request, ["admin", "host"]);
  if (isAuthError(authResult)) {
    return authResult;
  }

  const user = authResult;
  const userRoleLevel = getRoleLevel(user.role);

  try {
    const { id } = await context.params;
    const userId = Number.parseInt(id, 10);

    if (!Number.isFinite(userId)) {
      return NextResponse.json(
        { message: "無効なユーザーです" },
        { status: 400 }
      );
    }

    // ユーザー詳細取得（deleted=falseのみ）
    const targetUser = await prisma.user.findFirst({
      where: {
        id: userId,
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

    if (!targetUser) {
      return NextResponse.json(
        { message: "ユーザーが見つかりません" },
        { status: 404 }
      );
    }

    // 自分より上位のロールのユーザーはアクセス不可（自分と同等はOK）
    if (getRoleLevel(targetUser.role) > userRoleLevel) {
      return NextResponse.json(
        { message: "権限がありません。" },
        { status: 403 }
      );
    }

    return NextResponse.json({ user: targetUser });
  } catch (error) {
    console.error("Failed to fetch user:", error);
    return NextResponse.json(
      { message: "ユーザー詳細の取得に失敗しました" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  // 認証チェック
  const authResult = await requireRole(request, ["admin", "host"]);
  if (isAuthError(authResult)) {
    return authResult;
  }

  const user = authResult;
  const userRoleLevel = getRoleLevel(user.role);

  try {
    const { id } = await context.params;
    const userId = Number.parseInt(id, 10);

    if (!Number.isFinite(userId)) {
      return NextResponse.json(
        { message: "無効なユーザーIDです" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { role, locked, failed_attempts, email } = body;

    // 更新データの構築
    const updateData: Record<string, any> = {};

    if (role !== undefined) {
      // roleのバリデーション
      if (!ROLES.includes(role as any)) {
        return NextResponse.json(
          { message: "無効なロールです" },
          { status: 400 }
        );
      }
      // 自分より上位のロールは付与できない（自分と同等はOK）
      if (getRoleLevel(role) > userRoleLevel) {
        return NextResponse.json(
          { message: "自分より上位のロールは付与できません" },
          { status: 403 }
        );
      }
      updateData.role = role;
    }

    if (locked !== undefined) {
      updateData.locked = Boolean(locked);
    }

    if (failed_attempts !== undefined) {
      const attempts = Number.parseInt(failed_attempts, 10);
      if (!Number.isFinite(attempts) || attempts < 0) {
        return NextResponse.json(
          { message: "無効な失敗回数です" },
          { status: 400 }
        );
      }
      updateData.failed_attempts = attempts;
    }

    if (email !== undefined) {
      const trimmedEmail = email?.trim() || null;
      
      // emailの重複チェック（emailが提供されている場合）
      if (trimmedEmail) {
        const existingEmail = await prisma.user.findFirst({
          where: {
            email: trimmedEmail,
            id: { not: userId },
          },
        });

        if (existingEmail) {
          return NextResponse.json(
            { message: "このメールアドレスは既に使用されています" },
            { status: 409 }
          );
        }
      }
      
      updateData.email = trimmedEmail;
    }

    // 更新するデータがない場合
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { message: "更新するデータがありません" },
        { status: 400 }
      );
    }

    // ユーザーが存在するか確認（deleted=falseのみ）
    const existingUser = await prisma.user.findFirst({
      where: {
        id: userId,
        deleted: false,
      },
    });

    if (!existingUser) {
      return NextResponse.json(
        { message: "ユーザーが見つかりません" },
        { status: 404 }
      );
    }

    // 自分より上位のロールのユーザーは編集不可（自分と同等はOK）
    if (getRoleLevel(existingUser.role) > userRoleLevel) {
      return NextResponse.json(
        { message: "権限がありません。" },
        { status: 403 }
      );
    }

    // ユーザー更新
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
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

    return NextResponse.json({
      message: "ユーザーを更新しました",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Failed to update user:", error);
    return NextResponse.json(
      { message: "ユーザー更新に失敗しました" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  // 認証チェック
  const authResult = await requireRole(request, ["admin", "host"]);
  if (isAuthError(authResult)) {
    return authResult;
  }

  const user = authResult;
  const userRoleLevel = getRoleLevel(user.role);

  try {
    const { id } = await context.params;
    const userId = Number.parseInt(id, 10);

    if (!Number.isFinite(userId)) {
      return NextResponse.json(
        { message: "無効なユーザーIDです" },
        { status: 400 }
      );
    }

    // 自分自身を削除しようとしている場合
    if (userId === user.id) {
      return NextResponse.json(
        { message: "自分自身を削除することはできません" },
        { status: 400 }
      );
    }

    // ユーザーが存在するか確認（deleted=falseのみ）
    const existingUser = await prisma.user.findFirst({
      where: {
        id: userId,
        deleted: false,
      },
    });

    if (!existingUser) {
      return NextResponse.json(
        { message: "ユーザーが見つかりません" },
        { status: 404 }
      );
    }

    // 自分より上位のロールのユーザーは削除不可（自分と同等はOK）
    if (getRoleLevel(existingUser.role) > userRoleLevel) {
      return NextResponse.json(
        { message: "権限がありません。" },
        { status: 403 }
      );
    }

    // 論理削除（deleted=trueに設定）
    await prisma.user.update({
      where: { id: userId },
      data: { deleted: true },
    });

    return NextResponse.json({
      message: "ユーザーを削除しました",
    });
  } catch (error) {
    console.error("Failed to delete user:", error);
    return NextResponse.json(
      { message: "ユーザー削除に失敗しました" },
      { status: 500 }
    );
  }
}
