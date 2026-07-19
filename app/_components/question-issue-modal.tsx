"use client";

import { useState } from "react";
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

interface QuestionIssueModalProps {
  open: boolean;
  onClose: () => void;
  questionId: number;
}

export function QuestionIssueModal({
  open,
  onClose,
  questionId,
}: QuestionIssueModalProps) {
  const [issueType, setIssueType] = useState<IssueType | "">("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

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
          questionId,
          issueType,
          description,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          setError(data.message || "同様の不備が起票されています。");
        } else if (data.errors) {
          setError(data.errors.map((e: any) => e.message).join("\n"));
        } else {
          setError(data.message || "不備起票の送信に失敗しました。");
        }
        return;
      }

      setSuccess(true);
      setIssueType("");
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
      <DialogTitle>不備を起票する</DialogTitle>
      <DialogContent>
        {success ? (
          <Alert severity="success" sx={{ mt: 2 }}>
            起票を受け付けました。
          </Alert>
        ) : (
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>不備種別</InputLabel>
              <Select
                value={issueType}
                label="不備種別"
                onChange={(e) => setIssueType(e.target.value as IssueType)}
                disabled={loading}
              >
                <MenuItem value={IssueType.TYPO}>誤字・脱字</MenuItem>
                <MenuItem value={IssueType.INCORRECT_CONTENT}>内容が誤っている</MenuItem>
                <MenuItem value={IssueType.INSUFFICIENT_EXPLANATION}>
                  解説が不十分/誤り
                </MenuItem>
                <MenuItem value={IssueType.UNCLEAR_EXPRESSION}>表現が分かりにくい</MenuItem>
                <MenuItem value={IssueType.OTHER}>その他</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="不備内容の詳細"
              multiline
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
              placeholder="不備の内容を具体的に記述してください"
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
            disabled={loading || !issueType || !description.trim()}
          >
            {loading ? <CircularProgress size={20} /> : "送信"}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
}
