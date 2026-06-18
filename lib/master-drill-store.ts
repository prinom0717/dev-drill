export type QuestionType = "choice";

export type Qualification = {
  id: string;
  name: string;
  description: string;
  chapters: Chapter[];
};

export type Chapter = {
  id: number;
  qualificationId: string;
  title: string;
};

export type Question = {
  id: number;
  qualificationId: string;
  chapterId: number;
  questionType: QuestionType;
  questionText: string;
  choices: string[];
  answer: number;
  explanation: string;
  difficulty: number;
  createdAt: string;
};

export type UserAnswerRecord = {
  id: number;
  userId: string;
  questionId: number;
  userAnswer: string;
  isCorrect: boolean;
  answeredAt: string;
};

export type UserMarkRecord = {
  id: number;
  userId: string;
  questionId: number;
  markTitle: string;
  createdAt: string;
};

type StoreState = {
  qualifications: Qualification[];
  questions: Question[];
  history: UserAnswerRecord[];
  marks: UserMarkRecord[];
  nextAnswerId: number;
  nextMarkId: number;
};

const qualificationSeed: Qualification[] = [
  {
    id: "fe",
    name: "基本情報技術者試験",
    description: "ITの基礎を固めるための定番資格。",
    chapters: [
      { id: 1, qualificationId: "fe", title: "第1章 セキュリティ" },
      { id: 2, qualificationId: "fe", title: "第2章 ネットワーク" },
      { id: 3, qualificationId: "fe", title: "第3章 データベース" },
    ],
  },
  {
    id: "ap",
    name: "応用情報技術者試験",
    description: "設計・運用まで視野を広げる中級資格。",
    chapters: [
      { id: 1, qualificationId: "ap", title: "第1章 マネジメント" },
      { id: 2, qualificationId: "ap", title: "第2章 システム戦略" },
      { id: 3, qualificationId: "ap", title: "第3章 アーキテクチャ" },
    ],
  },
  {
    id: "nw",
    name: "ネットワークスペシャリスト",
    description: "ネットワーク設計と運用を深く学ぶ上級資格。",
    chapters: [
      { id: 1, qualificationId: "nw", title: "第1章 TCP/IP" },
      { id: 2, qualificationId: "nw", title: "第2章 ルーティング" },
      { id: 3, qualificationId: "nw", title: "第3章 セキュア通信" },
    ],
  },
  {
    id: "sc",
    name: "情報処理安全確保支援士",
    description: "セキュリティ対策の実務に強くなるための資格。",
    chapters: [
      { id: 1, qualificationId: "sc", title: "第1章 暗号と認証" },
      { id: 2, qualificationId: "sc", title: "第2章 脆弱性対策" },
      { id: 3, qualificationId: "sc", title: "第3章 インシデント対応" },
    ],
  },
];

