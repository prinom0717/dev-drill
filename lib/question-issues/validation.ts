import { prisma } from "@/lib/prisma";
import { IssueType, IssueStatus, isValidIssueType, isValidIssueStatus } from "./types";

export const MIN_DESCRIPTION_LENGTH = 20;
export const SPAM_COOLDOWN_MINUTES = 60;

export interface ValidationError {
  field: string;
  message: string;
}

export function validateIssueDescription(description: string): ValidationError | null {
  if (!description || description.trim().length === 0) {
    return { field: "description", message: "起票内容を入力してください。" };
  }
  if (description.trim().length < MIN_DESCRIPTION_LENGTH) {
    return {
      field: "description",
      message: `起票内容は${MIN_DESCRIPTION_LENGTH}文字以上で入力してください。`,
    };
  }
  return null;
}

export function validateIssueType(issueType: string): ValidationError | null {
  if (!issueType || !isValidIssueType(issueType)) {
    return { field: "issueType", message: "起票種別を選択してください。" };
  }
  return null;
}

export function validateIssueStatus(status: string): ValidationError | null {
  if (!status || !isValidIssueStatus(status)) {
    return { field: "status", message: "無効なステータスです。" };
  }
  return null;
}

export function validateQuestionRequest(
  examId: number,
  description: string,
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!examId) {
    errors.push({ field: "examId", message: "試験を選択してください。" });
  }

  return errors;
}

export function validateIssueReport(
  questionId: number,
  description: string,
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!questionId) {
    errors.push({ field: "questionId", message: "問題IDは必須です。" });
  }

  const descriptionError = validateIssueDescription(description);
  if (descriptionError) {
    errors.push(descriptionError);
  }

  return errors;
}

export async function checkSpamCooldown(
  userId: number,
  questionId: number | null,
): Promise<{ isSpam: boolean; error?: ValidationError }> {
  if (!questionId) {
    return { isSpam: false };
  }

  const cooldownDate = new Date();
  cooldownDate.setMinutes(cooldownDate.getMinutes() - SPAM_COOLDOWN_MINUTES);

  const recentIssue = await prisma.questionIssue.findFirst({
    where: {
      user_id: userId,
      question_id: questionId,
      created_at: {
        gte: cooldownDate,
      },
    },
  });

  if (recentIssue) {
    return {
      isSpam: true,
      error: {
        field: "description",
        message: `同一問題に対する起票は${SPAM_COOLDOWN_MINUTES}分に1回までです。`,
      },
    };
  }

  return { isSpam: false };
}

export async function checkDuplicateIssue(
  userId: number,
  questionId: number | null,
  issueType: string,
  description: string,
): Promise<{ isDuplicate: boolean; existingIssue?: any }> {
  if (!questionId || issueType === IssueType.QUESTION_REQUEST) {
    return { isDuplicate: false };
  }

  const existingIssue = await prisma.questionIssue.findFirst({
    where: {
      user_id: userId,
      question_id: questionId,
      issue_type: issueType,
      status: {
        in: [IssueStatus.OPEN, IssueStatus.IN_PROGRESS],
      },
    },
    orderBy: {
      created_at: "desc",
    },
  });

  if (existingIssue) {
    const similarity = calculateTextSimilarity(description, existingIssue.description);
    if (similarity > 0.8) {
      return { isDuplicate: true, existingIssue };
    }
  }

  return { isDuplicate: false };
}

function calculateTextSimilarity(text1: string, text2: string): number {
  const normalized1 = text1.toLowerCase().trim();
  const normalized2 = text2.toLowerCase().trim();

  if (normalized1 === normalized2) return 1.0;

  const words1 = normalized1.split(/\s+/);
  const words2 = normalized2.split(/\s+/);

  const intersection = words1.filter((word) => words2.includes(word));
  const union = [...new Set([...words1, ...words2])];

  return intersection.length / union.length;
}

export async function validateIssueSubmission(
  userId: number,
  questionId: number | null,
  examId: number | null,
  issueType: string,
  description: string,
): Promise<{ isValid: boolean; errors: ValidationError[] }> {
  const errors: ValidationError[] = [];

  const typeError = validateIssueType(issueType);
  if (typeError) errors.push(typeError);

  if (issueType === IssueType.QUESTION_REQUEST) {
    const questionRequestErrors = validateQuestionRequest(examId || 0, description);
    errors.push(...questionRequestErrors);
  } else {
    const issueReportErrors = validateIssueReport(questionId || 0, description);
    errors.push(...issueReportErrors);
  }

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  if (questionId && issueType !== IssueType.QUESTION_REQUEST) {
    const spamCheck = await checkSpamCooldown(userId, questionId);
    if (spamCheck.isSpam && spamCheck.error) {
      errors.push(spamCheck.error);
    }
  }

  return { isValid: errors.length === 0, errors };
}
