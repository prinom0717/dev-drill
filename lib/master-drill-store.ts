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

export const dummyUserId = "dummy_user";
export const BUFFER_TIME_MS = 86400000;

function isNumericId(value: string | undefined) {
  return typeof value === "string" && /^[0-9]+$/.test(value);
}

export async function getQualifications(): Promise<Qualification[]> {
  try {
    const exams = await prisma.exam.findMany({ 
      include: { 
        chapters: { 
          orderBy: { id: 'asc' }
        } 
      },
      orderBy: { id: 'asc' }
    });
    return exams.map((exam: any) => ({
      id: String(exam.id),
      name: exam.exam_name ?? String(exam.id),
      description: exam.description ?? "",
      chapters: (exam.chapters ?? []).map((ch: any) => ({
        id: ch.id,
        qualificationId: String(exam.id),
        title: ch.chapter_title,
      })),
    }));
  } catch (e) {
    throw new Error(`Failed to fetch qualifications: ${e instanceof Error ? e.message : String(e)}`);
  }
}

export async function getQualificationById(qualificationId: string) {
  try {
    if (isNumericId(qualificationId)) {
      const exam = await prisma.exam.findUnique({ where: { id: Number(qualificationId) }, include: { chapters: true } });
      if (exam) return {
        id: String(exam.id),
        name: exam.exam_name ?? String(exam.id),
        description: exam.description ?? "",
        chapters: (exam.chapters ?? []).map((ch: any) => ({ id: ch.id, qualificationId: String(exam.id), title: ch.chapter_title })),
      };
    }

    const examByName = await prisma.exam.findFirst({ where: { exam_name: qualificationId }, include: { chapters: true } });
    if (examByName) return {
      id: String(examByName.id),
      name: examByName.exam_name ?? String(examByName.id),
      description: examByName.description ?? "",
      chapters: (examByName.chapters ?? []).map((ch: any) => ({ id: ch.id, qualificationId: String(examByName.id), title: ch.chapter_title })),
    };

    return null;
  } catch (e) {
    throw new Error(`Failed to fetch qualification: ${e instanceof Error ? e.message : String(e)}`);
  }
}

export async function getChaptersForQualification(qualificationId: string) {
  const qualification = await getQualificationById(qualificationId);
  return qualification?.chapters ?? [];
}

export async function getExams() {
  try {
    const exams = await prisma.exam.findMany({ orderBy: { id: 'asc' } });
    return exams.map((exam: any) => ({
      id: exam.id,
      examName: exam.exam_name ?? String(exam.id),
      description: exam.description ?? "",
    }));
  } catch (e) {
    throw new Error(`Failed to fetch exams: ${e instanceof Error ? e.message : String(e)}`);
  }
}

export async function addExam(input: { examName: string; description: string }) {
  try {
    const created = await prisma.exam.create({
      data: {
        exam_name: input.examName,
        description: input.description,
      },
    });
    return {
      id: created.id,
      examName: created.exam_name,
      description: created.description ?? "",
    };
  } catch (e) {
    throw new Error(`Failed to add exam: ${e instanceof Error ? e.message : String(e)}`);
  }
}

export async function updateExam(id: number, input: { examName?: string; description?: string }) {
  try {
    const updated = await prisma.exam.update({
      where: { id },
      data: {
        ...(input.examName && { exam_name: input.examName }),
        ...(input.description !== undefined && { description: input.description }),
      },
    });
    return {
      id: updated.id,
      examName: updated.exam_name,
      description: updated.description ?? "",
    };
  } catch (e) {
    throw new Error(`Failed to update exam: ${e instanceof Error ? e.message : String(e)}`);
  }
}

export async function deleteExam(id: number) {
  try {
    await prisma.exam.delete({ where: { id } });
    return true;
  } catch (e) {
    throw new Error(`Failed to delete exam: ${e instanceof Error ? e.message : String(e)}`);
  }
}

export async function getChapters(examId: number) {
  try {
    const chapters = await prisma.examChapter.findMany({ 
      where: { exam_id: examId },
      orderBy: { chapter_number: 'asc' }
    });
    return chapters.map((ch: any) => ({
      id: ch.id,
      examId: ch.exam_id,
      chapterNumber: ch.chapter_number,
      chapterTitle: ch.chapter_title,
      coverage: ch.coverage,
    }));
  } catch (e) {
    throw new Error(`Failed to fetch chapters: ${e instanceof Error ? e.message : String(e)}`);
  }
}

