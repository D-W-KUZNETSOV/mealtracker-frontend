import { useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useSnackbar } from 'notistack';

import { feedbackApi } from '../api/feedback';
import type { ApiError } from '../types/api';

interface FeedbackDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function FeedbackDialog({ open, onClose }: FeedbackDialogProps) {
  const { enqueueSnackbar } = useSnackbar();
  const [message, setMessage] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [sending, setSending] = useState(false);

  const reset = () => {
    setMessage('');
    setContactEmail('');
  };

  const handleClose = () => {
    if (sending) return;
    reset();
    onClose();
  };

  const handleSubmit = async () => {
    if (message.trim().length < 5) {
      enqueueSnackbar('Сообщение от 5 символов', { variant: 'warning' });
      return;
    }

    setSending(true);
    try {
      await feedbackApi.send({
        message: message.trim(),
        contactEmail: contactEmail.trim() || undefined,
      });
      enqueueSnackbar('Спасибо! Фидбек отправлен', { variant: 'success' });
      reset();
      onClose();
    } catch (err) {
      const apiError = err as ApiError;
      enqueueSnackbar(apiError.message || 'Ошибка отправки', {
        variant: 'error',
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Обратная связь</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Нашли баг? Есть идея? Напишите — я прочитаю каждое сообщение.
          </Typography>

          <TextField
            label="Сообщение"
            fullWidth
            required
            multiline
            minRows={4}
            maxRows={10}
            autoFocus
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            helperText={`${message.length} / 5000`}
            disabled={sending}
            slotProps={{ htmlInput: { maxLength: 5000 } }}
          />

          <TextField
            label="Email для ответа (необязательно)"
            type="email"
            fullWidth
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            helperText="Если хотите, чтобы я ответил лично"
            disabled={sending}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={sending}>
          Отмена
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={sending || message.trim().length < 5}
        >
          {sending ? 'Отправка...' : 'Отправить'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}