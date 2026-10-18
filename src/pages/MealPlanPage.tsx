import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  IconButton,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import AddIcon from "@mui/icons-material/Add";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import { useSnackbar } from "notistack";

import AddMealPlanItemDialog from "../components/AddMealPlanItemDialog";
import CreateMealPlanDialog from "../components/CreateMealPlanDialog";
import GenerateShoppingListDialog from "../components/GenerateShoppingListDialog";
import ReplaceMealPlanItemDialog from "../components/ReplaceMealPlanItemDialog";

import {
  useMealPlans,
  useDeleteMealPlanItem,
  useDeleteMealPlan,
} from "../hooks/useMealPlans";
import type { ApiError, MealPlanItemDto, MealType } from "../types/api";
type ViewMode = "week" | "day";

// Утилиты дат
function toApiDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function getMondayOfWeek(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay(); // 0 = Sunday, 1 = Monday
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  return date;
}

function addDays(d: Date, days: number): Date {
  const date = new Date(d);
  date.setDate(date.getDate() + days);
  return date;
}

const MEAL_TYPES: {
  value: "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK";
  label: string;
  emoji: string;
}[] = [
  { value: "BREAKFAST", label: "Завтрак", emoji: "☕" },
  { value: "LUNCH", label: "Обед", emoji: "🍲" },
  { value: "DINNER", label: "Ужин", emoji: "🍽️" },
  { value: "SNACK", label: "Перекус", emoji: "🥪" },
];

const DAY_LABELS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

