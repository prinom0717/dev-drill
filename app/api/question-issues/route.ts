import { prisma } from "@/lib/prisma";
import { requireAuth, isAuthError } from "@/lib/auth/require-auth";
import { validateIssueSubmission, checkDuplicateIssue } from "@/lib/question-issues/validation";
import { IssueStatus } from "@/lib/question-issues/types";

export async function POST(request: Request) {
  const authResult = await requireAuth(request);
  if (isAuthError(authResult)) {
    return authResult;
  }

  const user = authResult;

  const body = (await request.json().catch(() => null)) as
    | { questionId?: number; examId?: number; issueType?: string; description?: string }
    | null;

  if (!body?.issueType) {
    return Response.json(
      { message: "issueType は必須です。" },
      { status: 400 },
    );
  }

  const validation = await validateIssueSubmission(
    user.id,
    body.questionId || null,
    body.examId || null,
    body.issueType,
    body.description || "",
  );

  if (!validation.isValid) {
    return Response.json(
      { message: "バリデーションエラー", errors: validation.errors },
      { status: 400 },
    );
  }

  const duplicateCheck = await checkDuplicateIssue(
    user.id,
    body.questionId || null,
    body.issueType,
    body.description || "",
  );

  if (duplicateCheck.isDuplicate) {
    return Response.json(
      {
        message: "同様の不備が起票されています。",
        existingIssue: duplicateCheck.existingIssue,
      },
      { status: 409 },
    );
  }

  try {
    const issue = await prisma.questionIssue.create({
      data: {
        question_id: body.questionId || null,
        exam_id: body.examId || null,
        user_id: user.id,
        issue_type: body.issueType,
        description: body.description || "",
        status: IssueStatus.OPEN,
      },
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

    return Response.json({ issue }, { status: 201 });
  } catch (error) {
    console.error("Failed to create question issue:", error);
    return Response.json(
      { message: "不備起票の作成に失敗しました。" },
      { status: 500 },
    );
  }
}
