"use client";

import { useEffect, useState } from "react";
import { TextField, Button, Select, MenuItem, FormControl, InputLabel, Paper, Stack, Box, Tabs, Tab, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";

type Exam = { id: number; examName: string; description: string };
type Chapter = { id: number; examId: number; chapterNumber: number; chapterTitle: string; coverage: string | null };
type Question = any;

type TabType = "exams" | "chapters" | "questions";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<TabType>("exams");
  
  // 試験管理用
  const [exams, setExams] = useState<Exam[]>([]);
  const [editingExamId, setEditingExamId] = useState<number | null>(null);
  
  // 章管理用
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<number | null>(null);
  const [editingChapterId, setEditingChapterId] = useState<number | null>(null);
  
  // 問題管理用
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedChapterIdForQuestions, setSelectedChapterIdForQuestions] = useState<number | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [editingDifficulty, setEditingDifficulty] = useState<string>("1");
  const [showEditModal, setShowEditModal] = useState(false);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeTab === "exams") fetchExams();
    if (activeTab === "chapters") {
      fetchExams();
      if (selectedExamId) fetchChapters(selectedExamId);
    }
    if (activeTab === "questions") {
      fetchExams();
      if (selectedExamId) {
        fetchChapters(selectedExamId);
        if (selectedChapterIdForQuestions) fetchQuestions();
      }
    }
  }, [activeTab, selectedExamId, selectedChapterIdForQuestions]);

  // 試験管理
  async function fetchExams() {
    try {
      const res = await fetch("/api/exams");
      const data = await res.json();
      setExams(data.exams || []);
    } catch (e) {
      console.error("Failed to fetch exams", e);
    }
  }

  async function handleAddExam(e: React.FormEvent<HTMLFormElement>) {
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

  async function handleDeleteExam(id: number) {
    if (!confirm("削除してよいですか？関連する章と問題も削除されます。")) return;
    try {
      await fetch(`/api/exams?id=${id}`, { method: "DELETE" });
      await fetchExams();
    } catch (e) {
      console.error("Failed to delete exam", e);
      alert("削除に失敗しました");
    }
  }

  async function handleUpdateExam(id: number, examName: string, description: string) {
    try {
      await fetch("/api/exams", {
        method: "PUT",
        body: JSON.stringify({ id, examName, description }),
      });
      setEditingExamId(null);
      await fetchExams();
    } catch (e) {
      console.error("Failed to update exam", e);
      alert("更新に失敗しました");
    }
  }

  // 章管理
  async function fetchChapters(examId: number) {
    try {
      const res = await fetch(`/api/exams/${examId}/chapters`);
      const data = await res.json();
      setChapters(data.chapters || []);
    } catch (e) {
      console.error("Failed to fetch chapters", e);
    }
  }

  async function handleAddChapter(e: React.FormEvent<HTMLFormElement>) {
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

  async function handleDeleteChapter(id: number) {
    if (!confirm("削除してよいですか？関連する問題も削除されます。")) return;
    try {
      await fetch(`/api/chapters?id=${id}`, { method: "DELETE" });
      if (selectedExamId) await fetchChapters(selectedExamId);
    } catch (e) {
      console.error("Failed to delete chapter", e);
      alert("削除に失敗しました");
    }
  }

  async function handleUpdateChapter(id: number, chapterNumber: number, chapterTitle: string, coverage: string) {
    try {
      await fetch("/api/chapters", {
        method: "PUT",
        body: JSON.stringify({ id, chapterNumber, chapterTitle, coverage }),
      });
      setEditingChapterId(null);
      if (selectedExamId) await fetchChapters(selectedExamId);
    } catch (e) {
      console.error("Failed to update chapter", e);
      alert("更新に失敗しました");
    }
  }

  // 問題管理
  async function fetchQuestions() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedExamId) params.append("qualificationId", String(selectedExamId));
      if (selectedChapterIdForQuestions) params.append("chapterId", String(selectedChapterIdForQuestions));
      params.append("includeExamChapter", "true");
      params.append("count", "200");

      const res = await fetch(`/api/questions?${params.toString()}`);
      const data = await res.json();
      setQuestions(data.questions || []);
    } catch (e) {
      console.error("Failed to fetch questions", e);
      setQuestions([]);
    }
    setLoading(false);
  }

  async function handleAddQuestion(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedChapterIdForQuestions) {
      alert("章を選択してください");
      return;
    }

    const form = e.currentTarget;
    const fd = new FormData(form);
    const payload = {
      qualificationId: String(selectedExamId || ""),
      chapterId: selectedChapterIdForQuestions,
      questionType: "choice",
      questionText: String(fd.get("questionText") || ""),
      choices: String(fd.get("choices") || "").split("\n").map((s: any) => s.trim()).filter(Boolean),
      answer: Number(fd.get("answer") || 1),
      explanation: String(fd.get("explanation") || ""),
      difficulty: Number(fd.get("difficulty") || 1),
    };

    try {
      await fetch(`/api/questions`, { method: "POST", body: JSON.stringify(payload) });
      form.reset();
      await fetchQuestions();
    } catch (e) {
      console.error("Failed to add question", e);
      alert("問題の追加に失敗しました");
    }
  }

  async function handleDeleteQuestion(id: number) {
    if (!confirm("削除してよいですか？")) return;
    try {
      await fetch(`/api/questions?id=${id}`, { method: "DELETE" });
      await fetchQuestions();
    } catch (e) {
      console.error("Failed to delete question", e);
      alert("削除に失敗しました");
    }
  }

  async function handleEditQuestion(q: Question) {
    setEditingQuestion(q);
    setEditingDifficulty(String(q.difficulty || "1"));
    setShowEditModal(true);
  }

  async function handleUpdateQuestion(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editingQuestion) return;

    const form = e.currentTarget;
    const fd = new FormData(form);
    const payload = {
      id: editingQuestion.id,
      fields: {
        questionText: String(fd.get("questionText") || ""),
        choices: String(fd.get("choices") || "").split("\n").map((s: any) => s.trim()).filter(Boolean),
        answer: Number(fd.get("answer") || 1),
        explanation: String(fd.get("explanation") || ""),
        difficulty: Number(fd.get("difficulty") || 1),
      },
    };

    try {
      await fetch(`/api/questions`, { method: "PUT", body: JSON.stringify(payload) });
      setShowEditModal(false);
      setEditingQuestion(null);
      await fetchQuestions();
    } catch (e) {
      console.error("Failed to update question", e);
      alert("更新に失敗しました");
    }
  }

  return (
    <div className="prose mx-auto max-w-4xl p-6">
      <h1 className="text-2xl font-semibold">管理画面</h1>

      <Box sx={{ mb: 6 }}>
        <Tabs value={activeTab} onChange={(e, value) => setActiveTab(value)}>
          <Tab value="exams" label="試験管理" />
          <Tab value="chapters" label="章管理" />
          <Tab value="questions" label="問題管理" />
        </Tabs>
      </Box>

      {activeTab === "exams" && (
        <Stack spacing={6}>
          <Paper component="form" onSubmit={handleAddExam} sx={{ p: 3, width: '100%', mx: 'auto' }}>
            <Stack spacing={2}>
              <TextField name="examName" placeholder="試験名" fullWidth size="small" label="試験名" />
              <TextField name="description" placeholder="説明" fullWidth size="small" label="説明" multiline rows={2} />
            </Stack>
            <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
              <Button type="submit" variant="contained" color="warning">
                追加
              </Button>
            </Stack>
          </Paper>

          <div>
            <h2 className="text-lg font-semibold">既存の試験 ({exams.length})</h2>
            <Stack spacing={2}>
              {exams.map((exam: any) => (
                <Paper key={exam.id} sx={{ p: 3 }}>
                  {editingExamId === exam.id ? (
                    <Box sx={{ p: 2 }}>
                      <Stack spacing={2}>
                        <TextField defaultValue={exam.examName} id={`edit-exam-name-${exam.id}`} fullWidth size="small" label="試験名" />
                        <TextField defaultValue={exam.description} id={`edit-exam-desc-${exam.id}`} fullWidth size="small" label="説明" multiline rows={2} />
                        <Stack direction="row" spacing={2}>
                          <Button onClick={() => {
                            const nameInput = document.getElementById(`edit-exam-name-${exam.id}`) as HTMLInputElement;
                            const descInput = document.getElementById(`edit-exam-desc-${exam.id}`) as HTMLTextAreaElement;
                            handleUpdateExam(exam.id, nameInput.value, descInput.value);
                          }} variant="contained" color="primary" size="small">保存</Button>
                          <Button onClick={() => setEditingExamId(null)} variant="outlined" size="small">キャンセル</Button>
                        </Stack>
                      </Stack>
                    </Box>
                  ) : (
                    <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "flex-start" }}>
                      <Box>
                        <div className="text-sm font-medium">{exam.examName}</div>
                        <div className="text-xs text-slate-600">{exam.description}</div>
                      </Box>
                      <Stack direction="row" spacing={2}>
                        <Button onClick={() => setEditingExamId(exam.id)} variant="outlined" size="small">編集</Button>
                        <Button onClick={() => handleDeleteExam(exam.id)} variant="contained" color="error" size="small">削除</Button>
                      </Stack>
                    </Stack>
                  )}
                </Paper>
              ))}
            </Stack>
          </div>
        </Stack>
      )}

      {activeTab === "chapters" && (
        <Stack spacing={6} >

          <Paper component="form" onSubmit={handleAddChapter} sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
            <Stack spacing={2}>
              <Box sx={{ mb: 4 }}>
                <FormControl size="small" fullWidth>
                  <InputLabel>試験を選択</InputLabel>
                  <Select
                    value={selectedExamId || ""}
                    onChange={(e) => setSelectedExamId(Number(e.target.value) || null)}
                    label="試験を選択"
                  >
                    <MenuItem value="">試験を選択</MenuItem>
                    {exams.map((exam) => (
                      <MenuItem key={exam.id} value={exam.id}>{exam.examName}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              <Stack direction="row" spacing={2}>
                <TextField name="chapterNumber" placeholder="章番号" sx={{ width: 150 }} size="small" label="章番号" type="number" />
                <TextField name="chapterTitle" placeholder="章タイトル" fullWidth size="small" label="章タイトル" />
              </Stack>
              <TextField name="coverage" placeholder="範囲（任意）" fullWidth size="small" label="範囲（任意）" multiline rows={2} />
            </Stack>
            <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
              <Button type="submit" variant="contained" color="warning">
                追加
              </Button>
            </Stack>
          </Paper>

          <div>
            <h2 className="text-lg font-semibold">既存の章 ({chapters.length})</h2>
            <Stack spacing={2}>
              {chapters.map((chapter: any) => (
                <Paper key={chapter.id} sx={{ p: 3 }}>
                  {editingChapterId === chapter.id ? (
                    <Box sx={{ p: 2 }}>
                      <Stack spacing={2}>
                        <Stack direction="row" spacing={2}>
                          <TextField type="number" defaultValue={chapter.chapterNumber} id={`edit-chapter-num-${chapter.id}`} sx={{ width: 150 }} size="small" label="章番号" />
                          <TextField defaultValue={chapter.chapterTitle} id={`edit-chapter-title-${chapter.id}`} fullWidth size="small" label="章タイトル" />
                        </Stack>
                        <TextField defaultValue={chapter.coverage || ""} id={`edit-chapter-coverage-${chapter.id}`} fullWidth size="small" label="範囲" multiline rows={2} />
                        <Stack direction="row" spacing={2}>
                          <Button onClick={() => {
                            const numInput = document.getElementById(`edit-chapter-num-${chapter.id}`) as HTMLInputElement;
                            const titleInput = document.getElementById(`edit-chapter-title-${chapter.id}`) as HTMLInputElement;
                            const coverageInput = document.getElementById(`edit-chapter-coverage-${chapter.id}`) as HTMLTextAreaElement;
                            handleUpdateChapter(chapter.id, Number(numInput.value), titleInput.value, coverageInput.value);
                          }} variant="contained" color="primary" size="small">保存</Button>
                          <Button onClick={() => setEditingChapterId(null)} variant="outlined" size="small">キャンセル</Button>
                        </Stack>
                      </Stack>
                    </Box>
                  ) : (
                    <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "flex-start" }}>
                      <Box>
                        <div className="text-sm font-medium">第{chapter.chapterNumber}章: {chapter.chapterTitle}</div>
                        {chapter.coverage && <div className="text-xs text-slate-600">{chapter.coverage}</div>}
                      </Box>
                      <Stack direction="row" spacing={2}>
                        <Button onClick={() => setEditingChapterId(chapter.id)} variant="outlined" size="small">編集</Button>
                        <Button onClick={() => handleDeleteChapter(chapter.id)} variant="contained" color="error" size="small">削除</Button>
                      </Stack>
                    </Stack>
                  )}
                </Paper>
              ))}
            </Stack>
          </div>
        </Stack>
      )}

      {activeTab === "questions" && (
        <Stack spacing={6} sx={{ width: '800px' }}>
          <Paper component="form" onSubmit={handleAddQuestion} sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
            <Stack spacing={3}>
              <Stack direction="row" spacing={2}>
                <FormControl size="small" fullWidth>
                  <InputLabel>試験を選択</InputLabel>
                  <Select
                    value={selectedExamId || ""}
                    onChange={(e) => setSelectedExamId(Number(e.target.value) || null)}
                    label="試験を選択"
                  >
                    <MenuItem value="">試験を選択</MenuItem>
                    {exams.map((exam) => (
                      <MenuItem key={exam.id} value={exam.id}>{exam.examName}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl size="small" fullWidth disabled={!selectedExamId}>
                  <InputLabel>章を選択</InputLabel>
                  <Select
                    value={selectedChapterIdForQuestions || ""}
                    onChange={(e) => setSelectedChapterIdForQuestions(Number(e.target.value) || null)}
                    label="章を選択"
                  >
                    <MenuItem value="">章を選択</MenuItem>
                    {chapters.map((chapter) => (
                      <MenuItem key={chapter.id} value={chapter.id}>{chapter.chapterTitle}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>
              <TextField name="questionText" placeholder="問題文" fullWidth size="small" label="問題文" multiline rows={3} />
              <TextField name="choices" placeholder="選択肢（改行区切りで4つ）" fullWidth size="small" label="選択肢（改行区切りで4つ）" multiline rows={4} />
              <Stack direction="row" spacing={2}>
                <TextField name="answer" placeholder="正解の行番号 (1から)" sx={{ width: 200 }} size="small" label="正解の行番号" type="number" />
                <Box sx={{ flex: 1 }} />
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>難易度</InputLabel>
                  <Select name="difficulty" label="難易度" defaultValue="1">
                    <MenuItem value="1">難易度1</MenuItem>
                    <MenuItem value="2">難易度2</MenuItem>
                    <MenuItem value="3">難易度3</MenuItem>
                    <MenuItem value="4">難易度4</MenuItem>
                    <MenuItem value="5">難易度5</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
              <TextField name="explanation" placeholder="解説" fullWidth size="small" label="解説" multiline rows={3} />
            </Stack>
            <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
              <Button type="submit" variant="contained" color="warning">
                追加
              </Button>
            </Stack>
          </Paper>

          <div>
            <h2 className="text-lg font-semibold">既存の問題 ({questions.length})</h2>
            {loading ? (
              <p>読み込み中…</p>
            ) : (
              <Stack spacing={2}>
                {questions.map((q: any) => (
                  <Paper key={q.id} sx={{ p: 3 }}>
                    <Box>
                      <div className="text-xs text-slate-600">{q.examName || q.qualificationId} / {q.chapterTitle || `章${q.chapterId}`} / 難易度:{q.difficulty}</div>
                      <div className="text-sm font-medium" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{q.id} — {q.questionText}</div>
                      <div className="mt-1 text-sm" style={{ padding: "5px 30px", wordBreak: 'break-word' }}>
                        {q.choices?.map((c:any,i:number)=>(<div key={i}>{i+1}. {c}</div>))}
                      </div>
                    </Box>
                    <Stack direction="row" spacing={2}>
                      <Button onClick={() => handleEditQuestion(q)} variant="outlined" size="small">編集</Button>
                      <Button onClick={() => handleDeleteQuestion(q.id)} variant="contained" color="error" size="small">削除</Button>
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            )}
          </div>

          <Paper sx={{ mt: 6, p: 3, maxWidth: 800, mx: 'auto' }}>
            <h2 className="text-lg font-semibold">CSV一括インポート</h2>
            <Box sx={{ mb: 2 }}>
              <div className="text-sm text-slate-600">
                フォーマット: 試験名,章名,問題文,選択肢1,選択肢2,選択肢3,選択肢4,正解インデックス,解説,難易度
              </div>
              <div className="mb-2 text-xs text-slate-500">
                ※ 試験名・章名が既存のデータと一致する場合は、その試験・章に登録されます
              </div>
              <div className="mb-2 text-xs text-slate-500">
                例: ITパスポート試験,暗号技術,公開鍵暗号方式で正しい説明はどれか,暗号化と復号に同じ鍵を使う,公開鍵と秘密鍵の組を使う,平文をそのまま送信する,必ずハッシュ関数だけで暗号化する,2,公開鍵暗号方式では鍵の組を利用する,2
              </div>
            </Box>
            <TextField
              id="csv-text"
              fullWidth
              multiline
              rows={6}
              size="small"
              placeholder="CSVテキストを貼り付け..."
              sx={{ fontFamily: "monospace", fontSize: "0.875rem" }}
            />
            <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
              <Button
                onClick={() => {
                  const csvText = (document.getElementById("csv-text") as HTMLTextAreaElement).value;
                  if (!csvText.trim()) {
                    alert("CSVテキストを入力してください");
                    return;
                  }

                  // CSVパースとインポート処理（admin-questions-clientと同様）
                  // 簡単化のためここに実装
                  handleCSVImport(csvText);
                }}
                variant="contained"
                color="primary"
              >
                CSVインポート
              </Button>
            </Stack>
          </Paper>
        </Stack>
      )}

      <Dialog open={showEditModal} onClose={() => {
        setShowEditModal(false);
        setEditingDifficulty("1");
      }} maxWidth="md" fullWidth>
        <DialogTitle>問題を編集</DialogTitle>
        <DialogContent>
          <Stack component="form" onSubmit={handleUpdateQuestion} spacing={3} sx={{ pt: 2 }}>
            <TextField name="questionText" defaultValue={editingQuestion?.questionText} fullWidth size="small" label="問題文" multiline rows={3} />
            <TextField name="choices" defaultValue={editingQuestion?.choices?.join("\n") || ""} fullWidth size="small" label="選択肢（改行区切りで4つ）" multiline rows={4} />
            <Stack direction="row" spacing={2}>
              <TextField name="answer" type="number" defaultValue={editingQuestion?.answer || 1} sx={{ width: 200 }} size="small" label="正解の行番号" />
              <Box sx={{ flex: 1 }} />
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>難易度</InputLabel>
                <Select name="difficulty" value={editingDifficulty} onChange={(e) => setEditingDifficulty(e.target.value)} label="難易度">
                  <MenuItem value="1">難易度1</MenuItem>
                  <MenuItem value="2">難易度2</MenuItem>
                  <MenuItem value="3">難易度3</MenuItem>
                  <MenuItem value="4">難易度4</MenuItem>
                  <MenuItem value="5">難易度5</MenuItem>
                </Select>
              </FormControl>
            </Stack>
            <TextField name="explanation" defaultValue={editingQuestion?.explanation || ""} fullWidth size="small" label="解説" multiline rows={3} />
            <Stack direction="row" spacing={2}>
              <Button type="submit" variant="contained" color="primary">更新</Button>
              <Box sx={{ flex: 1 }} />
              <Button type="button" onClick={() => setShowEditModal(false)} variant="outlined">キャンセル</Button>
            </Stack>
          </Stack>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// CSVインポート関数を追加
async function handleCSVImport(csvText: string) {
  const lines = csvText.trim().split("\n");
  const questions = [];
  const startIndex = lines[0].startsWith("試験名") || lines[0].startsWith("examName") ? 1 : 0;

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const parts = line.split(",").map(p => p.trim());

    if (parts.length >= 8) {
      const examName = parts[0];
      const chapterTitle = parts[1];
      const question = {
        examName,
        chapterTitle,
        questionType: "choice",
        questionText: parts[2],
        choices: parts.slice(3, 7),
        answer: Number(parts[7]),
        explanation: parts[8] || "",
        difficulty: Number(parts[9]) || 1,
      };

      if (!examName || !chapterTitle) continue;
      if (isNaN(question.answer) || question.answer < 1 || question.answer > 4) continue;
      if (question.choices.length !== 4) continue;

      questions.push(question);
    }
  }

  try {
    const res = await fetch(`/api/questions/bulk`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questions }),
    });

    const data = await res.json();
    if (data.ok) {
      const successCount = data.results.filter((r: any) => r.success).length;
      alert(`${successCount}件の問題をインポートしました`);
      (document.getElementById("csv-text") as HTMLTextAreaElement).value = "";
      // 問題リストを更新
      location.reload();
    } else {
      alert(`インポートに失敗しました: ${data.message}`);
    }
  } catch (e) {
    console.error("CSVインポート失敗", e);
    alert("CSVインポートに失敗しました");
  }
}
