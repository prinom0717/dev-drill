import { prisma } from "@/lib/prisma";
import { requireAdmin, isAuthError } from "@/lib/auth/require-auth";
import { IssueStatus } from "@/lib/question-issues/types";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdmin(request);
  if (isAuthError(authResult)) {
    return authResult;
  }

  const { id } = await params;
  const issueId = parseInt(id);

  if (isNaN(issueId)) {
    return Response.json({ message: "無効なIDです。" }, { status: 400 });
  }

  try {
    const issue = await prisma.questionIssue.findUnique({
      where: { id: issueId },
      include: {
        question: {
          select: {
            id: true,
            question_text: true,
            choices: true,
            answer: true,
            explanation: true,
            difficulty: true,
            chapter: {
              select: {
                id: true,
                chapter_title: true,
                chapter_number: true,
                exam: {
                  select: {
                    id: true,
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
    });

    if (!issue) {
      return Response.json({ message: "起票内容が見つかりません。" }, { status: 404 });
    }

    return Response.json({ issue });
  } catch (error) {
    console.error("Failed to fetch question issue:", error);
    return Response.json(
      { message: "起票内容の取得に失敗しました。" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdmin(request);
  if (isAuthError(authResult)) {
    return authResult;
  }

  const { id } = await params;
  const issueId = parseInt(id);

  if (isNaN(issueId)) {
    return Response.json({ message: "無効なIDです。" }, { status: 400 });
  }

  const body = (await request.json().catch(() => null)) as
    | { status?: IssueStatus; admin_comment?: string; fixed_content?: string }
    | null;

  if (!body) {
    return Response.json({ message: "リクエストボディが空です。" }, { status: 400 });
  }

  try {
    const existingIssue = await prisma.questionIssue.findUnique({
      where: { id: issueId },
    });

    if (!existingIssue) {
      return Response.json({ message: "起票内容が見つかりません。" }, { status: 404 });
    }

    const updateData: any = {};

    if (body.status !== undefined) {
      updateData.status = body.status;
    }

    if (body.admin_comment !== undefined) {
      updateData.admin_comment = body.admin_comment;
    }

    if (body.fixed_content !== undefined) {
      updateData.fixed_content = body.fixed_content;
    }

    const updatedIssue = await prisma.questionIssue.update({
      where: { id: issueId },
      data: updateData,
      include: {
        question: {
          select: {
            id: true,
            question_text: true,
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
          },
        },
      },
    });

    return Response.json({ issue: updatedIssue });
  } catch (error) {
    console.error("Failed to update question issue:", error);
    return Response.json(
      { message: "起票内容の更新に失敗しました。" },
      { status: 500 },
    );
  }
}
