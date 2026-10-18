import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
} from "@mui/material";
import { profileApi } from "../api/profile"; // подгони путь под свой проект
import { useAuthStore } from "../store/authStore"; // проверь путь

interface DisplayNameDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function DisplayNameDialog({
  open,
  onClose,
}: DisplayNameDialogProps) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const fetchMe = useAuthStore((s) => s.fetchMe);

  const handleSave = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      await profileApi.updateDisplayName(name.trim());
      await fetchMe(); // зачем: подтягиваем свежие данные, чтобы имя обновилось везде
      onClose();
    } catch (e) {
      console.error("Ошибка сохранения имени", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Привет, давай познакомимся 👋</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Как к тебе обращаться?
        </Typography>
        <TextField
          autoFocus
          fullWidth
          label="Ваше имя"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Например, Дима"
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit">
          Позже
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={!name.trim() || loading}
        >
          {loading ? "Сохраняем..." : "Сохранить"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