const questionSeed: Question[] = [
  {
    id: 101,
    qualificationId: "fe",
    chapterId: 1,
    questionType: "choice",
    questionText: "公開鍵暗号方式で正しい説明はどれか。",
    choices: [
      "暗号化と復号に同じ鍵を使う",
      "公開鍵と秘密鍵の組を使う",
      "平文をそのまま送信する",
      "必ずハッシュ関数だけで暗号化する",
    ],
    answer: 2,
    explanation: "公開鍵暗号方式では、公開鍵で暗号化し秘密鍵で復号するなど、鍵の組を利用する。",
    difficulty: 2,
    createdAt: "2026-06-17T00:00:00.000Z",
  },
  {
    id: 102,
    qualificationId: "fe",
    chapterId: 2,
    questionType: "choice",
    questionText: "TCPの特徴として適切なものはどれか。",
    choices: [
      "コネクションレスである",
      "順序保証や再送制御がある",
      "必ず暗号化される",
      "アドレス解決を行う",
    ],
    answer: 2,
    explanation: "TCPはコネクション型で、順序保証と再送制御を備える。",
    difficulty: 2,
    createdAt: "2026-06-17T00:00:00.000Z",
  },
  {
    id: 103,
    qualificationId: "fe",
    chapterId: 3,
    questionType: "choice",
    questionText: "リレーショナルデータベースの主キーの役割として最も適切なものはどれか。",
    choices: [
      "表の行を一意に識別する",
      "必ず暗号化を行う",
      "SQL文を自動生成する",
      "テーブルを削除する",
    ],
    answer: 1,
    explanation: "主キーは各行を一意に識別するための列または列の組み合わせ。",
    difficulty: 1,
    createdAt: "2026-06-17T00:00:00.000Z",
  },
  {
    id: 201,
    qualificationId: "ap",
    chapterId: 1,
    questionType: "choice",
    questionText: "プロジェクトマネジメントでスコープ管理の目的はどれか。",
    choices: [
      "品質を高めるためだけに実施する",
      "作業範囲を明確にし、変更を管理する",
      "サーバー費用を固定する",
      "テストを省略する",
    ],
    answer: 2,
    explanation: "スコープ管理は、プロジェクトの作業範囲を明確にし、変更を統制する。",
    difficulty: 3,
    createdAt: "2026-06-17T00:00:00.000Z",
  },
  {
    id: 202,
    qualificationId: "ap",
    chapterId: 3,
    questionType: "choice",
    questionText: "マイクロサービスの利点として適切なものはどれか。",
    choices: [
      "全ての機能を単一の巨大なモジュールに閉じ込める",
      "サービスごとに独立して開発・デプロイしやすい",
      "必ず通信量がゼロになる",
      "データベース設計が不要になる",
    ],
    answer: 2,
    explanation: "マイクロサービスでは機能ごとに分割し、独立した開発・運用がしやすい。",
    difficulty: 3,
    createdAt: "2026-06-17T00:00:00.000Z",
  },
  {
    id: 301,
    qualificationId: "nw",
    chapterId: 1,
    questionType: "choice",
    questionText: "IPv4アドレスの長さはどれか。",
    choices: ["16ビット", "32ビット", "64ビット", "128ビット"],
    answer: 2,
    explanation: "IPv4は32ビット長のアドレスを利用する。",
    difficulty: 1,
    createdAt: "2026-06-17T00:00:00.000Z",
  },
  {
    id: 302,
    qualificationId: "nw",
    chapterId: 2,
    questionType: "choice",
    questionText: "ルーティングの役割として適切なものはどれか。",
    choices: [
      "通信経路を選択する",
      "電源を供給する",
      "画像を圧縮する",
      "文字コードを変換する",
    ],
    answer: 1,
    explanation: "ルータは宛先までの経路を選択して転送する。",
    difficulty: 2,
    createdAt: "2026-06-17T00:00:00.000Z",
  },
  {
    id: 401,
    qualificationId: "sc",
    chapterId: 1,
    questionType: "choice",
    questionText: "認証の三要素に含まれないものはどれか。",
    choices: ["知識情報", "所持情報", "生体情報", "電力情報"],
    answer: 4,
    explanation: "認証の三要素は知識情報、所持情報、生体情報。",
    difficulty: 1,
    createdAt: "2026-06-17T00:00:00.000Z",
  },
  {
    id: 402,
    qualificationId: "sc",
    chapterId: 3,
    questionType: "choice",
    questionText: "インシデント対応の初動として最も適切なものはどれか。",
    choices: [
      "原因調査をせずに放置する",
      "被害拡大を抑えつつ状況を把握する",
      "すぐに全端末を廃棄する",
      "ログを必ず削除する",
    ],
    answer: 2,
    explanation: "初動は封じ込めと状況把握を優先し、被害拡大を止める。",
    difficulty: 3,
    createdAt: "2026-06-17T00:00:00.000Z",
  },
];

const globalForStore = globalThis as typeof globalThis & {
  __masterDrillStore?: StoreState;
};

const store: StoreState =
  globalForStore.__masterDrillStore ?? {
    qualifications: qualificationSeed,
    questions: questionSeed,
    history: [],
    marks: [],
    nextAnswerId: 1,
    nextMarkId: 1,
  };

if (!globalForStore.__masterDrillStore) {
  globalForStore.__masterDrillStore = store;
}

export const dummyUserId = "dummy_user";

export function getQualifications() {
  return store.qualifications;
}

export function getQualificationById(qualificationId: string) {
  return store.qualifications.find((item) => item.id === qualificationId) ?? null;
}

export function getChaptersForQualification(qualificationId: string) {
  const qualification = getQualificationById(qualificationId);
  return qualification?.chapters ?? [];
}

export function getChapterById(qualificationId: string, chapterId: number) {
  return getChaptersForQualification(qualificationId).find((chapter) => chapter.id === chapterId) ?? null;
}

