import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
  MenuItem,
  Alert,
} from "@mui/material";

import type { IngredientDto, IngredientRequest, UnitType } from "../types/api";
import {
  calcCaloriesFromMacros,
  roundNutrient,
  INGREDIENT_CATEGORIES,
} from "../types/api";
import { isValidNumberInput, normalizeNumberInput } from "../utils/numberInput";

// ============================================================
// Схема валидации формы ингредиента.
// ============================================================
const numberString = (min: number, max: number, required = false) =>
  z.string().refine(
    (val) => {
      if (val === "" || val == null) return !required;
      const n = Number(val.replace(",", "."));
      return !Number.isNaN(n) && n >= min && n <= max;
    },
    { message: `Введите число от ${min} до ${max}` },
  );

const ingredientSchema = z.object({
  name: z.string().min(1, "Введите название").max(100, "Максимум 100 символов"),
  category: z.string().optional(),
  proteinsPer100g: numberString(0, 100, true),
  fatsPer100g: numberString(0, 100, true),
  carbsPer100g: numberString(0, 100, true),
  caloriesPer100g: numberString(0, 1000, false),
  unitType: z.string().optional(),
  unitWeightGrams: z.string().optional(),
  gramsPerTbsp: z.string().optional(),
  gramsPerTsp: z.string().optional(),
});

type IngredientForm = z.infer<typeof ingredientSchema>;

interface IngredientFormDialogProps {
  open: boolean;
  ingredient?: IngredientDto | null;
  initialName?: string;
  initialBarcode?: string | null;
  loading?: boolean;
  onSubmit: (data: IngredientRequest) => void;
  onClose: () => void;
}


