import { useEffect, useState } from "react"; // 👈 добавили useEffect
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  Paper,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Typography,
} from "@mui/material";

import { useSearchParams } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useSnackbar } from "notistack";
import { useTheme, useMediaQuery } from "@mui/material";
import IngredientDetailDialog from "../components/IngredientDetailDialog";

import {
  useBaseIngredients,
  useCreateIngredient,
  useDeleteIngredient,
  useMyIngredients,
  useUpdateIngredient,
} from "../hooks/useIngredients";
import type { ApiError, IngredientDto, IngredientRequest } from "../types/api";
import { roundNutrient } from "../types/api";
import IngredientFormDialog from "../components/IngredientFormDialog";
import ConfirmDialog from "../components/ConfirmDialog";

type TabKey = "my" | "base";

export default function IngredientsPage() {
  const [tab, setTab] = useState<TabKey>("my");
  const [formOpen, setFormOpen] = useState(false);
   // 🆕 Хук для чтения URL
    const [searchParams, setSearchParams] = useSearchParams();
    // 🆕 Состояние для хранения штрихкода, который прилетел из URL
    const [initialBarcode, setInitialBarcode] = useState<string | null>(null);
  const [editing, setEditing] = useState<IngredientDto | null>(null);
  const [deleting, setDeleting] = useState<IngredientDto | null>(null);
  const [selected, setSelected] = useState<IngredientDto | null>(null);



  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const myQuery = useMyIngredients();
  const baseQuery = useBaseIngredients();

  const createMutation = useCreateIngredient();
  const updateMutation = useUpdateIngredient();
  const deleteMutation = useDeleteIngredient();

  const isMyTab = tab === "my";
  const currentQuery = isMyTab ? myQuery : baseQuery;
  const items = currentQuery.data ?? [];

    // 🆕 Срабатывает при монтировании или изменении URL
     useEffect(() => {
       const barcodeFromUrl = searchParams.get("barcode");
       if (barcodeFromUrl) {
         setEditing(null);
         setInitialBarcode(barcodeFromUrl);
         setFormOpen(true);
         setSearchParams({}, { replace: true });
       }
       // eslint-disable-next-line react-hooks/exhaustive-deps
     }, []); // 👈 ПУСТОЙ МАССИВ

  // ---------- Открытие формы ----------
  const handleOpenCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (item: IngredientDto) => {
    setEditing(item);
    setFormOpen(true);
  };

  // ---------- Сохранение ----------
  const handleSubmit = async (data: IngredientRequest) => {
      // 🆕 Если есть штрихкод из URL (или формы), добавляем его в запрос
      const payload: IngredientRequest = {
        ...data,
        barcode: initialBarcode ?? data.barcode,
      };

      try {
        if (editing) {
          await updateMutation.mutateAsync({ id: editing.id, data: payload });
          enqueueSnackbar("Ингредиент обновлён", { variant: "success" });
        } else {
          await createMutation.mutateAsync(payload);
          enqueueSnackbar("Ингредиент создан", { variant: "success" });
        }
      setFormOpen(false);
      setEditing(null);
    } catch (err) {
      const apiError = err as ApiError;
      enqueueSnackbar(apiError.message || "Ошибка сохранения", {
        variant: "error",
      });
    }
  };

  // ---------- Удаление ----------
  const handleConfirmDelete = async () => {
    if (!deleting) return;
    try {
      await deleteMutation.mutateAsync(deleting.id);
      enqueueSnackbar("Ингредиент удалён", { variant: "success" });
      setDeleting(null);
    } catch (err) {
      const apiError = err as ApiError;
      enqueueSnackbar(apiError.message || "Ошибка удаления", {
        variant: "error",
      });
    }
  };

  return (
    <Box>
      <Stack
        direction="row"
        sx={{
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h4">Ингредиенты</Typography>
        {isMyTab && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenCreate}
          >
            Добавить
          </Button>
        )}
      </Stack>

      <Paper sx={{ mb: 2 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label="Мои ингредиенты" value="my" />
          <Tab label="Базовые" value="base" />
        </Tabs>
      </Paper>

      {currentQuery.isLoading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {currentQuery.isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Ошибка загрузки:{" "}
          {(currentQuery.error as unknown as ApiError)?.message}
        </Alert>
      )}

      {!currentQuery.isLoading &&
        !currentQuery.isError &&
        items.length === 0 && (
          <Alert severity="info">
            {isMyTab
              ? "У вас пока нет ингредиентов. Нажмите «Добавить», чтобы создать первый."
              : "Базовые ингредиенты недоступны."}
          </Alert>
        )}

      {!currentQuery.isLoading && items.length > 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Название</TableCell>
                <TableCell align="right">Ккал</TableCell>
                {!isMobile && <TableCell align="right">Б</TableCell>}
                {!isMobile && <TableCell align="right">Ж</TableCell>}
                {!isMobile && <TableCell align="right">У</TableCell>}
                {isMyTab && !isMobile && (
                  <TableCell align="right">Действия</TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item) => (
                <TableRow
                  key={item.id}
                  hover
                  onClick={() => setSelected(item)}
                  sx={{ cursor: "pointer" }}
                >
                  <TableCell>{item.name}</TableCell>
                  <TableCell align="right">
                    {item.caloriesPer100g != null
                      ? `${roundNutrient(item.caloriesPer100g)}`
                      : "—"}
                  </TableCell>
                  {!isMobile && (
                    <TableCell align="right">
                      {roundNutrient(item.proteinsPer100g)}
                    </TableCell>
                  )}
                  {!isMobile && (
                    <TableCell align="right">
                      {roundNutrient(item.fatsPer100g)}
                    </TableCell>
                  )}
                  {!isMobile && (
                    <TableCell align="right">
                      {roundNutrient(item.carbsPer100g)}
                    </TableCell>
                  )}
                  {isMyTab && !isMobile && (
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation(); // ⚠️ чтобы не открывалась модалка
                          handleOpenEdit(item);
                        }}
                        title="Редактировать"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={(e) => {
                          e.stopPropagation(); // ⚠️
                          setDeleting(item);
                        }}
                        title="Удалить"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

            {/* Модалка создания/редактирования */}
            <IngredientFormDialog
              open={formOpen}
              ingredient={editing}
              initialBarcode={initialBarcode} // 🆕 Передаем штрихкод из URL
              loading={createMutation.isPending || updateMutation.isPending}
              onSubmit={handleSubmit}
              onClose={() => {
                setFormOpen(false);
                setEditing(null);
                setInitialBarcode(null); // 🆕 Очищаем при закрытии
              }}
            />

      {/* Подтверждение удаления */}
      <ConfirmDialog
        open={!!deleting}
        title="Удалить ингредиент?"
        message={`Ингредиент «${deleting?.name}» будет удалён безвозвратно.`}
        confirmLabel="Удалить"
        loading={deleteMutation.isPending}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleting(null)}
      />
      {selected && (
        <IngredientDetailDialog
          open={!!selected}
          ingredient={selected}
          onClose={() => setSelected(null)}
          onEdit={
            isMyTab
              ? () => {
                  setSelected(null);
                  handleOpenEdit(selected);
                }
              : undefined
          }
          onDelete={
            isMyTab
              ? () => {
                  setSelected(null);
                  setDeleting(selected);
                }
              : undefined
          }
        />
      )}
    </Box>
  );
}
