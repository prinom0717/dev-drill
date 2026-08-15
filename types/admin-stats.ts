/**
 * 管理者統計ダッシュボード用型定義
 */

/**
 * フィルター条件の型定義
 */
export interface AdminStatsFilters {
  userId?: number;
  examId?: number;
  chapterId?: number;
  questionId?: number;
  startDate?: string;
  endDate?: string;
}

/**
 * サマリー統計の型定義
 */
export interface AdminStatsSummary {
  totalAnswers: number;
  correctAnswers: number;
  incorrectAnswers: number;
  accuracy: number;
}

/**
 * ユーザー別統計の型定義
 */
export interface AdminStatsByUser {
  userId: number;
  userid: string;
  totalAnswers: number;
  correctAnswers: number;
  accuracy: number;
}

/**
 * 問題別統計の型定義
 */
export interface AdminStatsByQuestion {
  questionId: number;
  questionText: string;
  examName: string;
  chapterTitle: string;
  totalAnswers: number;
  correctAnswers: number;
  accuracy: number;
}

/**
 * 試験別統計の型定義
 */
export interface AdminStatsByExam {
  examId: number;
  examName: string;
  totalAnswers: number;
  correctAnswers: number;
  accuracy: number;
}

/**
 * 章別統計の型定義
 */
export interface AdminStatsByChapter {
  chapterId: number;
  chapterTitle: string;
  examName: string;
  totalAnswers: number;
  correctAnswers: number;
  accuracy: number;
}

/**
 * 時系列データの型定義
 */
export interface AdminStatsTimeSeries {
  date: string;
  totalAnswers: number;
  correctAnswers: number;
  incorrectAnswers: number;
}

/**
 * グラフ用時系列データの型定義
 */
export interface ChartTimeSeriesData {
  date: string;
  正解: number;
  不正解: number;
}

/**
 * グラフ用カテゴリデータの型定義
 */
export interface ChartCategoryData {
  name: string;
  正解: number;
  不正解: number;
}

/**
 * 時間軸集計単位の型定義
 */
export type TimeAggregation = "day" | "week" | "month" | "year";

/**
 * 集計カテゴリの型定義
 */
export type AggregationCategory = "all" | "exam" | "chapter" | "question";

/**
 * 管理者統計APIレスポンスの型定義
 */
export interface AdminStatsResult {
  summary: AdminStatsSummary;
  byUser: AdminStatsByUser[];
  byQuestion: AdminStatsByQuestion[];
  byExam: AdminStatsByExam[];
  byChapter: AdminStatsByChapter[];
  timeSeries: AdminStatsTimeSeries[];
}

/**
 * ドロップダウン用ユーザーデータの型定義
 */
export interface DropdownUser {
  id: number;
  userid: string;
}

/**
 * ドロップダウン用試験データの型定義
 */
export interface DropdownExam {
  id: number;
  examName: string;
}

/**
 * ドロップダウン用章データの型定義
 */
export interface DropdownChapter {
  id: number;
  chapterTitle: string;
}

/**
 * ドロップダウン用問題データの型定義
 */
export interface DropdownQuestion {
  id: number;
  questionText: string;
}