export async function addChapter(input: { examId: number; chapterNumber: number; chapterTitle: string; coverage?: string }) {
  try {
    const created = await prisma.examChapter.create({
      data: {
        exam_id: input.examId,
        chapter_number: input.chapterNumber,
        chapter_title: input.chapterTitle,
        coverage: input.coverage,
      },
    });
    return {
      id: created.id,
      examId: created.exam_id,
      chapterNumber: created.chapter_number,
      chapterTitle: created.chapter_title,
      coverage: created.coverage,
    };
  } catch (e) {
    throw new Error(`Failed to add chapter: ${e instanceof Error ? e.message : String(e)}`);
  }
}

export async function updateChapter(id: number, input: { chapterNumber?: number; chapterTitle?: string; coverage?: string }) {
  try {
    const updated = await prisma.examChapter.update({
      where: { id },
      data: {
        ...(input.chapterNumber && { chapter_number: input.chapterNumber }),
        ...(input.chapterTitle && { chapter_title: input.chapterTitle }),
        ...(input.coverage !== undefined && { coverage: input.coverage }),
      },
    });
    return {
      id: updated.id,
      examId: updated.exam_id,
      chapterNumber: updated.chapter_number,
      chapterTitle: updated.chapter_title,
      coverage: updated.coverage,
    };
  } catch (e) {
    throw new Error(`Failed to update chapter: ${e instanceof Error ? e.message : String(e)}`);
  }
}

export async function deleteChapter(id: number) {
  try {
    await prisma.examChapter.delete({ where: { id } });
    return true;
  } catch (e) {
    throw new Error(`Failed to delete chapter: ${e instanceof Error ? e.message : String(e)}`);
  }
}

export async function getChapterById(qualificationId: string, chapterId: number) {
  const chapters = await getChaptersForQualification(qualificationId);
  return chapters.find((c: any) => c.id === chapterId) ?? null;
}

export async function getQuestionById(questionId: number) {
  try {
    const q = await prisma.question.findUnique({ where: { id: questionId } });
    if (!q) throw new Error("Question not found");
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
    throw new Error(`Failed to fetch question: ${e instanceof Error ? e.message : String(e)}`);
  }
}