export default function MealPlanPage() {
  const plansQuery = useMealPlans();
  const activePlan = useMemo(() => {
    const plans = plansQuery.data ?? [];
    if (plans.length === 0) return null;
    return plans.reduce((max, p) => (p.id > max.id ? p : max));
  }, [plansQuery.data]);
  const deletePlan = useDeleteMealPlan();

  const { enqueueSnackbar } = useSnackbar();
  const deleteItem = useDeleteMealPlanItem();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // < 600px

  const [view, setView] = useState<ViewMode>(isMobile ? "day" : "week");
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogDate, setDialogDate] = useState<string>("");
  const [dialogMealType, setDialogMealType] = useState<MealType>("BREAKFAST");
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [createPlanDialogOpen, setCreatePlanDialogOpen] = useState(false);

  const [menuAnchor, setMenuAnchor] = useState<{
    el: HTMLElement;
    item: MealPlanItemDto;
  } | null>(null);
  const [replaceItem, setReplaceItem] = useState<MealPlanItemDto | null>(null);

  // Начало периода (недели или дня)
  const periodStart = useMemo(() => {
    return view === "week" ? getMondayOfWeek(currentDate) : currentDate;
  }, [view, currentDate]);

  // Дни для отображения
  const days = useMemo(() => {
    const count = view === "week" ? 7 : 1;
    return Array.from({ length: count }, (_, i) => addDays(periodStart, i));
  }, [view, periodStart]);
  const getItemsForSlot = (date: Date, mealType: string) => {
    if (!activePlan?.items) return [];
    const apiDate = toApiDate(date);
    return activePlan.items.filter(
      (item) => item.planDate === apiDate && item.mealType === mealType,
    );
  };

  // Заголовок
  const periodTitle = useMemo(() => {
    if (view === "day") {
      return periodStart.toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    }
    const end = addDays(periodStart, 6);
    const startStr = periodStart.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "short",
    });
    const endStr = end.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "short",
    });
    return `${startStr} — ${endStr}`;
  }, [view, periodStart]);

  const handlePrev = () => {
    setCurrentDate(addDays(currentDate, view === "week" ? -7 : -1));
  };

  const handleNext = () => {
    setCurrentDate(addDays(currentDate, view === "week" ? 7 : 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <Box>
      {/* Заголовок + кнопки */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{
          justifyContent: "space-between",
          alignItems: { xs: "stretch", sm: "center" },
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h4">План меню</Typography>
          {activePlan && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {activePlan.name ?? "Без названия"} ·{" "}
              {new Date(activePlan.startDate).toLocaleDateString("ru-RU", {
                day: "numeric",
                month: "short",
              })}{" "}
              —{" "}
              {new Date(activePlan.endDate).toLocaleDateString("ru-RU", {
                day: "numeric",
                month: "short",
              })}
            </Typography>
          )}
        </Box>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<PlaylistAddIcon />}
            onClick={() => setGenerateDialogOpen(true)}
            disabled={!activePlan}
          >
            Создать список
          </Button>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => setCreatePlanDialogOpen(true)}
          >
            Создать план
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteOutlineIcon />}
            onClick={() => {
              if (!activePlan) return;
              const startStr = new Date(
                activePlan.startDate,
              ).toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
              const endStr = new Date(activePlan.endDate).toLocaleDateString(
                "ru-RU",
                { day: "numeric", month: "short" },
              );
              if (
                window.confirm(
                  `Удалить план "${activePlan.name ?? "без названия"}" (${startStr} — ${endStr})?`,
                )
              ) {
                deletePlan.mutate(activePlan.id, {
                  onSuccess: () =>
                    enqueueSnackbar("План удалён", { variant: "success" }),
                  onError: () =>
                    enqueueSnackbar("Ошибка удаления", { variant: "error" }),
                });
              }
            }}
            disabled={!activePlan || deletePlan.isPending}
          >
            {deletePlan.isPending ? "Удаление..." : "Удалить план"}
          </Button>
        </Stack>
      </Stack>

      {/* Loading */}
      {plansQuery.isLoading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Error */}
      {plansQuery.isError && (
        <Alert severity="error">
          Ошибка загрузки: {(plansQuery.error as unknown as ApiError)?.message}
        </Alert>
      )}

      {/* Нет плана */}
      {!plansQuery.isLoading && !plansQuery.isError && !activePlan && (
        <Alert severity="info">
          Пока нет плана меню. Создайте его — и сможете планировать приёмы на
          неделю.
        </Alert>
      )}

      {/* Есть план — показать переключатель + сетку */}
      {activePlan && (
        <>
          {/* Панель: переключатель + навигация */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            sx={{
              mb: 3,
              alignItems: { xs: "stretch", sm: "center" },
              justifyContent: "space-between",
            }}
          >
            {!isMobile && (
              <ToggleButtonGroup
                value={view}
                exclusive
                onChange={(_, v) => v && setView(v)}
                size="small"
              >
                <ToggleButton value="week">Неделя</ToggleButton>
                <ToggleButton value="day">День</ToggleButton>
              </ToggleButtonGroup>
            )}

            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
              <IconButton onClick={handlePrev} title="Назад">
                <ChevronLeftIcon />
              </IconButton>
              <Typography
                variant="h6"
                sx={{ minWidth: 200, textAlign: "center" }}
              >
                {periodTitle}
              </Typography>
              <IconButton onClick={handleNext} title="Вперёд">
                <ChevronRightIcon />
              </IconButton>
              <Button size="small" onClick={handleToday} sx={{ ml: 1 }}>
                Сегодня
              </Button>
            </Stack>
          </Stack>

          {/* Сетка дней × приёмов */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns:
                view === "week" ? "repeat(7, minmax(0, 1fr))" : "1fr",
              gap: 1,
            }}
          >
            {days.map((day) => (
              <Box key={toApiDate(day)}>
                {/* Заголовок дня */}
                <Box
                  sx={{
                    p: 1,
                    bgcolor: "primary.main",
                    color: "primary.contrastText",
                    borderRadius: 1,
                    mb: 1,
                    textAlign: "center",
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {view === "week"
                      ? DAY_LABELS[(day.getDay() + 6) % 7]
                      : day.toLocaleDateString("ru-RU", { weekday: "long" })}
                  </Typography>
                  <Typography variant="caption">
                    {day.toLocaleDateString("ru-RU", {
                      day: "numeric",
                      month: "short",
                    })}
                  </Typography>
                </Box>

                {/* Слоты */}
                <Stack spacing={1}>
                  {MEAL_TYPES.map((mt) => {
                    const slotItems = getItemsForSlot(day, mt.value);
                    return (
                      <Box
                        key={mt.value}
                        onClick={() => {
                          setDialogDate(toApiDate(day));
                          setDialogMealType(mt.value);
                          setDialogOpen(true);
                        }}
                        sx={{
                          p: 1,
                          border: "1px dashed",
                          borderColor: "divider",
                          borderRadius: 1,
                          minHeight: 60,
                          bgcolor: "action.hover",
                          cursor: "pointer",
                          "&:hover": { bgcolor: "action.selected" },
                        }}
                      >
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          noWrap
                          sx={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            display: "block",
                            mb: slotItems.length > 0 ? 0.5 : 0,
                          }}
                        >
                          {mt.emoji} {mt.label}
                        </Typography>

                        {slotItems.map((item) => (
                          <Box
                            key={item.id}
                            onClick={(e) => e.stopPropagation()}
                            sx={{
                              mt: 0.5,
                              p: 0.5,
                              bgcolor: "primary.main",
                              color: "primary.contrastText",
                              borderRadius: 0.5,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              gap: 0.5,
                            }}
                          >
                            <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                              <Typography
                                variant="caption"
                                noWrap
                                sx={{
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  display: "block",
                                  fontWeight: 500,
                                }}
                              >
                                {item.recipeName ||
                                  item.ingredientName ||
                                  item.customName ||
                                  "—"}
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{ opacity: 0.8, fontSize: "0.65rem" }}
                              >
                                {item.servings != null
                                  ? `${item.servings} порц.`
                                  : item.weightInGrams != null
                                    ? `${item.weightInGrams} г`
                                    : ""}
                              </Typography>
                              {/* 🆕 Калории и белок */}
                              {item.calories != null && (
                                <Typography
                                  variant="caption"
                                  sx={{
                                    display: "block",
                                    fontWeight: 600,
                                    fontSize: "0.65rem",
                                    mt: 0.5,
                                    whiteSpace: "nowrap", // зачем: чтобы не переносилось на новую строку
                                  }}
                                >
                                  {Math.round(item.calories)} ккал
                                  {item.proteins != null &&
                                    ` · Б ${Math.round(item.proteins)}`}
                                </Typography>
                              )}
                            </Box>
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                setMenuAnchor({ el: e.currentTarget, item });
                              }}
                              sx={{
                                color: "inherit",
                                p: 0.25,
                                "&:hover": { bgcolor: "rgba(255,255,255,0.2)" },
                              }}
                            >
                              <MoreVertIcon sx={{ fontSize: "1rem" }} />
                            </IconButton>
                          </Box>
                        ))}
                      </Box>
                    );
                  })}
                </Stack>
              </Box>
            ))}
          </Box>
        </>
      )}
      {activePlan && (
        <AddMealPlanItemDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          planId={activePlan.id}
          planDate={dialogDate}
          mealType={dialogMealType}
        />
      )}
      {/* Диалог создания списка покупок из плана */}
      <GenerateShoppingListDialog
        open={generateDialogOpen}
        onClose={() => setGenerateDialogOpen(false)}
      />
      <CreateMealPlanDialog
        open={createPlanDialogOpen}
        onClose={() => setCreatePlanDialogOpen(false)}
      />
      <Menu
        anchorEl={menuAnchor?.el}
        open={!!menuAnchor}
        onClose={() => setMenuAnchor(null)}
      >
        <MenuItem
          onClick={() => {
            if (menuAnchor) {
              setReplaceItem(menuAnchor.item);
              setMenuAnchor(null);
            }
          }}
        >
          <SwapHorizIcon fontSize="small" sx={{ mr: 1 }} />
          Заменить
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (
              menuAnchor &&
              activePlan &&
              window.confirm("Удалить приём из плана?")
            ) {
              deleteItem.mutate(
                { planId: activePlan.id, itemId: menuAnchor.item.id },
                {
                  onSuccess: () =>
                    enqueueSnackbar("Приём удалён", { variant: "success" }),
                  onError: () =>
                    enqueueSnackbar("Ошибка удаления", { variant: "error" }),
                },
              );
            }
            setMenuAnchor(null);
          }}
          sx={{ color: "error.main" }}
        >
          <CloseIcon fontSize="small" sx={{ mr: 1 }} />
          Удалить
        </MenuItem>
      </Menu>

      {replaceItem && activePlan && (
        <ReplaceMealPlanItemDialog
          open={!!replaceItem}
          onClose={() => setReplaceItem(null)}
          planId={activePlan.id}
          item={replaceItem}
        />
      )}
    </Box>
  );
}
