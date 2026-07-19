"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Alert,
  CircularProgress,
  Chip,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { IssueStatus, IssueType, getIssueTypeLabel, getStatusLabel } from "@/lib/question-issues/types";

interface QuestionIssue {
  id: number;
  question_id: number | null;
  exam_id: number | null;
  user_id: number;
  issue_type: string;
  description: string;
  status: string;
  admin_comment: string | null;
  fixed_content: string | null;
  created_at: string;
  updated_at: string;
  question: {
    id: number;
    question_text: string;
    chapter: {
      chapter_title: string;
      exam: {
        exam_name: string;
      };
    };
  } | null;
  exam: {
    id: number;
    exam_name: string;
  } | null;
  user: {
    id: number;
    userid: string;
    email: string | null;
  };
}

const STATUS_COLORS: Record<string, any> = {
  OPEN: "default",
  IN_PROGRESS: "warning",
  RESOLVED: "success",
  REJECTED: "error",
};

export default function QuestionIssuesPage() {
  const [issues, setIssues] = useState<QuestionIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [issueTypeFilter, setIssueTypeFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIssue, setSelectedIssue] = useState<QuestionIssue | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const fetchIssues = async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append("status", statusFilter);
      if (issueTypeFilter) params.append("issueType", issueTypeFilter);
      if (searchQuery) params.append("search", searchQuery);

      const response = await fetch(`/api/admin/question-issues?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "起票一覧の取得に失敗しました");
        return;
      }

      setIssues(data.issues || []);
    } catch (err) {
      setError("通信エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, [statusFilter, issueTypeFilter, searchQuery]);

  const handleStatusFilterChange = (event: any) => {
    setStatusFilter(event.target.value);
  };

  const handleIssueTypeFilterChange = (event: any) => {
    setIssueTypeFilter(event.target.value);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleDetailClick = (issue: QuestionIssue) => {
    setSelectedIssue(issue);
    setDetailModalOpen(true);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Typography component="h1" variant="h5">
            起票管理
          </Typography>
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>種別</InputLabel>
              <Select
                value={issueTypeFilter}
                label="種別"
                onChange={handleIssueTypeFilterChange}
              >
                <MenuItem value="">すべて</MenuItem>
                <MenuItem value={IssueType.TYPO}>{getIssueTypeLabel(IssueType.TYPO)}</MenuItem>
                <MenuItem value={IssueType.INCORRECT_CONTENT}>{getIssueTypeLabel(IssueType.INCORRECT_CONTENT)}</MenuItem>
                <MenuItem value={IssueType.INSUFFICIENT_EXPLANATION}>{getIssueTypeLabel(IssueType.INSUFFICIENT_EXPLANATION)}</MenuItem>
                <MenuItem value={IssueType.UNCLEAR_EXPRESSION}>{getIssueTypeLabel(IssueType.UNCLEAR_EXPRESSION)}</MenuItem>
                <MenuItem value={IssueType.OTHER}>{getIssueTypeLabel(IssueType.OTHER)}</MenuItem>
                <MenuItem value={IssueType.QUESTION_REQUEST}>{getIssueTypeLabel(IssueType.QUESTION_REQUEST)}</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>ステータス</InputLabel>
              <Select
                value={statusFilter}
                label="ステータス"
                onChange={handleStatusFilterChange}
              >
                <MenuItem value="">すべて</MenuItem>
                <MenuItem value={IssueStatus.OPEN}>{getStatusLabel(IssueStatus.OPEN)}</MenuItem>
                <MenuItem value={IssueStatus.IN_PROGRESS}>{getStatusLabel(IssueStatus.IN_PROGRESS)}</MenuItem>
                <MenuItem value={IssueStatus.RESOLVED}>{getStatusLabel(IssueStatus.RESOLVED)}</MenuItem>
                <MenuItem value={IssueStatus.REJECTED}>{getStatusLabel(IssueStatus.REJECTED)}</MenuItem>
              </Select>
            </FormControl>
            <TextField
              size="small"
              label="検索"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="問題ID、種別..."
              sx={{ minWidth: 200 }}
            />
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>種別</TableCell>
                  <TableCell>対象</TableCell>
                  <TableCell>ステータス</TableCell>
                  <TableCell>起票者</TableCell>
                  <TableCell>起票日時</TableCell>
                  <TableCell>操作</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {issues.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      起票がありません
                    </TableCell>
                  </TableRow>
                ) : (
                  issues.map((issue) => (
                    <TableRow key={issue.id}>
                      <TableCell>{issue.id}</TableCell>
                      <TableCell>{getIssueTypeLabel(issue.issue_type)}</TableCell>
                      <TableCell>
                        {issue.issue_type === IssueType.QUESTION_REQUEST ? (
                          issue.exam?.exam_name || "不明"
                        ) : (
                          issue.question?.chapter.exam.exam_name || "不明"
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusLabel(issue.status)}
                          color={STATUS_COLORS[issue.status] as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{issue.user.userid}</TableCell>
                      <TableCell>
                        {new Date(issue.created_at).toLocaleString("ja-JP")}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleDetailClick(issue)}
                        >
                          詳細
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {selectedIssue && (
        <AdminQuestionIssueDetailModal
          open={detailModalOpen}
          onClose={() => {
            setDetailModalOpen(false);
            setSelectedIssue(null);
          }}
          issue={selectedIssue}
          onUpdate={fetchIssues}
        />
      )}
    </Container>
  );
}

function AdminQuestionIssueDetailModal({
  open,
  onClose,
  issue,
  onUpdate,
}: {
  open: boolean;
  onClose: () => void;
  issue: QuestionIssue;
  onUpdate: () => void;
}) {
  const [status, setStatus] = useState(issue.status);
  const [adminComment, setAdminComment] = useState(issue.admin_comment || "");
  const [fixedContent, setFixedContent] = useState(issue.fixed_content || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setStatus(issue.status);
      setAdminComment(issue.admin_comment || "");
      setFixedContent(issue.fixed_content || "");
    }
  }, [open, issue]);

  const handleUpdate = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/admin/question-issues/${issue.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
          admin_comment: adminComment,
          fixed_content: fixedContent,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "更新に失敗しました");
        return;
      }

      onUpdate();
      onClose();
    } catch (err) {
      setError("通信エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>起票詳細</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="textSecondary">
            問題ID
          </Typography>
          <Typography variant="body1">{issue.question_id}</Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="textSecondary">
            問題文
          </Typography>
          <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
            {issue.question?.question_text}
          </Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="textSecondary">
            種別
          </Typography>
          <Typography variant="body1">
            {getIssueTypeLabel(issue.issue_type)}
          </Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="textSecondary">
            内容
          </Typography>
          <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
            {issue.description}
          </Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="textSecondary">
            起票者
          </Typography>
          <Typography variant="body1">
            {issue.user.userid} ({issue.user.email || "メール未登録"})
          </Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="textSecondary">
            起票日時
          </Typography>
          <Typography variant="body1">
            {new Date(issue.created_at).toLocaleString("ja-JP")}
          </Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <FormControl fullWidth size="small">
            <InputLabel>ステータス</InputLabel>
            <Select
              value={status}
              label="ステータス"
              onChange={(e) => setStatus(e.target.value)}
            >
              <MenuItem value={IssueStatus.OPEN}>未対応</MenuItem>
              <MenuItem value={IssueStatus.IN_PROGRESS}>対応中</MenuItem>
              <MenuItem value={IssueStatus.RESOLVED}>対応済み</MenuItem>
              <MenuItem value={IssueStatus.REJECTED}>却下</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="対応コメント"
            value={adminComment}
            onChange={(e) => setAdminComment(e.target.value)}
            size="small"
          />
        </Box>

        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="修正内容"
            value={fixedContent}
            onChange={(e) => setFixedContent(e.target.value)}
            size="small"
          />
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          キャンセル
        </Button>
        <Button
          onClick={handleUpdate}
          variant="contained"
          disabled={loading}
        >
          {loading ? <CircularProgress size={20} /> : "更新"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
