"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material";

interface ValidationError {
  field: string;
  message: string;
}

export default function RegisterPage() {
  const router = useRouter();

  const [userid, setUserid] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setValidationErrors([]);
    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userid, password, email: email || null }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors) {
          setValidationErrors(data.errors);
        } else {
          setError(data.message || "登録に失敗しました");
        }
        return;
      }

      router.push("/login?registered=true");
    } catch (err) {
      setError("通信エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  const getFieldError = (field: string) => {
    return validationErrors.find((err) => err.field === field)?.message;
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper
        elevation={3}
        sx={{
          p: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography component="h1" variant="h4" gutterBottom>
          新規登録
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          アカウントを作成してください
        </Typography>

        {error && (
          <Alert severity="error" sx={{ width: "100%", mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%" }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="userid"
            label="ユーザーID"
            name="userid"
            autoComplete="username"
            autoFocus
            value={userid}
            onChange={(e) => setUserid(e.target.value)}
            disabled={loading}
            error={!!getFieldError("userid")}
            helperText={getFieldError("userid")}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="パスワード"
            type="password"
            id="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            error={!!getFieldError("password")}
            helperText={getFieldError("password")}
          />
          <TextField
            margin="normal"
            fullWidth
            name="email"
            label="メールアドレス（任意）"
            type="email"
            id="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            error={!!getFieldError("email")}
            helperText={getFieldError("email")}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "登録"}
          </Button>
          <Box sx={{ textAlign: "center" }}>
            <Link href="/login">
              <Typography variant="body2" color="primary">
                すでにアカウントをお持ちの方はログイン
              </Typography>
            </Link>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}