// ============================================================
// Модалка создания / редактирования ингредиента.
// ============================================================
export default function IngredientFormDialog({
  open,
  ingredient,
  initialName,
  initialBarcode,
  loading = false,
  onSubmit,
  onClose,
}: IngredientFormDialogProps) {
  const isEdit = !!ingredient;

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<IngredientForm>({
    resolver: zodResolver(ingredientSchema),
    defaultValues: {
      name: "",
      category: "OTHER",
      proteinsPer100g: "",
      fatsPer100g: "",
      carbsPer100g: "",
      caloriesPer100g: "",
      unitType: "GRAM",
      unitWeightGrams: "",
      gramsPerTbsp: "",
      gramsPerTsp: "",
    },
  });

  // При открытии с ингредиентом — заполняем форму, иначе сбрасываем
  useEffect(() => {
    if (open) {
      if (ingredient) {
        reset({
          name: ingredient.name,
          category: ingredient.category ?? "OTHER",
          proteinsPer100g: String(ingredient.proteinsPer100g ?? ""),
          fatsPer100g: String(ingredient.fatsPer100g ?? ""),
          carbsPer100g: String(ingredient.carbsPer100g ?? ""),
          caloriesPer100g:
            ingredient.caloriesPer100g != null
              ? String(ingredient.caloriesPer100g)
              : "",
          unitType: ingredient.unitType ?? "GRAM",
          unitWeightGrams:
            ingredient.unitWeightGrams != null
              ? String(ingredient.unitWeightGrams)
              : "",
          gramsPerTbsp:
            ingredient.gramsPerTbsp != null
              ? String(ingredient.gramsPerTbsp)
              : "",
          gramsPerTsp:
            ingredient.gramsPerTsp != null
              ? String(ingredient.gramsPerTsp)
              : "",
        });
      } else {
        reset({
          name: initialName ?? "",
          category: "OTHER",
          proteinsPer100g: "",
          fatsPer100g: "",
          carbsPer100g: "",
          caloriesPer100g: "",
          unitType: "GRAM",
          unitWeightGrams: "",
          gramsPerTbsp: "",
          gramsPerTsp: "",
        });
      }
    }
  }, [open, ingredient, initialName, reset]);

  // Живой предпросмотр калорий
  const [p, f, c, cal] = watch([
    "proteinsPer100g",
    "fatsPer100g",
    "carbsPer100g",
    "caloriesPer100g",
  ]);

  const parseNum = (v: unknown): number => {
    if (v == null || v === "") return 0;
    const n = Number(String(v).replace(",", "."));
    return Number.isNaN(n) ? 0 : n;
  };

  const pNum = parseNum(p);
  const fNum = parseNum(f);
  const cNum = parseNum(c);
  const calNum = parseNum(cal);

  const previewCalories =
    calNum > 0 ? calNum : calcCaloriesFromMacros(pNum, fNum, cNum);

  const handleFormSubmit = (data: IngredientForm) => {
    const toNum = (v: string): number => Number(v.replace(",", ".")) || 0;

    const calStr = data.caloriesPer100g ?? "";
    const calParsed = calStr === "" ? null : Number(calStr.replace(",", "."));

    onSubmit({
      name: data.name.trim(),
      category: data.category,
      proteinsPer100g: toNum(data.proteinsPer100g),
      fatsPer100g: toNum(data.fatsPer100g),
      carbsPer100g: toNum(data.carbsPer100g),
      caloriesPer100g:
        calParsed != null && !Number.isNaN(calParsed) ? calParsed : null,
      unitType: (data.unitType as UnitType) || "GRAM",
      unitWeightGrams: data.unitWeightGrams
        ? Number(data.unitWeightGrams.replace(",", "."))
        : null,
      gramsPerTbsp: data.gramsPerTbsp
        ? Number(data.gramsPerTbsp.replace(",", "."))
        : null,
      gramsPerTsp: data.gramsPerTsp
        ? Number(data.gramsPerTsp.replace(",", "."))
        : null,
         barcode: initialBarcode ?? ingredient?.barcode ?? null,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogTitle>
          {isEdit ? "Редактировать ингредиент" : "Новый ингредиент"}
        </DialogTitle>
        <DialogContent>
                    {initialBarcode && !ingredient && (
                      <Alert severity="info" sx={{ mb: 2 }}>
                        Штрихкод: <strong>{initialBarcode}</strong> (будет сохранён)
                      </Alert>
                    )}
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Название"
              fullWidth
              autoFocus
              {...register("name")}
              error={!!errors.name}
              helperText={errors.name?.message}
            />

            <Controller
              name="category"
              control={control}
              render={({ field }) => (
                <TextField
                  select
                  label="Категория"
                  fullWidth
                  value={field.value ?? "OTHER"}
                  onChange={(e) => field.onChange(e.target.value)}
                >
                  {Object.entries(INGREDIENT_CATEGORIES).map(
                    ([value, { label, emoji }]) => (
                      <MenuItem key={value} value={value}>
                        {emoji} {label}
                      </MenuItem>
                    ),
                  )}
                </TextField>
              )}
            />

            {/* Ряд БЖУ */}
            <Stack direction="row" spacing={2}>
              <Controller
                name="proteinsPer100g"
                control={control}
                render={({ field }) => (
                  <TextField
                    label="Б"
                    type="text"
                    fullWidth
                    value={field.value ?? ""}
                    onChange={(e) => {
                      const raw = e.target.value;
                      if (isValidNumberInput(raw)) {
                        field.onChange(normalizeNumberInput(raw));
                      }
                    }}
                    onFocus={(e) => e.target.select()}
                    placeholder="0"
                    slotProps={{ htmlInput: { inputMode: "decimal" } }}
                    error={!!errors.proteinsPer100g}
                    helperText={errors.proteinsPer100g?.message}
                  />
                )}
              />

              <Controller
                name="fatsPer100g"
                control={control}
                render={({ field }) => (
                  <TextField
                    label="Ж"
                    type="text"
                    fullWidth
                    value={field.value ?? ""}
                    onChange={(e) => {
                      const raw = e.target.value;
                      if (isValidNumberInput(raw)) {
                        field.onChange(normalizeNumberInput(raw));
                      }
                    }}
                    onFocus={(e) => e.target.select()}
                    placeholder="0"
                    slotProps={{ htmlInput: { inputMode: "decimal" } }}
                    error={!!errors.fatsPer100g}
                    helperText={errors.fatsPer100g?.message}
                  />
                )}
              />

              <Controller
                name="carbsPer100g"
                control={control}
                render={({ field }) => (
                  <TextField
                    label="У"
                    type="text"
                    fullWidth
                    value={field.value ?? ""}
                    onChange={(e) => {
                      const raw = e.target.value;
                      if (isValidNumberInput(raw)) {
                        field.onChange(normalizeNumberInput(raw));
                      }
                    }}
                    onFocus={(e) => e.target.select()}
                    placeholder="0"
                    slotProps={{ htmlInput: { inputMode: "decimal" } }}
                    error={!!errors.carbsPer100g}
                    helperText={errors.carbsPer100g?.message}
                  />
                )}
              />
            </Stack>

            {/* Калории (на всю ширину) */}
            <Controller
              name="caloriesPer100g"
              control={control}
              render={({ field }) => (
                <TextField
                  label="Ккал"
                  type="text"
                  fullWidth
                  value={field.value ?? ""}
                  onChange={(e) => {
                    const raw = e.target.value;
                    if (isValidNumberInput(raw)) {
                      field.onChange(normalizeNumberInput(raw));
                    }
                  }}
                  onFocus={(e) => e.target.select()}
                  placeholder="0"
                  slotProps={{ htmlInput: { inputMode: "decimal" } }}
                  error={!!errors.caloriesPer100g}
                  helperText={errors.caloriesPer100g?.message}
                />
              )}
            />

            {/* Плашка с подсказкой */}
            <Alert severity="info" sx={{ mt: -1 }}>
              Если поле «Ккал» пустое — калорийность посчитается автоматически
              из БЖУ.
            </Alert>

            {/* Серый блок с калориями */}
            <Box
              sx={{
                p: 2,
                bgcolor: "action.hover",
                borderRadius: 1,
                textAlign: "center",
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Калорийность (на 100 г)
              </Typography>
              <Typography variant="h5" color="primary.main">
                {roundNutrient(previewCalories)} ккал
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {calNum > 0 ? "Указано вручную" : "Считается автоматически..."}
              </Typography>
            </Box>

            {/* ============ Единицы измерения ============ */}
            <Typography
              variant="subtitle2"
              color="text.secondary"
              sx={{ mt: 1, mb: 1 }}
            >
              Единицы измерения (необязательно)
            </Typography>

            <Controller
              name="unitType"
              control={control}
              render={({ field }) => (
                <TextField
                  select
                  label="Основная единица"
                  fullWidth
                  sx={{ mb: 1 }}
                  value={field.value ?? "GRAM"}
                  onChange={(e) => field.onChange(e.target.value)}
                >
                  <MenuItem value="GRAM">Граммы (г)</MenuItem>
                  <MenuItem value="ML">Миллилитры (мл)</MenuItem>
                  <MenuItem value="PIECE">Штуки (шт)</MenuItem>
                  <MenuItem value="TBSP">Столовые ложки (ст.л.)</MenuItem>
                  <MenuItem value="TSP">Чайные ложки (ч.л.)</MenuItem>
                  <MenuItem value="CUP">Стаканы</MenuItem>
                </TextField>
              )}
            />

            {/* Вес 1 штуки (показываем, если выбраны штуки) */}
            {watch("unitType") === "PIECE" && (
              <Controller
                name="unitWeightGrams"
                control={control}
                render={({ field }) => (
                  <TextField
                    label="Вес 1 штуки, г"
                    type="text"
                    fullWidth
                    value={field.value ?? ""}
                    onChange={(e) => {
                      const raw = e.target.value;
                      if (isValidNumberInput(raw)) {
                        field.onChange(normalizeNumberInput(raw));
                      }
                    }}
                    placeholder="Например, 50"
                    slotProps={{ htmlInput: { inputMode: "decimal" } }}
                  />
                )}
              />
            )}

            {/* Коэффициенты для ложек (показываем только если выбраны ложки) */}
            {(watch("unitType") === "TBSP" || watch("unitType") === "TSP") && (
              <Stack spacing={2}>
                <Alert severity="info" variant="outlined" sx={{ py: 0 }}>
                  Укажи, сколько грамм в 1 ложке. Например, 1 ст.л. сахара = 25
                  г. Это нужно, чтобы при добавлении в рецепт было удобно
                  считать.
                </Alert>
                <Stack direction="row" spacing={3}>
                  <Controller
                    name="gramsPerTbsp"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        label="1 ст.л., г"
                        type="text"
                        fullWidth
                        value={field.value ?? ""}
                        onChange={(e) => {
                          const raw = e.target.value;
                          if (isValidNumberInput(raw)) {
                            field.onChange(normalizeNumberInput(raw));
                          }
                        }}
                        placeholder="Например, 25"
                        slotProps={{ htmlInput: { inputMode: "decimal" } }}
                      />
                    )}
                  />
                  <Controller
                    name="gramsPerTsp"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        label="1 ч.л., г"
                        type="text"
                        fullWidth
                        value={field.value ?? ""}
                        onChange={(e) => {
                          const raw = e.target.value;
                          if (isValidNumberInput(raw)) {
                            field.onChange(normalizeNumberInput(raw));
                          }
                        }}
                        placeholder="Например, 8"
                        slotProps={{ htmlInput: { inputMode: "decimal" } }}
                      />
                    )}
                  />
                </Stack>
              </Stack>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Отмена
          </Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? "Сохранение..." : isEdit ? "Сохранить" : "Создать"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
