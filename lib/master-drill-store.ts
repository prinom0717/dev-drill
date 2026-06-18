import { prisma } from "./prisma";

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
  question?: Question | null;
};

export type UserMarkRecord = {
  id: number;
  userId: string;
  questionId: number;
  markTitle: string;
  createdAt: string;
  question?: Question | null;
};

// keep seeds as fallback when DB is not populated
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
];

export const dummyUserId = "dummy_user";

function isNumericId(value: string | undefined) {
  return typeof value === "string" && /^[0-9]+$/.test(value);
}

export async function getQualifications(): Promise<Qualification[]> {
  try {
    const count = await prisma.exam.count();
    if (count === 0) return qualificationSeed;

    const exams = await prisma.exam.findMany({ include: { chapters: true } });
    return exams.map((exam: any) => ({
      id: String(exam.id),
      name: exam.exam_name ?? String(exam.id),
      description: exam.description ?? "",
      chapters: (exam.chapters ?? []).map((ch: any) => ({
        id: ch.chapter_number ?? ch.id,
        qualificationId: String(exam.id),
        title: ch.chapter_title,
      })),
    }));
  } catch (e) {
    return qualificationSeed;
  }
}

export async function getQualificationById(qualificationId: string) {
  // try numeric id first
  try {
    if (isNumericId(qualificationId)) {
      const exam = await prisma.exam.findUnique({ where: { id: Number(qualificationId) }, include: { chapters: true } });
      if (exam) return {
        id: String(exam.id),
        name: exam.exam_name ?? String(exam.id),
        description: exam.description ?? "",
        chapters: (exam.chapters ?? []).map((ch: any) => ({ id: ch.chapter_number ?? ch.id, qualificationId: String(exam.id), title: ch.chapter_title })),
      };
    }

    // try exam_name as fallback key
    const examByName = await prisma.exam.findFirst({ where: { exam_name: qualificationId }, include: { chapters: true } });
    if (examByName) return {
      id: String(examByName.id),
      name: examByName.exam_name ?? String(examByName.id),
      description: examByName.description ?? "",
      chapters: (examByName.chapters ?? []).map((ch: any) => ({ id: ch.chapter_number ?? ch.id, qualificationId: String(examByName.id), title: ch.chapter_title })),
    };
  } catch (e) {
    // ignore and fallback to seed
  }
 
  return qualificationSeed.find((q) => q.id === qualificationId) ?? null;
}

export async function getChaptersForQualification(qualificationId: string) {
  const qualification = await getQualificationById(qualificationId);
  return qualification?.chapters ?? [];
}

export async function getChapterById(qualificationId: string, chapterId: number) {
  const chapters = await getChaptersForQualification(qualificationId);
  return chapters.find((c: any) => c.id === chapterId) ?? null;
}

export async function getQuestionById(questionId: number) {
  try {
    const q = await prisma.question.findUnique({ where: { id: questionId } });
    if (!q) return questionSeed.find((x: any) => x.id === questionId) ?? null;
    return {
      id: q.id,
      qualificationId: String(q.chapter_id),
      chapterId: q.chapter_id,
      questionType: q.question_type as QuestionType,
      questionText: q.question_text,
      choices: Array.isArray(q.choices) ? (q.choices as string[]) : [],
      answer: q.answer,
      explanation: q.explanation ?? "",
      difficulty: q.difficulty ?? 1,
      createdAt: q.created_at.toISOString(),
    } as Question;
  } catch (e) {
    return questionSeed.find((x) => x.id === questionId) ?? null;
  }
}

