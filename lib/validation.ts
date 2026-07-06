/**
 * バリデーションエラーの型
 */
export interface ValidationError {
  field: string;
  message: string;
}

/**
 * バリデーション結果の型
 */
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * 問題文のバリデーション
 * - 50〜300文字推奨
 * - 句読点の連続禁止
 */
export function validateQuestionText(text: string): ValidationResult {
  const errors: ValidationError[] = [];

  // 空欄チェック
  if (!text || text.trim().length === 0) {
    errors.push({ field: 'questionText', message: '問題文を入力してください' });
    return { isValid: false, errors };
  }

  // 文字数チェック（推奨）
  const length = text.trim().length;
  if (length < 50) {
    errors.push({ field: 'questionText', message: '問題文は50文字以上推奨です（現在: ' + length + '文字）' });
  } else if (length > 300) {
    errors.push({ field: 'questionText', message: '問題文は300文字以下推奨です（現在: ' + length + '文字）' });
  }

  // 句読点の連続チェック
  if (/(。|、){2,}/.test(text)) {
    errors.push({ field: 'questionText', message: '句読点が連続しています' });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * 選択肢のバリデーション
 * - 空欄禁止
 * - 全選択肢がユニーク
 * - 正解番号が1〜4の範囲内
 */
export function validateChoices(choices: string[], answer: number): ValidationResult {
  const errors: ValidationError[] = [];

  // 選択肢数チェック
  if (!choices || choices.length !== 4) {
    errors.push({ field: 'choices', message: '選択肢は4つ必要です' });
    return { isValid: false, errors };
  }

  // 空欄チェック
  choices.forEach((choice, index) => {
    if (!choice || choice.trim().length === 0) {
      errors.push({ field: 'choices', message: `選択肢${index + 1}が空欄です` });
    }
  });

  // ユニークチェック
  const trimmedChoices = choices.map(c => c.trim());
  const uniqueChoices = new Set(trimmedChoices);
  if (uniqueChoices.size !== trimmedChoices.length) {
    errors.push({ field: 'choices', message: '選択肢が重複しています' });
  }

  // 正解番号チェック
  if (isNaN(answer) || answer < 1 || answer > 4) {
    errors.push({ field: 'answer', message: '正解番号は1〜4の範囲で指定してください' });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * 解説のバリデーション
 * - 正解と整合していること（簡易チェック：解説が空でないこと）
 * - 選択肢の説明と矛盾しないこと（簡易チェック：解説が空でないこと）
 */
export function validateExplanation(explanation: string): ValidationResult {
  const errors: ValidationError[] = [];

  // 空欄チェック（任意だが、推奨）
  if (!explanation || explanation.trim().length === 0) {
    errors.push({ field: 'explanation', message: '解説を入力してください' });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * 難易度のバリデーション
 * - 1〜5の範囲内
 */
export function validateDifficulty(difficulty: number): ValidationResult {
  const errors: ValidationError[] = [];

  if (isNaN(difficulty) || difficulty < 1 || difficulty > 5) {
    errors.push({ field: 'difficulty', message: '難易度は1〜5の範囲で指定してください' });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * 科目と章の組み合わせバリデーション
 * - 科目と章の組み合わせが正しいかチェック
 */
export function validateChapterMapping(
  examId: number | null,
  chapterId: number | null,
  availableChapters: Array<{ id: number; examId: number }>
): ValidationResult {
  const errors: ValidationError[] = [];

  if (!examId) {
    errors.push({ field: 'examId', message: '科目を選択してください' });
  }

  if (!chapterId) {
    errors.push({ field: 'chapterId', message: '章を選択してください' });
  }

  // 科目と章の組み合わせチェック
  if (examId && chapterId) {
    const isValidCombination = availableChapters.some(
      ch => ch.id === chapterId && ch.examId === examId
    );
    if (!isValidCombination) {
      errors.push({ field: 'chapterId', message: '選択された科目と章の組み合わせが正しくありません' });
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * 問題全体のバリデーション
 * 全てのバリデーションを実行し、結果をまとめて返す
 */
export function validateQuestion(data: {
  questionText: string;
  choices: string[];
  answer: number;
  explanation: string;
  difficulty: number;
  examId: number | null;
  chapterId: number | null;
  availableChapters?: Array<{ id: number; examId: number }>;
}): ValidationResult {
  const allErrors: ValidationError[] = [];

  const questionTextResult = validateQuestionText(data.questionText);
  allErrors.push(...questionTextResult.errors);

  const choicesResult = validateChoices(data.choices, data.answer);
  allErrors.push(...choicesResult.errors);

  const explanationResult = validateExplanation(data.explanation);
  allErrors.push(...explanationResult.errors);

  const difficultyResult = validateDifficulty(data.difficulty);
  allErrors.push(...difficultyResult.errors);

  if (data.availableChapters) {
    const chapterResult = validateChapterMapping(
      data.examId,
      data.chapterId,
      data.availableChapters
    );
    allErrors.push(...chapterResult.errors);
  }

  return {
    isValid: allErrors.length === 0,
    errors: allErrors
  };
}
