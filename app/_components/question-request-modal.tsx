"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Box,
  Alert,
  CircularProgress,
} from "@mui/material";
import { IssueType } from "@/lib/question-issues/types";
import { Exam } from "@/lib/exams/types";

interface QuestionRequestModalProps {
  open: boolean;
  onClose: () => void;
  qualificationId: number | null; // ← undefined を防ぐため null 許容
}

export function QuestionRequestModal({
  open,
  onClose,
  qualificationId: initialQualificationId,
}: QuestionRequestModalProps) {
  const [examId, setExamId] = useState<number | null>(null);
  const [description, setDescription] = useState("");
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchExamsLoading, setFetchExamsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (open) {
      fetchExams();
    }
  }, [open]);

  const fetchExams = async () => {
    setFetchExamsLoading(true);
    try {
      const response = await fetch("/api/exams");
      const data = await response.json();
      const list = data.exams || [];

      setExams(list);

      // 初期値が undefined の場合を完全排除
      if (initialQualificationId != null) {
        const exists = list.some((e: Exam) => e.id === initialQualificationId);
        setExamId(exists ? initialQualificationId : null);
      } else {
        setExamId(null);
      }
    } catch (err) {
      console.error("Failed to fetch exams:", err);
    } finally {
      setFetchExamsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const response = await fetch("/api/question-issues", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          examId,
          issueType: IssueType.QUESTION_REQUEST,
          description,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors) {
          setError(data.errors.map((e: any) => e.message).join("\n"));
        } else {
          setError(data.message || "リクエストの送信に失敗しました。");
        }
        return;
      }

      setSuccess(true);
      setExamId(null);
      setDescription("");

      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 2000);
    } catch (err) {
      setError("通信エラーが発生しました。");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      setError("");
      setSuccess(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>問題追加リクエスト</DialogTitle>

      <DialogContent>
        {success ? (
          <Alert severity="success" sx={{ mt: 2 }}>
            リクエストを受け付けました。
          </Alert>
        ) : (
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>試験</InputLabel>
              <Select
                value={examId ?? ""} // ← undefined を完全排除
                label="試験"
                onChange={(e) => setExamId(Number(e.target.value))}
                disabled={loading || fetchExamsLoading}
              >
                {fetchExamsLoading
                  ? [
                      <MenuItem key="loading" value="">
                        読み込み中...
                      </MenuItem>,
                    ]
                  : [
                      <MenuItem key="empty" value="">
                        選択してください
                      </MenuItem>,
                      ...exams.map((exam) => (
                        <MenuItem key={exam.id} value={exam.id}>
                          {exam.examName}
                        </MenuItem>
                      )),
                    ]}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              multiline
              rows={4}
              label="リクエスト内容"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
              placeholder="問題の分野、希望する難易度、問題の内容等を記載して下さい。"
              sx={{ mb: 2 }}
            />

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
          </Box>
        )}
      </DialogContent>

      {!success && (
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            キャンセル
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading || !examId}
          >
            {loading ? <CircularProgress size={20} /> : "送信"}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
}