export async function getQuestions(options?: { qualificationId?: string; chapterId?: number; limit?: number; random?: boolean; }) {
  try {
    // if qualificationId is numeric, query DB; otherwise fallback to seed filtering
    if (options?.qualificationId && isNumericId(options.qualificationId)) {
      const examId = Number(options.qualificationId);
      const where: any = {};
      if (typeof options.chapterId === "number") {
        where.chapter_id = options.chapterId;
      }
      // fetch questions whose chapter belongs to examId
      const questions = await prisma.question.findMany({ where: { chapter: { exam_id: examId }, ...where } as any });
      let mapped = questions.map((q: any) => ({
        id: q.id,
        qualificationId: String(examId),
        chapterId: q.chapter_id,
        questionType: q.question_type as QuestionType,
        questionText: q.question_text,
        choices: Array.isArray(q.choices) ? (q.choices as string[]) : [],
        answer: q.answer,
        explanation: q.explanation ?? "",
        difficulty: q.difficulty ?? 1,
        createdAt: q.created_at.toISOString(),
      } as Question));

      if (options.random) mapped = mapped.sort(() => Math.random() - 0.5);
      if (typeof options.limit === "number") mapped = mapped.slice(0, options.limit);
      return mapped;
    }
  } catch (e) {
    // ignore and fallback to seed
  }

  // fallback to in-memory seed
  let questions = questionSeed.slice();
  if (options?.qualificationId) questions = questions.filter((item) => item.qualificationId === options.qualificationId);
  if (typeof options?.chapterId === "number") questions = questions.filter((item) => item.chapterId === options.chapterId);
  if (options?.random) questions = questions.sort(() => Math.random() - 0.5);
  if (typeof options?.limit === "number") questions = questions.slice(0, options.limit);
  return questions;
}

export async function addQuestion(input: { qualificationId: string; chapterId: number; questionType: QuestionType; questionText: string; choices: string[]; answer: number; explanation?: string; difficulty?: number; }) {
  try {
    const created = await prisma.question.create({ data: {
      chapter_id: input.chapterId,
      question_type: input.questionType,
      question_text: input.questionText,
      choices: input.choices as any,
      answer: input.answer,
      explanation: input.explanation ?? "",
      difficulty: input.difficulty ?? 1,
    } });
    return await getQuestionById(created.id);
  } catch (e) {
    // fallback to seed behavior (not persisted)
    const id = (questionSeed.length === 0 ? 1 : Math.max(...questionSeed.map((q) => q.id)) + 1);
    const q: Question = { id, qualificationId: input.qualificationId, chapterId: input.chapterId, questionType: input.questionType, questionText: input.questionText, choices: input.choices, answer: input.answer, explanation: input.explanation ?? "", difficulty: input.difficulty ?? 1, createdAt: new Date().toISOString() };
    questionSeed.push(q);
    return q;
  }
}

export async function updateQuestion(input: { id: number; fields: Partial<Omit<Question, "id" | "createdAt">> }) {
  try {
    const data: any = { ...input.fields };
    if (data.choices) data.choices = data.choices as any;
    const updated = await prisma.question.update({ where: { id: input.id }, data });
    return await getQuestionById(updated.id);
  } catch (e) {
    // fallback: update seed
    const idx = questionSeed.findIndex((q) => q.id === input.id);
    if (idx === -1) return null;
    const updated = { ...questionSeed[idx], ...input.fields } as Question;
    questionSeed[idx] = updated;
    return updated;
  }
}

export async function deleteQuestion(id: number) {
  try {
    await prisma.question.delete({ where: { id } });
    return 1;
  } catch (e) {
    const before = questionSeed.length;
    const remaining = questionSeed.filter((q) => q.id !== id);
    if (remaining.length !== questionSeed.length) {
      questionSeed.length = 0;
      questionSeed.push(...remaining);
      return before - remaining.length;
    }
    return 0;
  }
}

export async function recordAnswer(input: { userId?: string; questionId: number; userAnswer: number; }) {
  const userId = input.userId?.trim() || dummyUserId;
  const question = await getQuestionById(input.questionId);
  if (!question) throw new Error("Question not found");
  const isCorrect = question.answer === input.userAnswer;
  try {
    // ensure user exists
    await prisma.user.upsert({ where: { id: userId }, update: {}, create: { id: userId } });
    const created = await prisma.userAnswer.create({ data: { user_id: userId, question_id: question.id, user_answer: String(input.userAnswer), is_correct: isCorrect } });

    // enforce max 5 per question per user
    const same = await prisma.userAnswer.findMany({ where: { user_id: userId, question_id: question.id }, orderBy: { answered_at: "desc" } });
    if (same.length > 5) {
      const toKeep = same.slice(0, 5).map((s: any) => s.id);
      await prisma.userAnswer.deleteMany({ where: { user_id: userId, question_id: question.id, id: { notIn: toKeep } } });
    }
    return { record: { id: created.id, userId: created.user_id, questionId: created.question_id, userAnswer: created.user_answer ?? "", isCorrect: created.is_correct, answeredAt: created.answered_at.toISOString() }, question, isCorrect, correctAnswer: question.answer };
  } catch (e) {
    // fallback to in-memory store (not persisted)
    const record: UserAnswerRecord = { id: Date.now(), userId, questionId: question.id, userAnswer: String(input.userAnswer), isCorrect, answeredAt: new Date().toISOString(), question };
    return { record, question, isCorrect, correctAnswer: question.answer };
  }
}

