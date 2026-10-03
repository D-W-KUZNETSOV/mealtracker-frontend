import { useState } from 'react';
import { Box, Button, Stack, Typography, Alert, CircularProgress, Card, CardContent, Paper } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import DeleteIcon from '@mui/icons-material/Delete';
import ArchiveIcon from '@mui/icons-material/Archive';
import IconButton from '@mui/material/IconButton';
import Checkbox from '@mui/material/Checkbox';

import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ReplayIcon from '@mui/icons-material/Replay';
import { useRepeatShoppingList } from '../hooks/useShoppingLists';
import { useSnackbar } from 'notistack';


import {
  useShoppingLists,
  useToggleShoppingItem,
  useArchiveShoppingList,
  useDeleteShoppingList,
} from '../hooks/useShoppingLists';
import type { ApiError } from '../types/api';
import { roundNutrient } from '../types/api';
import GenerateShoppingListDialog from '../components/GenerateShoppingListDialog';

export default function ShoppingPage() {
  // 1. Хуки — все наверху
  const { enqueueSnackbar } = useSnackbar();
  const listsQuery = useShoppingLists();
  const toggleItem = useToggleShoppingItem();
  const archiveList = useArchiveShoppingList();
  const deleteList = useDeleteShoppingList();
  const repeatList = useRepeatShoppingList();

  // 2. Производные данные
  const allLists = listsQuery.data ?? [];
  const activeList = allLists.find((l) => l.status === 'ACTIVE') ?? null;
  const archivedLists = allLists.filter((l) => l.status === 'ARCHIVED');

  // 3. useState
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);

  // 3. JSX
  return (
    <Box>
      {/* Заголовок + кнопки */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', sm: 'center' },
          mb: 3,
        }}
      >
        <Typography variant="h4">Список покупок</Typography>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<PlaylistAddIcon />}
            onClick={() => setGenerateDialogOpen(true)}
          >
            Из плана
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} disabled>
            Вручную
          </Button>
        </Stack>
      </Stack>

      {/* Loading */}
      {listsQuery.isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Error */}
      {listsQuery.isError && (
        <Alert severity="error">
          Ошибка загрузки: {(listsQuery.error as unknown as ApiError)?.message}
        </Alert>
      )}

      {/* Пусто */}
      {!listsQuery.isLoading && !listsQuery.isError && !activeList && (
        <Alert severity="info">
          Пока нет активного списка покупок. Создайте его из плана меню.
        </Alert>
      )}

      {/* Активный список */}
      {activeList && (
        <Card>
          <CardContent>
            <Stack
              direction="row"
              sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}
            >
              <Box>
                <Typography variant="h6">
                  {activeList.name ?? 'Список покупок'}
                </Typography>
                {activeList.periodStart && activeList.periodEnd && (
                  <Typography variant="caption" color="text.secondary">
                    {activeList.periodStart} → {activeList.periodEnd}
                  </Typography>
                )}
              </Box>
              <Stack direction="row" spacing={0.5}>
                <IconButton
                  size="small"
                  title="В архив"
                  onClick={() => {
                    if (window.confirm('Отправить список в архив?')) {
                      archiveList.mutate(activeList.id);
                    }
                  }}
                  disabled={archiveList.isPending || deleteList.isPending}
                >
                  <ArchiveIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  color="error"
                  title="Удалить"
                  onClick={() => {
                    if (window.confirm('Удалить список покупок?')) {
                      deleteList.mutate(activeList.id);
                    }
                  }}
                  disabled={archiveList.isPending || deleteList.isPending}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Stack>
            </Stack>

            {/* Items */}
            {activeList.items.length === 0 ? (
              <Alert severity="info">Список пуст</Alert>
            ) : (
              <Stack spacing={1}>
                {activeList.items.map((item) => (
                  <Paper
                    key={item.id}
                    variant="outlined"
                    sx={{
                      p: 1.5,
                      opacity: item.isChecked ? 0.5 : 1,
                      transition: 'opacity 0.2s',
                    }}
                  >
                    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                      <Checkbox
                        checked={item.isChecked}
                        onChange={() =>
                          toggleItem.mutate({ listId: activeList.id, itemId: item.id })
                        }
                        disabled={toggleItem.isPending}
                      />
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography
                          variant="body1"
                          sx={{
                            textDecoration: item.isChecked ? 'line-through' : 'none',
                          }}
                        >
                          {item.ingredientName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {item.quantityGrams != null
                            ? `${roundNutrient(item.quantityGrams)} г`
                            : '—'}
                        </Typography>
                      </Box>
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            )}
          </CardContent>
        </Card>
      )}

      {/* Архив */}
      {archivedLists.length > 0 && (
        <Accordion sx={{ mt: 3 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">
              📦 Архив ({archivedLists.length})
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={1}>
              {archivedLists.map((list) => (
                <Paper key={list.id} variant="outlined" sx={{ p: 2 }}>
                  <Stack
                    direction="row"
                    sx={{
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: 1,
                    }}
                  >
                    <Box>
                      <Typography variant="subtitle1">
                        {list.name ?? 'Список покупок'}
                      </Typography>
                      {list.periodStart && list.periodEnd && (
                        <Typography variant="caption" color="text.secondary" component="div">
                          {list.periodStart} → {list.periodEnd}
                        </Typography>
                      )}
                      <Typography variant="caption" color="text.secondary">
                        {list.items.length} позиций
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={0.5}>
                      <IconButton
                        size="small"
                        title="Повторить"
                        onClick={() => {
                          if (window.confirm('Повторить этот список? Активный будет заархивирован.')) {
                            repeatList.mutate(list.id, {
                              onSuccess: () => enqueueSnackbar('Список повторён', { variant: 'success' }),
                              onError: () => enqueueSnackbar('Ошибка', { variant: 'error' }),
                            });
                          }
                        }}
                        disabled={repeatList.isPending}
                      >
                        <ReplayIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        title="Удалить"
                        onClick={() => {
                          if (window.confirm('Удалить архивный список?')) {
                            deleteList.mutate(list.id);
                          }
                        }}
                        disabled={deleteList.isPending}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          </AccordionDetails>
        </Accordion>
      )}

      {/* Диалог создания списка из плана */}
      <GenerateShoppingListDialog
        open={generateDialogOpen}
        onClose={() => setGenerateDialogOpen(false)}
      />
    </Box>
   );
 }