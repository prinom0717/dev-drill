import type { ValidationError, ValidationResult } from "@/lib/validation";

const USERID_PATTERN = /^[a-zA-Z0-9._-]{3,50}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function result(errors: ValidationError[]): ValidationResult {
  return { isValid: errors.length === 0, errors };
}

export function validateRegisterInput(input: {
  userid?: string;
  password?: string;
  email?: string | null;
}): ValidationResult {
  const errors: ValidationError[] = [];
  const userid = input.userid?.trim() ?? "";
  const password = input.password ?? "";
  const email = input.email?.trim() ?? "";

  if (!userid) {
    errors.push({ field: "userid", message: "ユーザーIDを入力してください" });
  } else if (!USERID_PATTERN.test(userid)) {
    errors.push({
      field: "userid",
      message: "ユーザーIDは3〜50文字の英数字・._- のみ使用できます",
    });
  }

  if (!password) {
    errors.push({ field: "password", message: "パスワードを入力してください" });
  } else if (password.length < 8) {
    errors.push({ field: "password", message: "パスワードは8文字以上必要です" });
  }

  if (email && !EMAIL_PATTERN.test(email)) {
    errors.push({ field: "email", message: "メールアドレスの形式が正しくありません" });
  }

  return result(errors);
}

export function validateLoginInput(input: {
  userid?: string;
  password?: string;
}): ValidationResult {
  const errors: ValidationError[] = [];
  const userid = input.userid?.trim() ?? "";
  const password = input.password ?? "";

  if (!userid) {
    errors.push({ field: "userid", message: "ユーザーIDを入力してください" });
  }

  if (!password) {
    errors.push({ field: "password", message: "パスワードを入力してください" });
  }

  return result(errors);
}

export function validateCreateUserInput(input: {
  userid?: string;
  password?: string;
  email?: string | null;
}): ValidationResult {
  return validateRegisterInput(input);
}
