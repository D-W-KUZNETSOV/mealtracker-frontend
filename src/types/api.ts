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
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  email: string;
  dateOfBirth: string;  // ← ISO format: "1990-01-15"
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
  caloriesPer100g: number;
  proteinsPer100g: number;
  fatsPer100g: number;
  carbsPer100g: number;
}

export interface IngredientRequest {
  name: string;
  proteinsPer100g: number;
  fatsPer100g: number;
  carbsPer100g: number;
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
  visibility: 'PUBLIC' | 'PRIVATE';
}

/** Тело запроса на создание рецепта */
export interface RecipeRequest {
  name: string;
  category?: string;
  description?: string;
  imageUrl?: string;
  visibility: 'PUBLIC' | 'PRIVATE';
  ingredients: RecipeIngredientInput[];
}

export interface RecipeIngredientInput {
  ingredientId: number;
  weightInGrams: number;
}

/** Детальная карточка (GET /api/recipes/{id}/summary) */
export interface RecipeSummaryIngredientDto {
  name: string;
  caloriesPer100g: number;
  proteinsPer100g: number;
  fatsPer100g: number;
  carbsPer100g: number;
  quantityGrams: number;
  itemCalories: number;
}

export interface RecipeSummaryDto {
  name: string;
  description: string | null;
  imageUrl: string | null;
  visibility: 'PUBLIC' | 'PRIVATE';
  ingredients: RecipeSummaryIngredientDto[];
  totalCalories: number;
  totalProteins: number;
  totalFats: number;
  totalCarbs: number;
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
export interface DailyStatsDto {
  calories: number;
  proteins: number;
  fats: number;
  carbs: number;
  targetProtein: number | null;
  proteinProgressPercent: number | null;
}

/** Тело запроса на добавление порции */
export interface AddPortionRequest {
  recipeId: number;
  weightInGrams: number;
}

// ---------- Общие enum'ы ----------

export type ActivityLevel =
  | 'SEDENTARY'
  | 'LIGHT'
  | 'MODERATE'
  | 'HIGH'
  | 'VERY_HIGH';

export type Gender = 'MALE' | 'FEMALE';

// ---------- Nutrition (цели) ----------

export interface UserGoalsDto {
  id: number;
  currentWeightKg: number;
  proteinPerKg: number;
  targetCalories: number;
  activityLevel: ActivityLevel;
  createdAt: string;
}

export interface GoalsRequest {
  currentWeightKg: number;
  proteinPerKg: number;
  targetCalories: number;
  activityLevel: ActivityLevel;
}

export interface TargetProteinDto {
  weightKg: number;
  targetProteinGramsPerDay: number;
}

// ---------- Profile ----------

export interface UserProfileDto {
  ageYears: number;
  heightCm: number;
  currentWeightKg: number;
  targetWeightKg: number;
  gender: Gender;
  activityLevel: ActivityLevel;
  bmi: number;
}

export interface ProfileUpdateRequest {
  dateOfBirth?: string;
  heightCm?: number;
  currentWeightKg?: number;
  targetWeightKg?: number;
  gender?: Gender;
  activityLevel?: ActivityLevel;
}

export type DailyCaloriesDto = number;

// ---------- Images ----------

// ---------- Images ----------

/** Ответ POST /api/images — относительный URL, например "/images/uuid.jpg" */
export interface ImageUploadResponse {
  imageUrl: string;
}