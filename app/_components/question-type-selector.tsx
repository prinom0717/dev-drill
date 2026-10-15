"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
} from "@mui/material";

interface QuestionTypeSelectorProps {
  mode: "random" | "unanswered";
  qualificationId: string;
  chapterId?: number;
  count?: number;
}

export function QuestionTypeSelector({
  mode,
  qualificationId,
  chapterId,
  count,
}: QuestionTypeSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // questionType パラメータがない場合のみダイアログを表示
    const shouldShow = (mode === "random" || mode === "unanswered") && !searchParams.get("questionType");
    setOpen(shouldShow);
  }, [mode, searchParams]);

  const handleSelect = (questionType: "choice" | "descriptive" | "all") => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("questionType", questionType);
    
    // 既存のパラメータを維持
    if (mode) params.set("mode", mode);
    if (typeof chapterId === "number") params.set("chapterId", String(chapterId));
    if (typeof count === "number" && count > 0) params.set("count", String(count));
    
    router.push(`/qualifications/${qualificationId}/play?${params.toString()}`);
    setOpen(false);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {mode === "random" ? "ランダム出題" : "未出題問題"}の問題タイプを選択
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
          <Button
            variant="outlined"
            fullWidth
            onClick={() => handleSelect("choice")}
            sx={{ py: 2, fontSize: "1rem" }}
          >
            選択問題のみ
          </Button>
          <Button
            variant="outlined"
            fullWidth
            onClick={() => handleSelect("descriptive")}
            sx={{ py: 2, fontSize: "1rem" }}
          >
            記述問題のみ
          </Button>
          <Button
            variant="contained"
            fullWidth
            onClick={() => handleSelect("all")}
            sx={{ py: 2, fontSize: "1rem" }}
          >
            両方
          </Button>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>キャンセル</Button>
      </DialogActions>
    </Dialog>
  );
}
