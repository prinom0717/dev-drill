"use client";

import { useState, useEffect } from "react";
import { Box, Button, TextField, Typography, CircularProgress } from "@mui/material";

type MarkConfigProps = {
  userId: number;
};

export function MarkConfig({ userId }: MarkConfigProps) {
  const [config, setConfig] = useState({
    markType1: "チェック1",
    markType2: "チェック2",
    markType3: "チェック3",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    async function fetchConfig() {
      try {
        const response = await fetch("/api/mark/config");
        if (response.ok) {
          const data = await response.json();
          setConfig({
            markType1: data.config.markType1,
            markType2: data.config.markType2,
            markType3: data.config.markType3,
          });
        }
      } catch (error) {
        console.error("Failed to fetch mark config:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchConfig();
  }, []);

  async function handleSave() {
    setIsSaving(true);
    setMessage(null);

    try {
      const response = await fetch("/api/mark/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      if (response.ok) {
        setMessage("設定を保存しました。");
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage("設定の保存に失敗しました。");
      }
    } catch (error) {
      console.error("Failed to save mark config:", error);
      setMessage("設定の保存に失敗しました。");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleReset() {
    if (!confirm("デフォルト設定にリセットします。よろしいですか？")) {
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      const response = await fetch("/api/mark/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resetToDefaults: true }),
      });

      if (response.ok) {
        const data = await response.json();
        setConfig({
          markType1: data.config.markType1,
          markType2: data.config.markType2,
          markType3: data.config.markType3,
        });
        setMessage("デフォルト設定にリセットしました。");
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage("リセットに失敗しました。");
      }
    } catch (error) {
      console.error("Failed to reset mark config:", error);
      setMessage("リセットに失敗しました。");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-[0_20px_50px_-44px_rgba(15,23,42,0.3)]">
      <Typography variant="h6" className="mb-4 text-lg font-semibold text-slate-900">
        チェックマーク設定
      </Typography>

      <Box className="space-y-4">
        <TextField
          label="チェックマーク1"
          value={config.markType1}
          onChange={(e) => setConfig({ ...config, markType1: e.target.value })}
          fullWidth
          sx={{ marginBottom: 2 }}
        />
        <TextField
          label="チェックマーク2"
          value={config.markType2}
          onChange={(e) => setConfig({ ...config, markType2: e.target.value })}
          fullWidth
          sx={{ marginBottom: 2 }}
        />
        <TextField
          label="チェックマーク3"
          value={config.markType3}
          onChange={(e) => setConfig({ ...config, markType3: e.target.value })}
          fullWidth
          sx={{ marginBottom: 2 }}
        />

        {message && (
          <Typography className="text-sm text-amber-700">
            {message}
          </Typography>
        )}

        <Box className="flex gap-2">
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={isSaving}
            className="bg-amber-600 hover:bg-amber-700"
          >
            {isSaving ? "保存中..." : "保存"}
          </Button>
          <Button
            variant="outlined"
            onClick={handleReset}
            disabled={isSaving}
          >
            デフォルトにリセット
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
