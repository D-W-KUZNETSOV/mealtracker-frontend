// ============================================================
// Типы DTO, соответствующие Java-классам бэкенда MealTracker.
// Один-в-один с полями из JSON, которые отдаёт Spring Boot.
// ============================================================

// ---------- Auth ----------

export interface AuthResponse {
  token: string;
  type: string;
  username: string;
  expiresIn: number;
}

export interface UserResponse {
  id: number;
  username: string;
  email: string;
  role: string;
 avatarUrl: string | null;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  email: string;
  dateOfBirth?: string;  // 🆕 опционально — заполняется позже в профиле
}
export interface DeleteAccountRequest {
  password: string;   // 🆕 подтверждение паролем
}
export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}
// ---------- Feedback ----------

export interface FeedbackRequest {
  message: string;
  contactEmail?: string;
}

// ---------- Единый формат ошибок ----------

export interface ApiError {
  timestamp: string;
  status: number;
  error: string;
  code: string;
  message: string;
  path: string;
}

// ---------- Утилиты ----------

/** Расчёт калорий по БЖУ (та же формула, что на бэке) */
export function calcCaloriesFromMacros(
  proteins: number,
  fats: number,
  carbs: number,
): number {
  return 4 * proteins + 9 * fats + 4 * carbs;
}

/** Округление нутриента до 1 знака для отображения */
export function roundNutrient(value: number): number {
  return Math.round(value * 10) / 10;
}

// ---------- Ingredients ----------

export interface IngredientDto {
  id: number;
  name: string;
  caloriesPer100g: number | null;   // ← было number
  proteinsPer100g: number;
  fatsPer100g: number;
  carbsPer100g: number;
  unitType: UnitType;
  unitWeightGrams: number | null;
  category?: string;
}

export interface IngredientRequest {
  name: string;
  proteinsPer100g: number;
  fatsPer100g: number;
  carbsPer100g: number;
  caloriesPer100g?: number | null;   // ← добавить
  unitType?: UnitType;
  unitWeightGrams?: number | null;
}

// ---------- Recipes ----------

/** Краткая карточка рецепта для списков */
export interface RecipeListItemDto {
  id: number;
  name: string;
  category: string | null;
  totalCalories: number | null;
  totalProteins: number | null;
  totalFats: number | null;
  totalCarbs: number | null;
   totalWeight: number;
   servings: number;              // 🆕
     servingSizeGrams: number;      // 🆕
  visibility: 'PUBLIC' | 'PRIVATE';
}

/** Ингредиент внутри полного рецепта */
export interface RecipeIngredientDto {
  ingredientId: number;
  ingredientName: string;
  weightInGrams: number;
  calories: number;
  proteins: number;
  fats: number;
  carbs: number;
}

/** Полный рецепт (POST-ответ, PATCH-ответ) */
export interface RecipeDto {
  id: number;
  name: string;
  category: string | null;
  description: string | null;
  imageUrl: string | null;
  ingredients: RecipeIngredientDto[];
  totalCalories: number | null;
  totalProteins: number | null;
  totalFats: number | null;
  totalCarbs: number | null;
   totalWeight: number;
   servings: number;              // 🆕
     servingSizeGrams: number;      // 🆕
     steps: string[] | null;
  visibility: 'PUBLIC' | 'PRIVATE';
}

/** Тело запроса на создание рецепта */
export interface RecipeRequest {
  name: string;
  category?: string;
  description?: string;
  imageUrl?: string;
  visibility: 'PUBLIC' | 'PRIVATE';
    servings?: number;             // 🆕
  ingredients: RecipeIngredientInput[];
  steps?: string[];
}

export interface RecipeIngredientInput {
  ingredientId: number;
  weightInGrams: number;
}

/** Детальная карточка (GET /api/recipes/{id}/summary) */
export interface RecipeSummaryIngredientDto {
  ingredientId: number;         // 🆕
  name: string;
  caloriesPer100g: number;
  proteinsPer100g: number;
  fatsPer100g: number;
  carbsPer100g: number;
  quantityGrams: number;
  itemCalories: number;
}

