export enum IssueType {
  TYPO = "TYPO",
  INCORRECT_CONTENT = "INCORRECT_CONTENT",
  INSUFFICIENT_EXPLANATION = "INSUFFICIENT_EXPLANATION",
  UNCLEAR_EXPRESSION = "UNCLEAR_EXPRESSION",
  OTHER = "OTHER",
  QUESTION_REQUEST = "QUESTION_REQUEST",
}

export enum IssueStatus {
  OPEN = "OPEN",
  IN_PROGRESS = "IN_PROGRESS",
  RESOLVED = "RESOLVED",
  REJECTED = "REJECTED",
}

export const ISSUE_TYPE_LABELS: Record<IssueType, string> = {
  [IssueType.TYPO]: "誤字・脱字",
  [IssueType.INCORRECT_CONTENT]: "内容が誤っている",
  [IssueType.INSUFFICIENT_EXPLANATION]: "解説が不十分/誤り",
  [IssueType.UNCLEAR_EXPRESSION]: "表現が分かりにくい",
  [IssueType.QUESTION_REQUEST]: "問題追加リクエスト",
  [IssueType.OTHER]: "その他",
};

export const STATUS_LABELS: Record<IssueStatus, string> = {
  [IssueStatus.OPEN]: "未対応",
  [IssueStatus.IN_PROGRESS]: "対応中",
  [IssueStatus.RESOLVED]: "対応済み",
  [IssueStatus.REJECTED]: "却下",
};

export function isValidIssueType(value: string): value is IssueType {
  return Object.values(IssueType).includes(value as IssueType);
}

export function isValidIssueStatus(value: string): value is IssueStatus {
  return Object.values(IssueStatus).includes(value as IssueStatus);
}

export function getIssueTypeLabel(type: string): string {
  if (isValidIssueType(type)) {
    return ISSUE_TYPE_LABELS[type];
  }
  return type;
}

export function getStatusLabel(status: string): string {
  if (isValidIssueStatus(status)) {
    return STATUS_LABELS[status];
  }
  return status;
}
