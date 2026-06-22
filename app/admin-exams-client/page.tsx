"use client";

import { useEffect, useState } from "react";
import { TextField, Button, Paper, Stack, Box } from "@mui/material";

type Exam = { id: number; examName: string; description: string };

export default function AdminExamsClient() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    fetchExams();
  }, []);

  async function fetchExams() {
    setLoading(true);
    try {
      const res = await fetch("/api/exams");
      const data = await res.json();
      setExams(data.exams || []);
    } catch (e) {
      console.error("Failed to fetch exams", e);
    }
    setLoading(false);
  }

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const payload = {
      examName: String(fd.get("examName") || ""),
      description: String(fd.get("description") || ""),
    };

    try {
      await fetch("/api/exams", { method: "POST", body: JSON.stringify(payload) });
      form.reset();
      await fetchExams();
    } catch (e) {
      console.error("Failed to add exam", e);
      alert("試験の追加に失敗しました");
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("削除してよいですか？関連する章と問題も削除されます。")) return;
    try {
      await fetch(`/api/exams?id=${id}`, { method: "DELETE" });
      await fetchExams();
    } catch (e) {
      console.error("Failed to delete exam", e);
      alert("削除に失敗しました");
    }
  }

  async function handleUpdate(id: number, examName: string, description: string) {
    try {
      await fetch("/api/exams", {
        method: "PUT",
        body: JSON.stringify({ id, examName, description }),
      });
      setEditingId(null);
      await fetchExams();
    } catch (e) {
      console.error("Failed to update exam", e);
      alert("更新に失敗しました");
    }
  }

  return (
    <div className="prose mx-auto max-w-4xl p-6">
      <h1 className="text-xl font-semibold">試験管理</h1>

      <Paper component="form" onSubmit={handleAdd} sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
        <Stack spacing={2}>
          <TextField
            name="examName"
            placeholder="試験名"
            fullWidth
            size="small"
            label="試験名"
          />
          <TextField
            name="description"
            placeholder="説明"
            fullWidth
            size="small"
            label="説明"
          />
        </Stack>
        <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
          <Button type="submit" variant="contained" color="warning">
            追加
          </Button>
        </Stack>
      </Paper>

      <div className="mt-6">
        <h2 className="text-lg font-semibold">既存の試験 ({exams.length})</h2>
        {loading ? (
          <p>読み込み中…</p>
        ) : (
          <Stack spacing={2}>
            {exams.map((exam: any) => (
              <Paper key={exam.id} sx={{ p: 3 }}>
                {editingId === exam.id ? (
                  <Paper sx={{ p: 2 }}>
                    <Stack spacing={2}>
                      <TextField
                        defaultValue={exam.examName}
                        id={`edit-exam-name-${exam.id}`}
                        fullWidth
                        size="small"
                        label="試験名"
                      />
                      <TextField
                        defaultValue={exam.description}
                        id={`edit-exam-desc-${exam.id}`}
                        fullWidth
                        size="small"
                        label="説明"
                      />
                    </Stack>
                    <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                      <Button
                        onClick={() => {
                          const nameInput = document.getElementById(`edit-exam-name-${exam.id}`) as HTMLInputElement;
                          const descInput = document.getElementById(`edit-exam-desc-${exam.id}`) as HTMLInputElement;
                          handleUpdate(exam.id, nameInput.value, descInput.value);
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
                      <div className="text-sm font-medium">{exam.examName}</div>
                      <div className="text-xs text-slate-600">{exam.description}</div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => setEditingId(exam.id)}
                        variant="outlined"
                        size="small"
                      >
                        編集
                      </Button>
                      <Button
                        onClick={() => handleDelete(exam.id)}
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