export interface RecipeSummaryDto {
  id: number;
  name: string;
  category: string | null;
  description: string | null;
  imageUrl: string | null;
  visibility: 'PUBLIC' | 'PRIVATE';
  ingredients: RecipeSummaryIngredientDto[];
  totalCalories: number;
  totalProteins: number;
  totalFats: number;
  totalCarbs: number;
  totalWeight: number;
  servings: number;
  servingSizeGrams: number;
  steps: string[] | null;

    // 🆕 F5
    isMine: boolean;
    authorUsername: string;
    alreadyCopied: boolean;       // 🆕
    copiedRecipeId: number | null; // 🆕
  }

/** Статистика (GET /api/recipes/{recipeId}/stats) */
export interface RecipeStatsIngredientDto {
  ingredientName: string;
  weightInGrams: number;
  calories: number;
  proteins: number;
  fats: number;
  carbs: number;
}

export interface RecipeStatsDto {
  recipeName: string;
  ingredientsStats: RecipeStatsIngredientDto[];
  totalCalories: number;
  totalProteins: number;
  totalFats: number;
  totalCarbs: number;
}

/** Spring Data Page<T> */
export interface Page<T> {
  content: T[];
  empty: boolean;
  first: boolean;
  last: boolean;
  number: number;
  numberOfElements: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

// ---------- Stats (дневник) ----------

/** Сводка за день (GET /api/stats/daily, POST /api/stats/daily/add) */
export interface FoodEntryDto {
  id: number;
  itemName: string;         // универсальное — рецепт или ингредиент
    ingredientId: number | null;  // 🆕
  weightInGrams: number;
  calories: number;
  proteins: number;
  fats: number;
  carbs: number;
   servings: number;              // 🆕
}

export interface DailyStatsDto {
  calories: number;
  proteins: number;
  fats: number;
  carbs: number;
  targetCalories: number | null;
  caloriesProgressPercent: number | null;
  targetProtein: number | null;
  proteinProgressPercent: number | null;
  entries: FoodEntryDto[];
}

/** Тело запроса на добавление порции */
export interface AddPortionRequest {
  recipeId?: number | null;       // либо рецепт
  ingredientId?: number | null;   // либо ингредиент (ровно одно)
  weightInGrams: number;
}
/** Календарь активности (GET /api/stats/calendar) */
export interface CalendarResponse {
  month: string;           // "2026-10"
  days: string[];          // ["2026-10-09", ...]
  totalDays: number;
  currentStreak: number;
  bestStreak: number;
}

// ---------- Общие enum'ы ----------

export type ActivityLevel =
  | 'SEDENTARY'
  | 'LIGHT'
  | 'MODERATE'
  | 'HIGH'
  | 'VERY_HIGH';