export async function getHistory(userId = dummyUserId) {
  try {
    const rows = await prisma.userAnswer.findMany({ where: { user_id: userId }, include: { question: true }, orderBy: { answered_at: "desc" } });
    return rows.map((r: any) => ({ id: r.id, userId: r.user_id, questionId: r.question_id, userAnswer: r.user_answer ?? "", isCorrect: r.is_correct, answeredAt: r.answered_at.toISOString(), question: r.question ? { id: r.question.id, qualificationId: String(r.question.chapter_id), chapterId: r.question.chapter_id, questionType: r.question.question_type as QuestionType, questionText: r.question.question_text, choices: Array.isArray(r.question.choices) ? (r.question.choices as string[]) : [], answer: r.question.answer, explanation: r.question.explanation ?? "", difficulty: r.question.difficulty ?? 1, createdAt: r.question.created_at.toISOString() } : null }));
  } catch (e) {
    return [];
  }
}

export async function getQuestionHistoryCount(userId: string, questionId: number) {
  try {
    return await prisma.userAnswer.count({ where: { user_id: userId, question_id: questionId } });
  } catch (e) {
    return 0;
  }
}

export async function getMarks(userId = dummyUserId) {
  try {
    const rows = await prisma.userMark.findMany({ where: { user_id: userId }, include: { question: true }, orderBy: { created_at: "desc" } });
    return rows.map((r: any) => ({ id: r.id, userId: r.user_id, questionId: r.question_id, markTitle: r.mark_title ?? "", createdAt: r.created_at.toISOString(), question: r.question ? { id: r.question.id, qualificationId: String(r.question.chapter_id), chapterId: r.question.chapter_id, questionType: r.question.question_type as QuestionType, questionText: r.question.question_text, choices: Array.isArray(r.question.choices) ? (r.question.choices as string[]) : [], answer: r.question.answer, explanation: r.question.explanation ?? "", difficulty: r.question.difficulty ?? 1, createdAt: r.question.created_at.toISOString() } : null }));
  } catch (e) {
    return [];
  }
}

export async function addMark(input: { userId?: string; questionId: number; markTitle?: string; }) {
  const userId = input.userId?.trim() || dummyUserId;
  try {
    await prisma.user.upsert({ where: { id: userId }, update: {}, create: { id: userId } });
    const currentCount = await prisma.userMark.count({ where: { user_id: userId, question_id: input.questionId } });
    if (currentCount >= 5) return { ok: false as const, message: "同じ問題には最大5件まで登録できます。" };
    const created = await prisma.userMark.create({ data: { user_id: userId, question_id: input.questionId, mark_title: input.markTitle ?? undefined } });
    return { ok: true as const, record: { id: created.id, userId: created.user_id, questionId: created.question_id, markTitle: created.mark_title ?? "", createdAt: created.created_at.toISOString() } };
  } catch (e) {
    return { ok: false as const, message: "DB error" };
  }
}

export async function removeMark(input: { userId?: string; questionId: number; markId?: number; }) {
  const userId = input.userId?.trim() || dummyUserId;
  try {
    if (typeof input.markId === "number") {
      const deleted = await prisma.userMark.deleteMany({ where: { id: input.markId, user_id: userId, question_id: input.questionId } });
      return { removed: deleted.count };
    }
    const deleted = await prisma.userMark.deleteMany({ where: { user_id: userId, question_id: input.questionId } });
    return { removed: deleted.count };
  } catch (e) {
    return { removed: 0 };
  }
}

export async function getStats(userId = dummyUserId) {
  try {
    const history = await getHistory(userId);
    const total = history.length;
    const correct = history.filter((h: any) => h.isCorrect).length;
    const accuracy = total === 0 ? 0 : Math.round((correct / total) * 100);
    const marks = (await prisma.userMark.count({ where: { user_id: userId } })) || 0;
    return { userId, totalAnswers: total, correctAnswers: correct, accuracy, marks, latestHistory: history.slice(0, 5) };
  } catch (e) {
    return { userId, totalAnswers: 0, correctAnswers: 0, accuracy: 0, marks: 0, latestHistory: [] };
  }
}

