"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Container,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  TextField,
  Card,
  CardContent,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
  useMediaQuery,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import PercentIcon from "@mui/icons-material/Percent";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface AdminStatsData {
  summary: {
    totalAnswers: number;
    correctAnswers: number;
    incorrectAnswers: number;
    accuracy: number;
  };
  byQuestion: Array<{
    questionId: number;
    questionText: string;
    examName: string;
    chapterTitle: string;
    totalAnswers: number;
    correctAnswers: number;
    accuracy: number;
  }>;
  byExam: Array<{
    examId: number;
    examName: string;
    totalAnswers: number;
    correctAnswers: number;
    accuracy: number;
  }>;
  byChapter: Array<{
    chapterId: number;
    chapterTitle: string;
    examName: string;
    totalAnswers: number;
    correctAnswers: number;
    accuracy: number;
  }>;
  timeSeries: Array<{
    date: string;
    totalAnswers: number;
    correctAnswers: number;
    incorrectAnswers: number;
  }>;
}

export default function AdminStatsPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [stats, setStats] = useState<AdminStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // フィルター状態
  const [filters, setFilters] = useState({
    userId: "",
    examId: "",
    chapterId: "",
    questionId: "",
    startDate: "",
    endDate: "",
  });

  // ドロップダウン用データ
  const [users, setUsers] = useState<Array<{ id: number; userid: string }>>([]);
  const [exams, setExams] = useState<Array<{ id: number; examName: string }>>([]);
  const [chapters, setChapters] = useState<Array<{ id: number; chapterTitle: string }>>([]);
  const [questions, setQuestions] = useState<Array<{ id: number; questionText: string }>>([]);
  const [filterVisible, setFilterVisible] = useState(true);
  const [selectedQuestion, setSelectedQuestion] = useState<AdminStatsData["byQuestion"][0] | null>(null);

  // グラフ用状態
  const [timeAggregation, setTimeAggregation] = useState<"day" | "week" | "month" | "year">("day");
  const [aggregationCategory, setAggregationCategory] = useState<"all" | "exam" | "chapter" | "question">("all");
  const [chartMode, setChartMode] = useState<"count" | "rate">("count");
  const [isCumulative, setIsCumulative] = useState(false);

  const fetchStats = async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();
      if (filters.userId) params.append("userId", filters.userId);
      if (filters.examId) params.append("examId", filters.examId);
      if (filters.chapterId) params.append("chapterId", filters.chapterId);
      if (filters.questionId) params.append("questionId", filters.questionId);
      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);

      const response = await fetch(`/api/admin/stats?${params.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "統計データの取得に失敗しました" }));
        setError(errorData.message || "統計データの取得に失敗しました");
        return;
      }

      const data = await response.json();
      setStats(data);
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === "TypeError" && err.message.includes("fetch")) {
          setError("ネットワークエラーが発生しました。接続を確認してください。");
        } else {
          setError(`エラーが発生しました: ${err.message}`);
        }
      } else {
        setError("予期しないエラーが発生しました");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchFilterData = async () => {
    try {
      // ユーザー一覧取得
      try {
        const usersRes = await fetch("/api/admin/users");
        if (usersRes.ok) {
          const usersData = await usersRes.json();
          setUsers(usersData.users || []);
        } else {
          console.error("Failed to fetch users:", usersRes.status);
        }
      } catch (err) {
        console.error("Error fetching users:", err);
      }

      // 試験一覧取得
      try {
        const examsRes = await fetch("/api/exams");
        if (examsRes.ok) {
          const examsData = await examsRes.json();
          setExams(examsData.exams || []);
        } else {
          console.error("Failed to fetch exams:", examsRes.status);
        }
      } catch (err) {
        console.error("Error fetching exams:", err);
      }
    } catch (err) {
      console.error("Failed to fetch filter data:", err);
    }
  };

  const fetchChapters = async (examId: string) => {
    if (!examId) {
      setChapters([]);
      return;
    }
    try {
      const res = await fetch(`/api/exams/${examId}/chapters`);
      if (res.ok) {
        const data = await res.json();
        setChapters(data.chapters || []);
      } else {
        console.error("Failed to fetch chapters:", res.status);
        setChapters([]);
      }
    } catch (err) {
      console.error("Error fetching chapters:", err);
      setChapters([]);
    }
  };

  const fetchQuestions = async (chapterId: string) => {
    if (!chapterId) {
      setQuestions([]);
      return;
    }
    try {
      const params = new URLSearchParams();
      params.append("chapterId", chapterId);
      params.append("count", "100");
      const res = await fetch(`/api/questions?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setQuestions(data.questions || []);
      } else {
        console.error("Failed to fetch questions:", res.status);
        setQuestions([]);
      }
    } catch (err) {
      console.error("Error fetching questions:", err);
      setQuestions([]);
    }
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => {
      const newFilters = { ...prev, [field]: value };

      // 連動選択ロジック
      if (field === "examId") {
        fetchChapters(value);
        newFilters.chapterId = "";
        newFilters.questionId = "";
      } else if (field === "chapterId") {
        fetchQuestions(value);
        newFilters.questionId = "";
      }

      return newFilters;
    });
  };

  const handleResetFilters = () => {
    setFilters({
      userId: "",
      examId: "",
      chapterId: "",
      questionId: "",
      startDate: "",
      endDate: "",
    });
    setChapters([]);
    setQuestions([]);
  };

  const handleApplyFilters = () => {
    fetchStats();
  };

  // グラフデータの変換ロジック
  const transformTimeSeriesData = (data: AdminStatsData["timeSeries"], aggregation: typeof timeAggregation, mode: typeof chartMode, cumulative: boolean) => {
    if (data.length === 0) return [];

    let processedData: Array<{ date: string; correct: number; incorrect: number }>;

    switch (aggregation) {
      case "day":
        processedData = data.map(item => ({
          date: new Date(item.date).toLocaleDateString("ja-JP", { month: "short", day: "numeric" }),
          correct: item.correctAnswers,
          incorrect: item.incorrectAnswers,
        }));
        break;
      
      case "week":
        const weekMap = new Map<string, { correct: number; incorrect: number }>();
        data.forEach(item => {
          const date = new Date(item.date);
          const weekKey = `${date.getFullYear()}-W${getWeekNumber(date)}`;
          if (!weekMap.has(weekKey)) {
            weekMap.set(weekKey, { correct: 0, incorrect: 0 });
          }
          const weekData = weekMap.get(weekKey)!;
          weekData.correct += item.correctAnswers;
          weekData.incorrect += item.incorrectAnswers;
        });
        processedData = Array.from(weekMap.entries()).map(([key, value]) => ({
          date: key,
          correct: value.correct,
          incorrect: value.incorrect,
        }));
        break;
      
      case "month":
        const monthMap = new Map<string, { correct: number; incorrect: number }>();
        data.forEach(item => {
          const date = new Date(item.date);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
          if (!monthMap.has(monthKey)) {
            monthMap.set(monthKey, { correct: 0, incorrect: 0 });
          }
          const monthData = monthMap.get(monthKey)!;
          monthData.correct += item.correctAnswers;
          monthData.incorrect += item.incorrectAnswers;
        });
        processedData = Array.from(monthMap.entries()).map(([key, value]) => ({
          date: key,
          correct: value.correct,
          incorrect: value.incorrect,
        }));
        break;
      
      case "year":
        const yearMap = new Map<string, { correct: number; incorrect: number }>();
        data.forEach(item => {
          const date = new Date(item.date);
          const yearKey = String(date.getFullYear());
          if (!yearMap.has(yearKey)) {
            yearMap.set(yearKey, { correct: 0, incorrect: 0 });
          }
          const yearData = yearMap.get(yearKey)!;
          yearData.correct += item.correctAnswers;
          yearData.incorrect += item.incorrectAnswers;
        });
        processedData = Array.from(yearMap.entries()).map(([key, value]) => ({
          date: key,
          correct: value.correct,
          incorrect: value.incorrect,
        }));
        break;
      
      default:
        processedData = data.map(item => ({
          date: new Date(item.date).toLocaleDateString("ja-JP", { month: "short", day: "numeric" }),
          correct: item.correctAnswers,
          incorrect: item.incorrectAnswers,
        }));
    }

    // 累積計算
    if (cumulative) {
      let cumulativeCorrect = 0;
      let cumulativeIncorrect = 0;
      processedData = processedData.map(item => {
        cumulativeCorrect += item.correct;
        cumulativeIncorrect += item.incorrect;
        return {
          date: item.date,
          correct: cumulativeCorrect,
          incorrect: cumulativeIncorrect,
        };
      });
    }

    // モードに応じて変換
    if (mode === "count") {
      return processedData.map(item => ({
        date: item.date,
        正解: item.correct,
        不正解: item.incorrect,
      }));
    } else {
      return processedData.map(item => {
        const total = item.correct + item.incorrect;
        return {
          date: item.date,
          正解率: total > 0 ? Math.round((item.correct / total) * 100) : 0,
        };
      });
    }
  };

  const getWeekNumber = (date: Date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  };

  const getCategoryData = (category: typeof aggregationCategory) => {
    switch (category) {
      case "all":
        return transformTimeSeriesData(stats?.timeSeries || [], timeAggregation, chartMode, isCumulative);
      case "exam":
        return (stats?.byExam || []).map(item => ({
          name: item.examName,
          正解: item.correctAnswers,
          不正解: item.totalAnswers - item.correctAnswers,
        }));
      case "chapter":
        return (stats?.byChapter || []).map(item => ({
          name: `${item.examName}: ${item.chapterTitle}`,
          正解: item.correctAnswers,
          不正解: item.totalAnswers - item.correctAnswers,
        }));
      case "question":
        return (stats?.byQuestion || []).slice(0, 20).map(item => ({
          name: `Q${item.questionId}`,
          正解: item.correctAnswers,
          不正解: item.totalAnswers - item.correctAnswers,
        }));
      default:
        return [];
    }
  };

  const questionColumns = [
    { field: 'questionId', headerName: '問題ID', width: 100 },
    { 
      field: 'questionText', 
      headerName: '問題テキスト', 
      width: 300,
      renderCell: (params: any) => (
        <Box sx={{ maxWidth: 300 }}>
          <Typography
            variant="body2"
            sx={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {params.value}
          </Typography>
        </Box>
      )
    },
    { field: 'examName', headerName: '試験', width: 150 },
    { field: 'chapterTitle', headerName: '章', width: 150 },
    { field: 'totalAnswers', headerName: '総解答数', width: 120 },
    { field: 'correctAnswers', headerName: '正解数', width: 120 },
    { 
      field: 'incorrectAnswers', 
      headerName: '不正解数', 
      width: 120,
      valueGetter: (value: any, row: any) => row.totalAnswers - row.correctAnswers
    },
    { 
      field: 'accuracy', 
      headerName: '正答率', 
      width: 100,
      renderCell: (params: any) => (
        <Chip
          label={`${params.value}%`}
          color={
            params.value >= 70
              ? "success"
              : params.value >= 50
              ? "warning"
              : "error"
          }
          size="small"
        />
      )
    },
  ];

  useEffect(() => {
    fetchFilterData();
    fetchStats();
  }, []);

  return (
    <Container maxWidth={false} sx={{ mt: 4, mb: 4, px: 2 }}>
      <Paper elevation={3} sx={{ p: isMobile ? 2 : 4 }}>
        <Box sx={{ mb: 3 }}>
          <Typography component="h1" variant={isMobile ? "h6" : "h5"}>
            統計ダッシュボード
          </Typography>
        </Box>

        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 3 }}
            action={
              <Button 
                color="inherit" 
                size="small" 
                onClick={fetchStats}
              >
                再試行
              </Button>
            }
          >
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
            <Typography sx={{ ml: 2 }}>読み込み中...</Typography>
          </Box>
        ) : stats ? (
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "240px 1fr" }, gap: 3 }}>
            {/* 左端：フィルター */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  フィルター
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>ユーザー</InputLabel>
                    <Select
                      value={filters.userId}
                      label="ユーザー"
                      onChange={(e) => handleFilterChange("userId", e.target.value)}
                    >
                      <MenuItem value="">すべてのユーザー</MenuItem>
                      {users.map((user) => (
                        <MenuItem key={user.id} value={user.id.toString()}>
                          {user.userid}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl fullWidth size="small">
                    <InputLabel>試験</InputLabel>
                    <Select
                      value={filters.examId}
                      label="試験"
                      onChange={(e) => handleFilterChange("examId", e.target.value)}
                    >
                      <MenuItem value="">すべての試験</MenuItem>
                      {exams.map((exam) => (
                        <MenuItem key={exam.id} value={exam.id.toString()}>
                          {exam.examName}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl fullWidth size="small">
                    <InputLabel>章</InputLabel>
                    <Select
                      value={filters.chapterId}
                      label="章"
                      onChange={(e) => handleFilterChange("chapterId", e.target.value)}
                      disabled={!filters.examId}
                    >
                      <MenuItem value="">すべての章</MenuItem>
                      {chapters.map((chapter) => (
                        <MenuItem key={chapter.id} value={chapter.id.toString()}>
                          {chapter.chapterTitle}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl fullWidth size="small">
                    <InputLabel>問題</InputLabel>
                    <Select
                      value={filters.questionId}
                      label="問題"
                      onChange={(e) => handleFilterChange("questionId", e.target.value)}
                      disabled={!filters.chapterId}
                    >
                      <MenuItem value="">すべての問題</MenuItem>
                      {questions.map((question) => (
                        <MenuItem key={question.id} value={question.id.toString()}>
                          {question.questionText.substring(0, 30)}...
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <TextField
                    fullWidth
                    size="small"
                    type="date"
                    label="開始日"
                    value={filters.startDate}
                    onChange={(e) => handleFilterChange("startDate", e.target.value)}
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                  <TextField
                    fullWidth
                    size="small"
                    type="date"
                    label="終了日"
                    value={filters.endDate}
                    onChange={(e) => handleFilterChange("endDate", e.target.value)}
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                  <Box sx={{ display: "flex", gap: 2 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={handleApplyFilters}
                      sx={{ height: "40px" }}
                    >
                      適用
                    </Button>
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={handleResetFilters}
                      sx={{ height: "40px" }}
                    >
                      リセット
                    </Button>
                  </Box>
                </Box>
              </Paper>
            </Box>

            {/* 右側：メインコンテンツ */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3, minWidth: 0 }}>
              {/* 上端：サマリー */}
              <Paper sx={{ p: 1.5 }}>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  サマリー
                </Typography>

                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "flex-start",
                    alignItems: "center",
                    gap: 1.5,
                    flexWrap: "wrap",
                  }}
                >
                  <Card variant="outlined" sx={{ width: "fit-content" }}>
                    <CardContent sx={{ p: 1, "&:last-child": { pb: 1 } }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <TrendingUpIcon color="primary" sx={{ fontSize: 20 }} />
                        <Typography variant="body2">総解答数</Typography>
                        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                          {stats?.summary.totalAnswers.toLocaleString() || "0"}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>

                  <Card variant="outlined" sx={{ width: "fit-content" }}>
                    <CardContent sx={{ p: 1, "&:last-child": { pb: 1 } }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <PercentIcon color="primary" sx={{ fontSize: 20 }} />
                        <Typography variant="body2">正答率</Typography>
                        <Typography variant="h6" sx={{ fontWeight: "bold", color: "primary.main" }}>
                          {stats?.summary.accuracy ?? 0}%
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>

                  <Card variant="outlined" sx={{ width: "fit-content" }}>
                    <CardContent sx={{ p: 1, "&:last-child": { pb: 1 } }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <CheckCircleIcon color="success" sx={{ fontSize: 20 }} />
                        <Typography variant="body2">正解数</Typography>
                        <Typography variant="h6" sx={{ fontWeight: "bold", color: "success.main" }}>
                          {stats?.summary.correctAnswers.toLocaleString() || "0"}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>

                  <Card variant="outlined" sx={{ width: "fit-content" }}>
                    <CardContent sx={{ p: 1, "&:last-child": { pb: 1 } }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <CancelIcon color="error" sx={{ fontSize: 20 }} />
                        <Typography variant="body2">不正解数</Typography>
                        <Typography variant="h6" sx={{ fontWeight: "bold", color: "error.main" }}>
                          {stats?.summary.incorrectAnswers.toLocaleString() || "0"}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Box>
              </Paper>

              {/* 右側の上：時系列グラフ */}
              <Paper sx={{ p: 3, overflow: "hidden" }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, flexDirection: isMobile ? "column" : "row", gap: isMobile ? 2 : 0 }}>
                  <Typography variant="h6">
                    時系列グラフ
                  </Typography>
                  <Box sx={{ display: "flex", gap: 2, flexDirection: isMobile ? "column" : "row", width: isMobile ? "100%" : "auto", flexWrap: "wrap" }}>
                    <ToggleButtonGroup
                      value={timeAggregation}
                      exclusive
                      onChange={(e, newAggregation) => newAggregation && setTimeAggregation(newAggregation)}
                      size="small"
                      sx={{ width: isMobile ? "100%" : "auto" }}
                      fullWidth={isMobile}
                    >
                      <ToggleButton value="day">日</ToggleButton>
                      <ToggleButton value="week">週</ToggleButton>
                      <ToggleButton value="month">月</ToggleButton>
                      <ToggleButton value="year">年</ToggleButton>
                    </ToggleButtonGroup>
                    <ToggleButtonGroup
                      value={aggregationCategory}
                      exclusive
                      onChange={(e, newCategory) => newCategory && setAggregationCategory(newCategory)}
                      size="small"
                      sx={{ width: isMobile ? "100%" : "auto" }}
                      fullWidth={isMobile}
                    >
                      <ToggleButton value="all">全体</ToggleButton>
                      <ToggleButton value="exam">試験</ToggleButton>
                      <ToggleButton value="chapter">章</ToggleButton>
                      <ToggleButton value="question">問題</ToggleButton>
                    </ToggleButtonGroup>
                    {aggregationCategory === "all" && (
                      <>
                        <ToggleButtonGroup
                          value={chartMode}
                          exclusive
                          onChange={(e, newMode) => newMode && setChartMode(newMode)}
                          size="small"
                          sx={{ width: isMobile ? "100%" : "auto" }}
                          fullWidth={isMobile}
                        >
                          <ToggleButton value="count">数</ToggleButton>
                          <ToggleButton value="rate">率</ToggleButton>
                        </ToggleButtonGroup>
                        <ToggleButtonGroup
                          value={isCumulative}
                          exclusive
                      onChange={(e, newCumulative) => newCumulative !== null && setIsCumulative(newCumulative)}
                      size="small"
                      sx={{ width: isMobile ? "100%" : "auto" }}
                      fullWidth={isMobile}
                    >
                      <ToggleButton value={false}>通常</ToggleButton>
                      <ToggleButton value={true}>累積</ToggleButton>
                    </ToggleButtonGroup>
                  </>
                )}
              </Box>
            </Box>
            <Box sx={{ width: '100%', overflowX: 'auto' }}>
              <ResponsiveContainer width="100%" height={isMobile ? 250 : 300} minWidth={600}>
                {aggregationCategory === "all" ? (
                  chartMode === "count" ? (
                    <LineChart data={getCategoryData(aggregationCategory) as any}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        fontSize={isMobile ? 10 : 12}
                        angle={isMobile ? -45 : 0}
                        textAnchor={isMobile ? "end" : "middle"}
                        height={isMobile ? 60 : 30}
                      />
                      <YAxis fontSize={isMobile ? 10 : 12} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="正解" stroke="#4caf50" strokeWidth={isMobile ? 1 : 2} />
                      <Line type="monotone" dataKey="不正解" stroke="#f44336" strokeWidth={isMobile ? 1 : 2} />
                    </LineChart>
                  ) : (
                    <LineChart data={getCategoryData(aggregationCategory) as any}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        fontSize={isMobile ? 10 : 12}
                        angle={isMobile ? -45 : 0}
                        textAnchor={isMobile ? "end" : "middle"}
                        height={isMobile ? 60 : 30}
                      />
                      <YAxis fontSize={isMobile ? 10 : 12} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="正解率" stroke="#4caf50" strokeWidth={isMobile ? 1 : 2} />
                    </LineChart>
                  )
                ) : (
                  <BarChart data={getCategoryData(aggregationCategory) as any}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      angle={-45}
                      textAnchor="end"
                      height={isMobile ? 100 : 80}
                      fontSize={isMobile ? 10 : 12}
                    />
                    <YAxis fontSize={isMobile ? 10 : 12} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="正解" fill="#4caf50" />
                    <Bar dataKey="不正解" fill="#f44336" />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </Box>
          </Paper>

          {/* 右側の下：問題別統計 */}
          <Paper sx={{ p: 3, overflow: "hidden" }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              問題別統計
            </Typography>
            <Box sx={{ width: '100%', overflowX: 'auto' }}>
              <Box sx={{ height: 400, minWidth: 800 }}>
                <DataGrid
                  rows={stats.byQuestion.map((q, index) => ({ id: index, ...q }))}
                  columns={questionColumns}
                  pageSizeOptions={[5, 10, 25, 50]}
                  initialState={{
                    pagination: {
                      paginationModel: { pageSize: 10, page: 0 },
                    },
                  }}
                  disableRowSelectionOnClick
                  onRowClick={(params) => setSelectedQuestion(params.row)}
                  sx={{
                    '& .MuiDataGrid-cell': {
                      fontSize: isMobile ? '12px' : '14px',
                    },
                    '& .MuiDataGrid-row:hover': {
                      cursor: 'pointer',
                    },
                  }}
                />
              </Box>
            </Box>
          </Paper>

          {/* 問題詳細ダイアログ */}
          <Dialog
            open={!!selectedQuestion}
            onClose={() => setSelectedQuestion(null)}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>問題詳細</DialogTitle>
            <DialogContent>
              {selectedQuestion && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                    問題ID: {selectedQuestion.questionId}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {selectedQuestion.questionText}
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 2 }}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        試験
                      </Typography>
                      <Typography variant="body1">
                        {selectedQuestion.examName}
                      </Typography>
                    </Paper>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        章
                      </Typography>
                      <Typography variant="body1">
                        {selectedQuestion.chapterTitle}
                      </Typography>
                    </Paper>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        総解答数
                      </Typography>
                      <Typography variant="body1">
                        {selectedQuestion.totalAnswers.toLocaleString()}
                      </Typography>
                    </Paper>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        正解数
                      </Typography>
                      <Typography variant="body1" color="success.main">
                        {selectedQuestion.correctAnswers.toLocaleString()}
                      </Typography>
                    </Paper>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        不正解数
                      </Typography>
                      <Typography variant="body1" color="error.main">
                        {(selectedQuestion.totalAnswers - selectedQuestion.correctAnswers).toLocaleString()}
                      </Typography>
                    </Paper>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        正答率
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        <Chip
                          label={`${selectedQuestion.accuracy}%`}
                          color={
                            selectedQuestion.accuracy >= 70
                              ? "success"
                              : selectedQuestion.accuracy >= 50
                              ? "warning"
                              : "error"
                          }
                          size="small"
                        />
                      </Box>
                    </Paper>
                  </Box>
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedQuestion(null)}>閉じる</Button>
            </DialogActions>
          </Dialog>
            </Box>
          </Box>
        ) : (
          <Alert severity="info">統計データがありません</Alert>
        )}
      </Paper>
    </Container>
  );
}