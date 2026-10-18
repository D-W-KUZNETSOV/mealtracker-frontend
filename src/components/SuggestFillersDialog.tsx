import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Paper,
  Stack,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useSnackbar } from "notistack";

import { useSuggestFillers, useAddPortion } from "../hooks/useStats";
import { roundNutrient } from "../types/api";
import type { ApiError, FillerSuggestionDto } from "../types/api";

interface SuggestFillersDialogProps {
  open: boolean;
  onClose: () => void;
  date: string; // YYYY-MM-DD
}

export default function SuggestFillersDialog({
  open,
  onClose,
  date,
}: SuggestFillersDialogProps) {
  const { enqueueSnackbar } = useSnackbar();
  const addMutation = useAddPortion();

  const query = useSuggestFillers(date, open);

  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [submitting, setSubmitting] = useState(false);

  // Сброс при открытии
  useEffect(() => {
    if (open) {
      setSelectedIds(new Set());
      setSubmitting(false);
    }
  }, [open]);

  const suggestions: FillerSuggestionDto[] = query.data?.suggestions ?? [];

  // Итог по выбранным
  const totals = useMemo(() => {
    let calories = 0;
    let proteins = 0;
    for (const s of suggestions) {
      if (selectedIds.has(s.ingredientId)) {
        calories += s.calories;
        proteins += s.proteins;
      }
    }
    return { calories, proteins };
  }, [suggestions, selectedIds]);

  const toggle = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSubmit = async () => {
    if (selectedIds.size === 0) return;
    setSubmitting(true);
    let added = 0;
    try {
      for (const s of suggestions) {
        if (!selectedIds.has(s.ingredientId)) continue;
        await addMutation.mutateAsync({
          ingredientId: s.ingredientId,
          weightInGrams: s.weightInGrams,
        });
        added++;
      }
      enqueueSnackbar(`Добавлено: ${added}`, { variant: "success" });
      onClose();
    } catch (err) {
      const apiError = err as ApiError;
      enqueueSnackbar(apiError.message || `Ошибка (добавлено: ${added})`, {
        variant: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Подсказать добор</DialogTitle>
      <DialogContent>
        {query.isLoading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {query.isError && (
          <Alert severity="error">
            {(query.error as unknown as ApiError)?.message || "Ошибка загрузки"}
          </Alert>
        )}

        {query.data && (
          <Stack spacing={2} sx={{ mt: 1 }}>
            {/* Дельта */}
            <Paper variant="outlined" sx={{ p: 2, bgcolor: "action.hover" }}>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                Не хватает до цели
              </Typography>
              <Stack direction="row" spacing={3}>
                <Box>
                  <Typography variant="h6">
                    {roundNutrient(query.data.caloriesNeeded)} ккал
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="h6">
                    {roundNutrient(query.data.proteinsNeeded)} г белка
                  </Typography>
                </Box>
              </Stack>
            </Paper>

            {/* Список предложений */}
            {suggestions.length === 0 ? (
              <Alert severity="info">Цель достигнута — добор не нужен 🎉</Alert>
            ) : (
              <Stack spacing={1}>
                <Typography variant="subtitle2" color="text.secondary">
                  Выбери, чем добрать:
                </Typography>
                {suggestions.map((s) => (
                  <Paper key={s.ingredientId} variant="outlined" sx={{ p: 1 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={selectedIds.has(s.ingredientId)}
                          onChange={() => toggle(s.ingredientId)}
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {s.ingredientName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {roundNutrient(s.weightInGrams)} г ·{" "}
                            {roundNutrient(s.calories)} ккал · Б:{" "}
                            {roundNutrient(s.proteins)} г
                          </Typography>
                        </Box>
                      }
                      sx={{ width: "100%", m: 0 }}
                    />
                  </Paper>
                ))}
              </Stack>
            )}

            {/* Итог */}
            {selectedIds.size > 0 && (
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Выбрано: {selectedIds.size}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ~{roundNutrient(totals.calories)} ккал · ~
                  {roundNutrient(totals.proteins)} г белка
                </Typography>
              </Paper>
            )}
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>
          Отмена
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={selectedIds.size === 0 || submitting}
        >
          {submitting ? "Добавление..." : `Добавить (${selectedIds.size})`}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