export function getQuestionById(questionId: number) {
  return store.questions.find((item) => item.id === questionId) ?? null;
}

export function getQuestions(options?: {
  qualificationId?: string;
  chapterId?: number;
  limit?: number;
  random?: boolean;
}) {
  let questions = store.questions.slice();

  if (options?.qualificationId) {
    questions = questions.filter((item) => item.qualificationId === options.qualificationId);
  }

  if (typeof options?.chapterId === "number") {
    questions = questions.filter((item) => item.chapterId === options.chapterId);
  }

  if (options?.random) {
    questions = questions.sort(() => Math.random() - 0.5);
  }

  if (typeof options?.limit === "number") {
    questions = questions.slice(0, options.limit);
  }

  return questions;
}

export function recordAnswer(input: {
  userId?: string;
  questionId: number;
  userAnswer: number;
}) {
  const userId = input.userId?.trim() || dummyUserId;
  const question = getQuestionById(input.questionId);

  if (!question) {
    throw new Error("Question not found");
  }

  const isCorrect = question.answer === input.userAnswer;
  const record: UserAnswerRecord = {
    id: store.nextAnswerId,
    userId,
    questionId: question.id,
    userAnswer: String(input.userAnswer),
    isCorrect,
    answeredAt: new Date().toISOString(),
  };

  store.nextAnswerId += 1;
  store.history = [record, ...store.history];

  const sameQuestionHistory = store.history.filter(
    (entry) => entry.userId === userId && entry.questionId === question.id,
  );

  if (sameQuestionHistory.length > 5) {
    const idsToKeep = new Set(sameQuestionHistory.slice(0, 5).map((entry) => entry.id));
    store.history = store.history.filter(
      (entry) =>
        entry.userId !== userId ||
        entry.questionId !== question.id ||
        idsToKeep.has(entry.id),
    );
  }

  return {
    record,
    question,
    isCorrect,
    correctAnswer: question.answer,
  };
}

export function getHistory(userId = dummyUserId) {
  return store.history
    .filter((entry) => entry.userId === userId)
    .map((entry) => {
      const question = getQuestionById(entry.questionId);
      return {
        ...entry,
        question,
      };
    })
    .sort((left, right) => right.answeredAt.localeCompare(left.answeredAt));
}

export function getQuestionHistoryCount(userId: string, questionId: number) {
  return store.history.filter((entry) => entry.userId === userId && entry.questionId === questionId).length;
}

export function getMarks(userId = dummyUserId) {
  return store.marks
    .filter((entry) => entry.userId === userId)
    .map((entry) => ({
      ...entry,
      question: getQuestionById(entry.questionId),
    }))
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}

export function addMark(input: {
  userId?: string;
  questionId: number;
  markTitle?: string;
}) {
  const userId = input.userId?.trim() || dummyUserId;
  const question = getQuestionById(input.questionId);

  if (!question) {
    throw new Error("Question not found");
  }

  const currentCount = store.marks.filter(
    (entry) => entry.userId === userId && entry.questionId === question.id,
  ).length;

  if (currentCount >= 5) {
    return { ok: false as const, message: "同じ問題には最大5件まで登録できます。" };
  }

  const record: UserMarkRecord = {
    id: store.nextMarkId,
    userId,
    questionId: question.id,
    markTitle: input.markTitle?.trim() || `チェック ${currentCount + 1}`,
    createdAt: new Date().toISOString(),
  };

  store.nextMarkId += 1;
  store.marks = [...store.marks, record];

  return { ok: true as const, record };
}

export function removeMark(input: {
  userId?: string;
  questionId: number;
  markId?: number;
}) {
  const userId = input.userId?.trim() || dummyUserId;

  const before = store.marks.length;
  store.marks = store.marks.filter((entry) => {
    if (entry.userId !== userId || entry.questionId !== input.questionId) {
      return true;
    }

    if (typeof input.markId === "number") {
      return entry.id !== input.markId;
    }

    return false;
  });

  return { removed: before - store.marks.length };
}

export function getStats(userId = dummyUserId) {
  const history = getHistory(userId);
  const total = history.length;
  const correct = history.filter((entry) => entry.isCorrect).length;
  const accuracy = total === 0 ? 0 : Math.round((correct / total) * 100);

  return {
    userId,
    totalAnswers: total,
    correctAnswers: correct,
    accuracy,
    marks: getMarks(userId).length,
    latestHistory: history.slice(0, 5),
  };
}