export async function getQuestions(options?: { qualificationId?: string; chapterId?: number; limit?: number; random?: boolean; includeExamChapter?: boolean; prioritizeUnanswered?: string; shuffle?: boolean; }) {
  try {
    if (options?.qualificationId && isNumericId(options.qualificationId)) {
      const examId = Number(options.qualificationId);
      const where: any = {};
      if (typeof options.chapterId === "number") {
        where.chapter_id = options.chapterId;
      }
      const include = options?.includeExamChapter ? { chapter: { include: { exam: true } } } : undefined;
      const questions = await prisma.question.findMany({ where: { chapter: { exam_id: examId }, ...where } as any, include });
      let mapped = questions.map((q: any) => {
        const base: any = {
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
        };
        if (options?.includeExamChapter && q.chapter) {
          base.examName = q.chapter.exam?.exam_name ?? String(q.chapter.exam_id);
          base.chapterTitle = q.chapter.chapter_title;
          base.chapterNumber = q.chapter.chapter_number;
        }
        return base as Question;
      });

      // 新しい4段階優先度ロジック
      if (options?.random) {
        const targetCount = typeof options.limit === "number" ? options.limit : 10;
        const userId = options.prioritizeUnanswered || dummyUserId;
        const history = await getHistory(userId, { examId });
        
        // 解答済み問題IDのセットを作成
        const answeredQuestionIds = new Set(
          history
            .filter((entry: any) => entry.question?.qualificationId === String(examId))
            .map((entry: any) => entry.questionId)
        );
        
        // 間違えた問題IDのセットを作成
        const wrongQuestionIds = new Set(
          history
            .filter((entry: any) => !entry.latestAnswer.isCorrect && entry.question?.qualificationId === String(examId))
            .map((entry: any) => entry.questionId)
        );
        
        // 優先度1: 未出題問題から10問取得し、その中から4問をランダム選択
        const unansweredQuestions = mapped.filter((q: any) => !answeredQuestionIds.has(q.id));
        const priority1Questions = unansweredQuestions
          .sort(() => Math.random() - 0.5)
          .slice(0, 10)
          .sort(() => Math.random() - 0.5)
          .slice(0, 4);
        
        // 優先度2: 解答履歴から最も古い順に10問取得し、その中から2問をランダム選択
        const answeredQuestions = mapped.filter((q: any) => answeredQuestionIds.has(q.id));
        const answeredWithHistory = answeredQuestions.map((q: any) => {
          const historyEntry = history.find((h: any) => h.questionId === q.id);
          return {
            question: q,
            latestAnsweredAt: historyEntry?.latestAnswer?.answeredAt || null
          };
        });
        const sortedByOldest = answeredWithHistory
          .filter((item: any) => item.latestAnsweredAt && new Date(item.latestAnsweredAt).getTime() <= Date.now() - BUFFER_TIME_MS)
          .sort((a: any, b: any) => new Date(a.latestAnsweredAt).getTime() - new Date(b.latestAnsweredAt).getTime())
          .slice(0, 10);
        const priority2Questions = sortedByOldest
          .sort(() => Math.random() - 0.5)
          .slice(0, 2)
          .map((item: any) => item.question);
        
        // 優先度3: 間違えた問題の中から最も古い順に10問取得し、その中から2問をランダム選択
        const wrongQuestions = mapped.filter((q: any) => wrongQuestionIds.has(q.id));
        const wrongWithHistory = wrongQuestions.map((q: any) => {
          const historyEntry = history.find((h: any) => h.questionId === q.id);
          return {
            question: q,
            latestAnsweredAt: historyEntry?.latestAnswer?.answeredAt || null
          };
        });
        const wrongSortedByOldest = wrongWithHistory
          .filter((item: any) => item.latestAnsweredAt && new Date(item.latestAnsweredAt).getTime() <= Date.now() - BUFFER_TIME_MS)
          .sort((a: any, b: any) => new Date(a.latestAnsweredAt).getTime() - new Date(b.latestAnsweredAt).getTime())
          .slice(0, 10);
        const priority3Questions = wrongSortedByOldest
          .sort(() => Math.random() - 0.5)
          .slice(0, 2)
          .map((item: any) => item.question);
        
        // 使用済み問題IDを追跡
        const usedQuestionIds = new Set<number>();
        priority1Questions.forEach((q: any) => usedQuestionIds.add(q.id));
        priority2Questions.forEach((q: any) => usedQuestionIds.add(q.id));
        priority3Questions.forEach((q: any) => usedQuestionIds.add(q.id));
        
        // 優先度4: 残りを完全ランダムで10問になるように補充
        const remainingQuestions = mapped.filter((q: any) => !usedQuestionIds.has(q.id));
        const currentCount = priority1Questions.length + priority2Questions.length + priority3Questions.length;
        const neededCount = Math.max(0, targetCount - currentCount);
        const priority4Questions = remainingQuestions
          .sort(() => Math.random() - 0.5)
          .slice(0, neededCount);
        
        // 全ての問題を結合
        mapped = [...priority1Questions, ...priority2Questions, ...priority3Questions, ...priority4Questions];
        
        // 最終的にシャッフル
        if (options.shuffle !== false) {
          mapped = mapped.sort(() => Math.random() - 0.5);
        }
      } else {
        const shouldShuffle = options.shuffle !== false;
        if (options.random && shouldShuffle) mapped = mapped.sort(() => Math.random() - 0.5);
        if (typeof options.limit === "number") mapped = mapped.slice(0, options.limit);
      }
      return mapped;
    }
    return [];
  } catch (e) {
    throw new Error(`Failed to fetch questions: ${e instanceof Error ? e.message : String(e)}`);
  }
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
    throw new Error(`Failed to add question: ${e instanceof Error ? e.message : String(e)}`);
  }
}

