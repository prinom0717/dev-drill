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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  DialogContentText,
} from "@mui/material";

interface User {
  id: number;
  userid: string;
  email: string | null;
  role: string;
  failed_attempts: number;
  locked: boolean;
  created_at: string;
  updated_at: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ユーザー作成モーダル用state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createUserid, setCreateUserid] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [createEmail, setCreateEmail] = useState("");
  const [createRole, setCreateRole] = useState("user");
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createValidationErrors, setCreateValidationErrors] = useState<
    { field: string; message: string }[]
  >([]);

  // ユーザー編集モーダル用state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [editRole, setEditRole] = useState("");
  const [editLocked, setEditLocked] = useState(false);
  const [editFailedAttempts, setEditFailedAttempts] = useState(0);
  const [editEmail, setEditEmail] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");

  // 削除確認用state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/users");
      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "ユーザー一覧の取得に失敗しました");
        return;
      }

      setUsers(data.users || []);
    } catch (err) {
      setError("通信エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "error";
      case "editor":
        return "warning";
      case "user":
        return "info";
      default:
        return "default";
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin":
        return "管理者";
      case "editor":
        return "編集者";
      case "user":
        return "一般ユーザー";
      default:
        return role;
    }
  };

  const handleCreateUser = async () => {
    setCreateLoading(true);
    setCreateError("");
    setCreateValidationErrors([]);

    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userid: createUserid,
          password: createPassword,
          email: createEmail || null,
          role: createRole,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors) {
          setCreateValidationErrors(data.errors);
        } else {
          setCreateError(data.message || "ユーザー作成に失敗しました");
        }
        return;
      }

      setCreateModalOpen(false);
      setCreateUserid("");
      setCreatePassword("");
      setCreateEmail("");
      setCreateRole("user");
      fetchUsers();
    } catch (err) {
      setCreateError("通信エラーが発生しました");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleCreateModalClose = () => {
    setCreateModalOpen(false);
    setCreateUserid("");
    setCreatePassword("");
    setCreateEmail("");
    setCreateRole("user");
    setCreateError("");
    setCreateValidationErrors([]);
  };

  const getCreateFieldError = (field: string) => {
    return createValidationErrors.find((err) => err.field === field)?.message;
  };

  const handleEditClick = (user: User) => {
    setEditUser(user);
    setEditRole(user.role);
    setEditLocked(user.locked);
    setEditFailedAttempts(user.failed_attempts);
    setEditEmail(user.email || "");
    setEditError("");
    setEditModalOpen(true);
  };

  const handleEditUser = async () => {
    if (!editUser) return;

    setEditLoading(true);
    setEditError("");

    try {
      const response = await fetch(`/api/admin/users/${editUser.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          role: editRole,
          locked: editLocked,
          failed_attempts: editFailedAttempts,
          email: editEmail || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setEditError(data.message || "ユーザー更新に失敗しました");
        return;
      }

      setEditModalOpen(false);
      setEditUser(null);
      fetchUsers();
    } catch (err) {
      setEditError("通信エラーが発生しました");
    } finally {
      setEditLoading(false);
    }
  };

  const handleEditModalClose = () => {
    setEditModalOpen(false);
    setEditUser(null);
    setEditError("");
  };

  const handleDeleteClick = (user: User) => {
    setDeleteUser(user);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteUser) return;

    setDeleteLoading(true);

    try {
      const response = await fetch(`/api/admin/users/${deleteUser.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "ユーザー削除に失敗しました");
        return;
      }

      setDeleteConfirmOpen(false);
      setDeleteUser(null);
      fetchUsers();
    } catch (err) {
      alert("通信エラーが発生しました");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);
    setDeleteUser(null);
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
          }}
        >
          <Typography component="h1" variant="h5">
            ユーザー管理
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setCreateModalOpen(true)}
          >
            ユーザー作成
          </Button>
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
                  <TableCell>ユーザーID</TableCell>
                  <TableCell>メールアドレス</TableCell>
                  <TableCell>ロール</TableCell>
                  <TableCell>状態</TableCell>
                  <TableCell>失敗回数</TableCell>
                  <TableCell>作成日</TableCell>
                  <TableCell>操作</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.id}</TableCell>
                    <TableCell>{user.userid}</TableCell>
                    <TableCell>{user.email || "-"}</TableCell>
                    <TableCell>
                      <Chip
                        label={getRoleLabel(user.role)}
                        color={getRoleColor(user.role) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {user.locked ? (
                        <Chip label="ロック中" color="error" size="small" />
                      ) : (
                        <Chip label="有効" color="success" size="small" />
                      )}
                    </TableCell>
                    <TableCell>{user.failed_attempts}</TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString("ja-JP")}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        variant="outlined"
                        sx={{ mr: 1 }}
                        onClick={() => handleEditClick(user)}
                      >
                        編集
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        onClick={() => handleDeleteClick(user)}
                      >
                        削除
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {users.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      ユーザーが存在しません
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* ユーザー作成モーダル */}
      <Dialog open={createModalOpen} onClose={handleCreateModalClose} maxWidth="sm" fullWidth>
        <DialogTitle>ユーザー作成</DialogTitle>
        <DialogContent>
          {createError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {createError}
            </Alert>
          )}
          <TextField
            margin="normal"
            required
            fullWidth
            label="ユーザーID"
            value={createUserid}
            onChange={(e) => setCreateUserid(e.target.value)}
            disabled={createLoading}
            error={!!getCreateFieldError("userid")}
            helperText={getCreateFieldError("userid")}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="パスワード"
            type="password"
            value={createPassword}
            onChange={(e) => setCreatePassword(e.target.value)}
            disabled={createLoading}
            error={!!getCreateFieldError("password")}
            helperText={getCreateFieldError("password")}
          />
          <TextField
            margin="normal"
            fullWidth
            label="メールアドレス（任意）"
            type="email"
            value={createEmail}
            onChange={(e) => setCreateEmail(e.target.value)}
            disabled={createLoading}
            error={!!getCreateFieldError("email")}
            helperText={getCreateFieldError("email")}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>ロール</InputLabel>
            <Select
              value={createRole}
              label="ロール"
              onChange={(e) => setCreateRole(e.target.value)}
              disabled={createLoading}
            >
              <MenuItem value="user">一般ユーザー</MenuItem>
              <MenuItem value="editor">編集者</MenuItem>
              <MenuItem value="admin">管理者</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCreateModalClose} disabled={createLoading}>
            キャンセル
          </Button>
          <Button onClick={handleCreateUser} variant="contained" disabled={createLoading}>
            {createLoading ? <CircularProgress size={24} /> : "作成"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ユーザー編集モーダル */}
      <Dialog open={editModalOpen} onClose={handleEditModalClose} maxWidth="sm" fullWidth>
        <DialogTitle>ユーザー編集</DialogTitle>
        <DialogContent>
          {editError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {editError}
            </Alert>
          )}
          <TextField
            margin="normal"
            fullWidth
            label="ユーザーID"
            value={editUser?.userid || ""}
            disabled
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>ロール</InputLabel>
            <Select
              value={editRole}
              label="ロール"
              onChange={(e) => setEditRole(e.target.value)}
              disabled={editLoading}
            >
              <MenuItem value="user">一般ユーザー</MenuItem>
              <MenuItem value="editor">編集者</MenuItem>
              <MenuItem value="admin">管理者</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>アカウント状態</InputLabel>
            <Select
              value={editLocked ? "locked" : "active"}
              label="アカウント状態"
              onChange={(e) => setEditLocked(e.target.value === "locked")}
              disabled={editLoading}
            >
              <MenuItem value="active">有効</MenuItem>
              <MenuItem value="locked">ロック中</MenuItem>
            </Select>
          </FormControl>
          <TextField
            margin="normal"
            fullWidth
            label="失敗回数"
            type="number"
            value={editFailedAttempts}
            onChange={(e) => setEditFailedAttempts(Number.parseInt(e.target.value) || 0)}
            disabled={editLoading}
            slotProps={{ htmlInput: { min: 0 } }}  // ← 新しいAPI
          />
          <TextField
            margin="normal"
            fullWidth
            label="メールアドレス（任意）"
            type="email"
            value={editEmail}
            onChange={(e) => setEditEmail(e.target.value)}
            disabled={editLoading}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditModalClose} disabled={editLoading}>
            キャンセル
          </Button>
          <Button onClick={handleEditUser} variant="contained" disabled={editLoading}>
            {editLoading ? <CircularProgress size={24} /> : "更新"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 削除確認ダイアログ */}
      <Dialog open={deleteConfirmOpen} onClose={handleDeleteCancel}>
        <DialogTitle>ユーザー削除の確認</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {deleteUser?.userid} を削除してもよろしいですか？
            この操作は取り消せません。
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} disabled={deleteLoading}>
            キャンセル
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={deleteLoading}
          >
            {deleteLoading ? <CircularProgress size={24} /> : "削除"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