  export type UnitType = 'GRAM' | 'ML' | 'PIECE' | 'TBSP' | 'TSP' | 'CUP';
  export type MealType =
    | 'BREAKFAST'
    | 'LUNCH'
    | 'DINNER'
    | 'SNACK'
    | 'DESSERT'
    | 'DRINK';

export type Gender = 'MALE' | 'FEMALE';



// ---------- Nutrition (цели) ----------

export type GoalType = 'LOSE_WEIGHT' | 'MAINTAIN' | 'GAIN_MUSCLE';

export interface UserGoalsDto {
  id: number;
  currentWeightKg: number;
  proteinPerKg: number;
  targetCalories: number;
  goalType: GoalType;                    // ← новое
  targetProteinOverride: number | null;  // ← новое
  targetCaloriesOverride: number | null; // ← новое
  createdAt: string;
}

export interface GoalsRequest {
  currentWeightKg: number;
  proteinPerKg: number;
  targetCalories: number;
  goalType: GoalType;                    // ← новое
  targetProteinOverride: number | null;  // ← новое
  targetCaloriesOverride: number | null; // ← новое
}

export interface TargetProteinDto {
  weightKg: number;
  targetProteinGramsPerDay: number;
}

// ---------- Profile ----------

export interface UserProfileDto {
    avatarUrl: string | null;
    email: string | null;   // 🆕
  ageYears: number;
  heightCm: number;
  currentWeightKg: number;
  targetWeightKg: number;
  gender: Gender;
  activityLevel: ActivityLevel;
  bmi: number;
}

export interface ProfileUpdateRequest {
    avatarUrl?: string;
     email?: string;   // 🆕
  dateOfBirth?: string;
  heightCm?: number;
  currentWeightKg?: number;
  targetWeightKg?: number;
  gender?: Gender;
  activityLevel?: ActivityLevel;
}

export type DailyCaloriesDto = number;



// ---------- Images ----------

/** Ответ POST /api/images — относительный URL, например "/images/uuid.jpg" */
export interface ImageUploadResponse {
  imageUrl: string;
}

// ---------- Measurements (замеры тела) ----------

export interface BodyMeasurementDto {
  id: number;
  measuredAt: string;
  weightKg: number | null;
  chestCm: number | null;
  waistCm: number | null;
  bellyCm: number | null;
  hipsCm: number | null;
  thighCm: number | null;
  armCm: number | null;
  neckCm: number | null;
  note: string | null;
  createdAt: string;
}

export interface CreateBodyMeasurementRequest {
  measuredAt: string;
  weightKg?: number | null;
  chestCm?: number | null;
  waistCm?: number | null;
  bellyCm?: number | null;
  hipsCm?: number | null;
  thighCm?: number | null;
  armCm?: number | null;
  neckCm?: number | null;
  note?: string | null;
}
// ---------- Meal Plans (F2) ----------

export interface MealPlanDto {
  id: number;
  name: string | null;
  startDate: string;           // ISO: "2026-10-05"
  endDate: string;
  items: MealPlanItemDto[];
}

export interface MealPlanItemDto {
  id: number;
  planDate: string;
  mealType: MealType;
  recipeId: number | null;
  recipeName: string | null;
  ingredientId: number | null;
  ingredientName: string | null;
  servings: number | null;
  weightInGrams: number | null;
  customName: string | null;
}

export interface CreateMealPlanRequest {
  name: string;
  startDate: string;
  endDate: string;
}

export interface CreateMealPlanItemRequest {
  planDate: string;
  mealType: MealType;
  recipeId?: number | null;
  ingredientId?: number | null;
  servings?: number | null;
  weightInGrams?: number | null;
  customName?: string | null;
}

// ---------- Shopping Lists (F2) ----------

export interface ShoppingListDto {
  id: number;
  name: string | null;
  planId: number | null;
  periodStart: string | null;
  periodEnd: string | null;
  status: 'ACTIVE' | 'ARCHIVED';
  items: ShoppingListItemDto[];
}

export interface ShoppingListItemDto {
  id: number;
  ingredientId: number | null;
  ingredientName: string;
  category: string | null;
  quantityGrams: number | null;
  unitType: UnitType | null;
  isChecked: boolean;
}

export interface GenerateShoppingListRequest {
  periodStart?: string | null;
  periodEnd?: string | null;
}

// ---------- Категории ингредиентов (для группировки) ----------

export const INGREDIENT_CATEGORIES: Record<string, { label: string; emoji: string }> = {
  MEAT:       { label: 'Мясо',       emoji: '🥩' },
  FISH:       { label: 'Рыба',       emoji: '🐟' },
  VEGETABLES: { label: 'Овощи',      emoji: '🥬' },
  FRUITS:     { label: 'Фрукты',     emoji: '🍎' },
  GRAINS:     { label: 'Крупы',      emoji: '🌾' },
  DAIRY:      { label: 'Молочное',   emoji: '🥛' },
  EGGS:       { label: 'Яйца',       emoji: '🥚' },   // 🆕
  NUTS:       { label: 'Орехи',      emoji: '🥜' },   // 🆕
  OILS:       { label: 'Масла',      emoji: '🫒' },   // 🆕
  DRESSINGS:  { label: 'Заправки',   emoji: '🫗' },   // 🆕 (заменяет SAUCES)
  SPICES:     { label: 'Специи',     emoji: '🧂' },
  SWEETS:     { label: 'Сладкое',    emoji: '🍫' },
  DRINKS:     { label: 'Напитки',    emoji: '🥤' },
  OTHER:      { label: 'Прочее',     emoji: '📦' },
};
export interface CreateShoppingListItemRequest {
  ingredientId?: number | null;
  ingredientName: string;
  category?: string | null;
  quantityGrams?: number | null;
  unitType?: UnitType | null;
}
export interface AddFromPlanRequest {
  planId: number;
  date: string;
  itemIds: number[];
}

export interface AddFromPlanResponse {
  added: number;
  message: string;
}