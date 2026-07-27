"use client";

import { useState } from "react";
import { TextField, Button, Box, CircularProgress } from "@mui/material";

type Props = {
  onSubmit: (answer: string) => void;
  disabled?: boolean;
  isLoading?: boolean;
  placeholder?: string;
};

export function DescriptiveAnswerInput({
  onSubmit,
  disabled = false,
  isLoading = false,
  placeholder = "回答を入力してください...",
}: Props) {
  const [answer, setAnswer] = useState("");

  function handleSubmit() {
    if (answer.trim()) {
      onSubmit(answer.trim());
    }
  }

  function handleKeyPress(event: React.KeyboardEvent) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
  }

  return (
    <Box className="space-y-3">
      <TextField
        multiline
        rows={4}
        fullWidth
        placeholder={placeholder}
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        onKeyPress={handleKeyPress}
        disabled={disabled || isLoading}
        variant="outlined"
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: "1.5rem",
          },
        }}
      />
      <Button
        variant="contained"
        fullWidth
        onClick={handleSubmit}
        disabled={disabled || isLoading || !answer.trim()}
        sx={{
          borderRadius: "1.5rem",
          py: 1.5,
          textTransform: "none",
          fontSize: "1rem",
        }}
      >
        {isLoading ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <CircularProgress size={20} color="inherit" />
            <span>判定中...</span>
          </Box>
        ) : (
          "回答を送信"
        )}
      </Button>
    </Box>
  );
}