export async function updateQuestion(input: { id: number; fields: Partial<Omit<Question, "id" | "createdAt">> }) {
  try {
    const data: any = { ...input.fields };
    if (data.questionText) data.question_text = data.questionText;
    if (data.questionType) data.question_type = data.questionType;
    if (data.choices) data.choices = data.choices as any;
    delete data.questionText;
    delete data.questionType;
    const updated = await prisma.question.update({ where: { id: input.id }, data });
    return await getQuestionById(updated.id);
  } catch (e) {
    throw new Error(`Failed to update question: ${e instanceof Error ? e.message : String(e)}`);
  }
}

export async function deleteQuestion(id: number) {
  try {
    await prisma.question.delete({ where: { id } });
    return 1;
  } catch (e) {
    throw new Error(`Failed to delete question: ${e instanceof Error ? e.message : String(e)}`);
  }
}

export async function bulkAddQuestion(inputs: Array<{ qualificationId: string; chapterId: number; questionType: QuestionType; questionText: string; choices: string[]; answer: number; explanation?: string; difficulty?: number; }>) {
  const results = [];
  for (const input of inputs) {
    try {
      const created = await prisma.question.create({
        data: {
          chapter_id: input.chapterId,
          question_type: input.questionType,
          question_text: input.questionText,
          choices: input.choices as any,
          answer: input.answer,
          explanation: input.explanation ?? "",
          difficulty: input.difficulty ?? 1,
        },
      });
      results.push({ success: true, question: await getQuestionById(created.id) });
    } catch (e) {
      results.push({ success: false, error: e instanceof Error ? e.message : String(e) });
    }
  }
  return results;
}

export async function recordAnswer(input: { userId?: string; questionId: number; userAnswer: number; }) {
  const userId = input.userId?.trim() || dummyUserId;
  const question = await getQuestionById(input.questionId);
  const isCorrect = question.answer === input.userAnswer;
  try {
    await prisma.user.upsert({ where: { id: userId }, update: {}, create: { id: userId } });
    const created = await prisma.userAnswer.create({ data: { user_id: userId, question_id: question.id, user_answer: String(input.userAnswer), is_correct: isCorrect } });

    const same = await prisma.userAnswer.findMany({ where: { user_id: userId, question_id: question.id }, orderBy: { answered_at: "desc" } });
    if (same.length > 5) {
      const toKeep = same.slice(0, 5).map((s: any) => s.id);
      await prisma.userAnswer.deleteMany({ where: { user_id: userId, question_id: question.id, id: { notIn: toKeep } } });
    }
    return { record: { id: created.id, userId: created.user_id, questionId: created.question_id, userAnswer: created.user_answer ?? "", isCorrect: created.is_correct, answeredAt: created.answered_at.toISOString() }, question, isCorrect, correctAnswer: question.answer };
  } catch (e) {
    throw new Error(`Failed to record answer: ${e instanceof Error ? e.message : String(e)}`);
  }
}

export async function getHistory(userId = dummyUserId, options?: { examId?: number; chapterId?: number }) {
  try {
    const rows = await prisma.userAnswer.findMany({ 
      where: { user_id: userId }, 
      include: { question: { include: { chapter: true } } }, 
      orderBy: { answered_at: "desc" } 
    });

    // フィルタリング
    let filteredRows = rows;
    if (options?.examId) {
      filteredRows = rows.filter((r: any) => r.question?.chapter?.exam_id === options.examId);
    }
    if (options?.chapterId) {
      filteredRows = rows.filter((r: any) => r.question?.chapter_id === options.chapterId);
    }

    // 問題ごとにグループ化して統計情報を計算
    const grouped = new Map<number, any[]>();
    filteredRows.forEach((r: any) => {
      const questionId = r.question_id;
      if (!grouped.has(questionId)) {
        grouped.set(questionId, []);
      }
      grouped.get(questionId)!.push(r);
    });

    return Array.from(grouped.entries()).map(([questionId, answers]) => {
      const latest = answers[0]; // 最新の回答
      const totalAttempts = answers.length;
      const correctCount = answers.filter((a: any) => a.is_correct).length;
      const accuracy = Math.round((correctCount / totalAttempts) * 100);

      return {
        questionId,
        totalAttempts,
        correctCount,
        accuracy,
        latestAnswer: {
          id: latest.id,
          userId: latest.user_id,
          questionId: latest.question_id,
          userAnswer: latest.user_answer ?? "",
          isCorrect: latest.is_correct,
          answeredAt: latest.answered_at.toISOString(),
        },
        question: latest.question ? {
          id: latest.question.id,
          qualificationId: String(latest.question.chapter?.exam_id || latest.question.chapter_id),
          chapterId: latest.question.chapter_id,
          questionType: latest.question.question_type as QuestionType,
          questionText: latest.question.question_text,
          choices: Array.isArray(latest.question.choices) ? (latest.question.choices as string[]) : [],
          answer: latest.question.answer,
          explanation: latest.question.explanation ?? "",
          difficulty: latest.question.difficulty ?? 1,
          createdAt: latest.question.created_at.toISOString(),
        } : null,
      };
    }).sort((a, b) => {
      // 最新の回答日時で降順ソート
      return new Date(b.latestAnswer.answeredAt).getTime() - new Date(a.latestAnswer.answeredAt).getTime();
    });
  } catch (e) {
    throw new Error(`Failed to fetch history: ${e instanceof Error ? e.message : String(e)}`);
  }
}

