import { prisma } from "@/lib/prisma";
import { requireAdmin, isAuthError } from "@/lib/auth/require-auth";
import { IssueStatus } from "@/lib/question-issues/types";

export async function GET(request: Request) {
  const authResult = await requireAdmin(request);
  if (isAuthError(authResult)) {
    return authResult;
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const questionId = searchParams.get("questionId");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "50");

  const where: any = {};

  if (status) {
    where.status = status;
  }

  if (questionId) {
    where.question_id = parseInt(questionId);
  }

  try {
    const [issues, total] = await Promise.all([
      prisma.questionIssue.findMany({
        where,
        include: {
          question: {
            select: {
              id: true,
              question_text: true,
              chapter: {
                select: {
                  chapter_title: true,
                  exam: {
                    select: {
                      exam_name: true,
                    },
                  },
                },
              },
            },
          },
          exam: {
            select: {
              id: true,
              exam_name: true,
            },
          },
          user: {
            select: {
              id: true,
              userid: true,
              email: true,
            },
          },
        },
        orderBy: {
          created_at: "desc",
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.questionIssue.count({ where }),
    ]);

    return Response.json({
      issues,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Failed to fetch question issues:", error);
    return Response.json(
      { message: "起票一覧の取得に失敗しました。" },
      { status: 500 },
    );
  }
}
