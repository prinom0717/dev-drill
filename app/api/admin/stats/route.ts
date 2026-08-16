import { NextRequest } from "next/server";
import { requireHost, isAuthError } from "@/lib/auth/require-auth";
import { getAdminStats, type AdminStatsFilters } from "@/lib/master-drill-store";

export async function GET(request: NextRequest) {
  // 認証と管理者権限チェック（hostのみアクセス可能）
  const authResult = await requireHost(request);
  if (isAuthError(authResult)) {
    return authResult;
  }

  // クエリパラメータからフィルター条件を抽出
  const searchParams = request.nextUrl.searchParams;
  const filters: AdminStatsFilters = {};

  const userId = searchParams.get("userId");
  if (userId) {
    filters.userId = parseInt(userId, 10);
  }

  const examId = searchParams.get("examId");
  if (examId) {
    filters.examId = parseInt(examId, 10);
  }

  const chapterId = searchParams.get("chapterId");
  if (chapterId) {
    filters.chapterId = parseInt(chapterId, 10);
  }

  const questionId = searchParams.get("questionId");
  if (questionId) {
    filters.questionId = parseInt(questionId, 10);
  }

  const startDate = searchParams.get("startDate");
  if (startDate) {
    filters.startDate = startDate;
  }

  const endDate = searchParams.get("endDate");
  if (endDate) {
    filters.endDate = endDate;
  }

  try {
    const stats = await getAdminStats(filters);
    return Response.json(stats);
  } catch (error) {
    console.error("Admin stats API error:", error);
    return Response.json(
      { message: "統計データの取得に失敗しました。" },
      { status: 500 }
    );
  }
}