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
  email: string;
  password: string;
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

// ---------- Ingredients ----------

export interface IngredientDto {
  id: number;
  name: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  base: boolean;
}

export interface IngredientRequest {
  name: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

// ---------- Recipes ----------

export interface RecipeDto {
  id: number;
  name: string;
  description?: string;
  imageUrl?: string;
  visibility: 'PUBLIC' | 'PRIVATE';
  ingredients: RecipeIngredientDto[];
  calories?: number;
  protein?: number;
  fat?: number;
  carbs?: number;
}

export interface RecipeIngredientDto {
  ingredientId: number;
  ingredientName: string;
  amount: number;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

export interface RecipeSummaryDto {
  id: number;
  name: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

export interface RecipeRequest {
  name: string;
  description?: string;
  visibility: 'PUBLIC' | 'PRIVATE';
  ingredients: RecipeIngredientInput[];
}

export interface RecipeIngredientInput {
  ingredientId: number;
  amount: number;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

// ---------- Nutrition (цели) ----------

export interface UserGoalsDto {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

export interface GoalsRequest {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

// ---------- Profile ----------

export interface UserProfileDto {
  id: number;
  username: string;
  email: string;
  age?: number;
  weight?: number;
  height?: number;
  gender?: 'MALE' | 'FEMALE';
  activityLevel?: string;
}

export interface ProfileUpdateRequest {
  email?: string;
  age?: number;
  weight?: number;
  height?: number;
  gender?: 'MALE' | 'FEMALE';
  activityLevel?: string;
}

// ---------- Stats (дневник) ----------

export interface DailyStatsDto {
  date: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  entries: DailyEntryDto[];
}

export interface DailyEntryDto {
  id: number;
  recipeId: number;
  recipeName: string;
  amount: number;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

export interface AddPortionRequest {
  recipeId: number;
  amount: number;
  date?: string;
}

// ---------- Images ----------

export interface ImageUploadResponse {
  url: string;
}