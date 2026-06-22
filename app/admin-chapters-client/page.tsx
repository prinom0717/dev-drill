"use client";

import { useEffect, useState } from "react";
import { TextField, Button, Select, MenuItem, FormControl, InputLabel, Paper, Stack, Box } from "@mui/material";

type Exam = { id: number; examName: string; description: string };
type Chapter = { id: number; examId: number; chapterNumber: number; chapterTitle: string; coverage: string | null };

export default function AdminChaptersClient() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    fetchExams();
  }, []);

  useEffect(() => {
    if (selectedExamId) {
      fetchChapters(selectedExamId);
    } else {
      setChapters([]);
    }
  }, [selectedExamId]);

  async function fetchExams() {
    try {
      const res = await fetch("/api/exams");
      const data = await res.json();
      setExams(data.exams || []);
      if (data.exams && data.exams.length > 0) {
        setSelectedExamId(data.exams[0].id);
      }
    } catch (e) {
      console.error("Failed to fetch exams", e);
    }
  }

  async function fetchChapters(examId: number) {
    setLoading(true);
    try {
      const res = await fetch(`/api/chapters?examId=${examId}`);
      const data = await res.json();
      setChapters(data.chapters || []);
    } catch (e) {
      console.error("Failed to fetch chapters", e);
    }
    setLoading(false);
  }

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedExamId) {
      alert("試験を選択してください");
      return;
    }

    const form = e.currentTarget;
    const fd = new FormData(form);
    const payload = {
      examId: selectedExamId,
      chapterNumber: Number(fd.get("chapterNumber") || 1),
      chapterTitle: String(fd.get("chapterTitle") || ""),
      coverage: String(fd.get("coverage") || ""),
    };

    try {
      await fetch("/api/chapters", { method: "POST", body: JSON.stringify(payload) });
      form.reset();
      await fetchChapters(selectedExamId);
    } catch (e) {
      console.error("Failed to add chapter", e);
      alert("章の追加に失敗しました");
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("削除してよいですか？関連する問題も削除されます。")) return;
    try {
      await fetch(`/api/chapters?id=${id}`, { method: "DELETE" });
      if (selectedExamId) await fetchChapters(selectedExamId);
    } catch (e) {
      console.error("Failed to delete chapter", e);
      alert("削除に失敗しました");
    }
  }

  async function handleUpdate(id: number, chapterNumber: number, chapterTitle: string, coverage: string) {
    try {
      await fetch("/api/chapters", {
        method: "PUT",
        body: JSON.stringify({ id, chapterNumber, chapterTitle, coverage }),
      });
      setEditingId(null);
      if (selectedExamId) await fetchChapters(selectedExamId);
    } catch (e) {
      console.error("Failed to update chapter", e);
      alert("更新に失敗しました");
    }
  }

  return (
    <div className="prose mx-auto max-w-4xl p-6">
      <h1 className="text-xl font-semibold">章管理</h1>

      <Paper component="form" onSubmit={handleAdd} sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
        <Stack spacing={2}>
          <Stack direction="row" spacing={2}>
            <FormControl fullWidth size="small">
              <InputLabel>試験を選択</InputLabel>
              <Select
                value={selectedExamId || ""}
                onChange={(e) => setSelectedExamId(Number(e.target.value) || null)}
                label="試験を選択"
              >
                <MenuItem value="">試験を選択</MenuItem>
                {exams.map((exam) => (
                  <MenuItem key={exam.id} value={exam.id}>
                    {exam.examName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              name="chapterNumber"
              placeholder="章番号"
              sx={{ width: 150 }}
              size="small"
              label="章番号"
              type="number"
            />
          </Stack>
          <TextField
            name="chapterTitle"
            placeholder="章タイトル"
            fullWidth
            size="small"
            label="章タイトル"
          />
          <TextField
            name="coverage"
            placeholder="範囲（任意）"
            fullWidth
            size="small"
            label="範囲（任意）"
          />
        </Stack>
        <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
          <Button type="submit" variant="contained" color="warning">
            追加
          </Button>
        </Stack>
      </Paper>

      <div className="mt-6">
        <h2 className="text-lg font-semibold">既存の章 ({chapters.length})</h2>
        {loading ? (
          <p>読み込み中…</p>
        ) : (
          <Stack spacing={2}>
            {chapters.map((chapter: any) => (
              <Paper key={chapter.id} sx={{ p: 3 }}>
                {editingId === chapter.id ? (
                  <Paper sx={{ p: 2 }}>
                    <Stack spacing={2}>
                      <Stack direction="row" spacing={2}>
                        <TextField
                          type="number"
                          defaultValue={chapter.chapterNumber}
                          id={`edit-chapter-num-${chapter.id}`}
                          sx={{ width: 150 }}
                          size="small"
                          label="章番号"
                        />
                        <TextField
                          defaultValue={chapter.chapterTitle}
                          id={`edit-chapter-title-${chapter.id}`}
                          fullWidth
                          size="small"
                          label="章タイトル"
                        />
                      </Stack>
                      <TextField
                        defaultValue={chapter.coverage || ""}
                        id={`edit-chapter-coverage-${chapter.id}`}
                        fullWidth
                        size="small"
                        label="範囲"
                      />
                    </Stack>
                    <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                      <Button
                        onClick={() => {
                          const numInput = document.getElementById(`edit-chapter-num-${chapter.id}`) as HTMLInputElement;
                          const titleInput = document.getElementById(`edit-chapter-title-${chapter.id}`) as HTMLInputElement;
                          const coverageInput = document.getElementById(`edit-chapter-coverage-${chapter.id}`) as HTMLInputElement;
                          handleUpdate(
                            chapter.id,
                            Number(numInput.value),
                            titleInput.value,
                            coverageInput.value
                          );
                        }}
                        variant="contained"
                        color="primary"
                        size="small"
                      >
                        保存
                      </Button>
                      <Button
                        onClick={() => setEditingId(null)}
                        variant="outlined"
                        size="small"
                      >
                        キャンセル
                      </Button>
                    </Stack>
                  </Paper>
                ) : (
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-sm font-medium">
                        第{chapter.chapterNumber}章: {chapter.chapterTitle}
                      </div>
                      {chapter.coverage && (
                        <div className="text-xs text-slate-600">{chapter.coverage}</div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => setEditingId(chapter.id)}
                        variant="outlined"
                        size="small"
                      >
                        編集
                      </Button>
                      <Button
                        onClick={() => handleDelete(chapter.id)}
                        variant="contained"
                        color="error"
                        size="small"
                      >
                        削除
                      </Button>
                    </div>
                  </div>
                )}
              </Paper>
            ))}
          </Stack>
        )}
      </div>
    </div>
  );
}