export async function getQuestionHistoryCount(userId: string, questionId: number) {
  try {
    return await prisma.userAnswer.count({ where: { user_id: userId, question_id: questionId } });
  } catch (e) {
    throw new Error(`Failed to fetch question history count: ${e instanceof Error ? e.message : String(e)}`);
  }
}

export async function getMarks(userId = dummyUserId) {
  try {
    const rows = await prisma.userMark.findMany({ where: { user_id: userId }, include: { question: true }, orderBy: { created_at: "desc" } });
    return rows.map((r: any) => ({ id: r.id, userId: r.user_id, questionId: r.question_id, markTitle: r.mark_title ?? "", createdAt: r.created_at.toISOString(), question: r.question ? { id: r.question.id, qualificationId: String(r.question.chapter_id), chapterId: r.question.chapter_id, questionType: r.question.question_type as QuestionType, questionText: r.question.question_text, choices: Array.isArray(r.question.choices) ? (r.question.choices as string[]) : [], answer: r.question.answer, explanation: r.question.explanation ?? "", difficulty: r.question.difficulty ?? 1, createdAt: r.question.created_at.toISOString() } : null }));
  } catch (e) {
    throw new Error(`Failed to fetch marks: ${e instanceof Error ? e.message : String(e)}`);
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
    throw new Error(`Failed to remove mark: ${e instanceof Error ? e.message : String(e)}`);
  }
}

export async function getStats(userId = dummyUserId) {
  try {
    const history = await getHistory(userId);
    const totalQuestions = history.length;
    
    // 総解答数は各問題の試行回数の合計
    const totalAttempts = history.reduce((sum: number, h: any) => sum + h.totalAttempts, 0);
    
    // 総正解数は各問題の正解回数の合計
    const totalCorrect = history.reduce((sum: number, h: any) => sum + h.correctCount, 0);
    
    // 全体の正答率
    const accuracy = totalAttempts === 0 ? 0 : Math.round((totalCorrect / totalAttempts) * 100);
    
    const marks = (await prisma.userMark.count({ where: { user_id: userId } })) || 0;
    
    return { 
      userId, 
      totalAnswers: totalAttempts, 
      correctAnswers: totalCorrect, 
      accuracy, 
      marks, 
      latestHistory: history.slice(0, 5) 
    };
  } catch (e) {
    throw new Error(`Failed to fetch stats: ${e instanceof Error ? e.message : String(e)}`);
  }
}

export async function getExamIdByName(examName: string) {
  try {
    const exam = await prisma.exam.findFirst({ where: { exam_name: examName } });
    return exam?.id || null;
  } catch (e) {
    throw new Error(`Failed to fetch exam by name: ${e instanceof Error ? e.message : String(e)}`);
  }
}

export async function getChapterIdByTitle(examId: number, chapterTitle: string) {
  try {
    const chapter = await prisma.examChapter.findFirst({ 
      where: { exam_id: examId, chapter_title: chapterTitle } 
    });
    return chapter?.id || null;
  } catch (e) {
    throw new Error(`Failed to fetch chapter by title: ${e instanceof Error ? e.message : String(e)}`);
  }
}
