# MealTracker — Frontend

SPA-приложение для трекинга КБЖУ (калории, белки, жиры, углеводы) с рецептами, дневником питания и целями.

**Стек:** React 19, TypeScript 6, Vite 8, MUI 9, React Router 7, TanStack Query 5, Zustand, Axios, React Hook Form, Zod, notistack.

**Бэкенд:** [mealtracker-java](https://github.com/D-W-KUZNETSOV/mealtracker-java) (Spring Boot 4, Java 17, PostgreSQL/H2).

---

## 🚀 Быстрый старт

### Требования

- **Node.js** 20 LTS или выше
- **npm** 10+
- Запущенный **бэкенд** на `http://localhost:8080`

### Установка и запуск

```bash
# Клонировать репозиторий
git clone https://github.com/D-W-KUZNETSOV/mealtracker-frontend.git
cd mealtracker-frontend

# Установить зависимости
npm install

# Запустить dev-сервер
npm run dev


Приложение откроется на **http://localhost:5173/**.

**Логин для теста:** `dmitriy` / `demo` (демо-пользователь создаётся на бэке через `DataInitializer`).

### Переменные окружения

Создай `.env.local` в корне (опционально):

```env
VITE_API_URL=http://localhost:8080
```

Если не задано — используется `http://localhost:8080` по умолчанию.

---

## 📦 Скрипты

| Команда | Что делает |
|---------|-----------|
| `npm run dev` | Запускает dev-сервер (Vite) |
| `npm run build` | Собирает production-сборку в `dist/` |
| `npm run preview` | Просмотр production-сборки |
| `npm run lint` | ESLint |

---

## 🗂️ Структура проекта

```
src/
├── api/           # HTTP-модули (axios + interceptor JWT/ApiError)
│   ├── client.ts
│   ├── auth.ts
│   ├── ingredients.ts
│   ├── recipes.ts
│   ├── stats.ts
│   ├── nutrition.ts
│   ├── profile.ts
│   └── images.ts
├── components/    # Общие компоненты
│   ├── Layout.tsx
│   ├── ProtectedRoute.tsx
│   ├── ConfirmDialog.tsx
│   ├── IngredientFormDialog.tsx
│   ├── RecipeFormDialog.tsx
│   ├── AddPortionDialog.tsx
│   ├── ImageUpload.tsx
│   └── UserAvatar.tsx
├── hooks/         # TanStack Query хуки
│   ├── useIngredients.ts
│   ├── useRecipes.ts
│   ├── useStats.ts
│   ├── useNutrition.ts
│   ├── useProfile.ts
│   └── useImages.ts
├── pages/         # Страницы (React Router)
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── RecipesPage.tsx
│   ├── RecipeDetailPage.tsx
│   ├── IngredientsPage.tsx
│   ├── DiaryPage.tsx
│   ├── GoalsPage.tsx
│   └── ProfilePage.tsx
├── store/         # Zustand
│   └── authStore.ts
├── types/         # Типы DTO (1-в-1 с Java)
│   └── api.ts
├── utils/         # Утилиты
│   └── imageUrl.ts
├── App.tsx        # Роутинг
├── main.tsx       # Провайдеры (QueryClient, MUI Theme, Snackbar, Router)
└── theme.ts       # MUI тема
```

---

## ✅ Что реализовано

### Авторизация
- Регистрация, логин, логаут
- JWT в localStorage, auto-refresh при 401
- Zustand store + persist
- Защищённые маршруты (`ProtectedRoute`)

### Ингредиенты
- CRUD (создание, редактирование, удаление)
- Разделение «мои» / «базовые»
- Валидация формы (Zod), живой предпросмотр калорий

### Рецепты
- Список с пагинацией + табы «Мои» / «Публичные»
- Детальная карточка (КБЖУ, ингредиенты)
- Создание с ингредиентами и граммовками
- Загрузка фото рецепта
- Смена видимости (PUBLIC/PRIVATE)
- Удаление

### Дневник питания
- Сводка КБЖУ за день
- Прогресс-бар по белку
- Переключатель дат
- Добавление порции рецепта

### Цели КБЖУ
- Форма целей (вес, белок/кг, калории, активность)
- Отображение целевого белка
- Радио-группа уровня активности

### Профиль
- Форма профиля (рост, вес, пол, активность)
- Расчёт BMI, дневной нормы
- Аватар (инициалы + цвет, fallback)

### UI
- MUI тема
- Уведомления (notistack)
- Единый формат ошибок (`ApiError`)
- Loading / Error состояния

---

## 📋 Known Issues / TODO

### Backend

- [ ] **`PUT /api/recipes/{id}` — редактирование рецепта.**
  Сейчас нет эндпоинта для обновления (только create, read, visibility, delete).
  Добавить `PUT /api/recipes/{id}` с телом как у `POST /api/recipes`.

- [ ] **`activityLevel` — единый источник истины.**
  Сейчас поле есть и в `user_goals`, и в `user_profile` — они не синхронизируются.
  Решение: `activityLevel` — только в `user_goals`. В `user_profile` — read-only или вычисляемое.
  `PUT /api/profile` не должен принимать `activityLevel`.

- [ ] **`GET /api/profile/calories/daily` возвращает `621`** — значение кажется некорректным
  (для демо-пользователя 80.7 кг / 178 см / 31 год / MODERATE должно быть ~2300–2600).

- [ ] **`totalCalories: null` в рецептах из `DataInitializer`.**
  Рецепт, созданный через `DataInitializer`, не имеет `totalCalories` (не вызывается `calculate*`).
  Рецепты через `POST /api/recipes` — имеют. Унифицировать.

- [ ] **Смена пароля:** `POST /api/auth/change-password` — смена (залогинен, помнит старый).
  Тело: `{ currentPassword, newPassword }`.

- [ ] **Восстановление пароля:** `POST /api/auth/forgot-password` + `POST /api/auth/reset-password`.
  Нужны: SMTP (Spring Mail), таблица `password_reset_tokens`, отправка email со ссылкой.

- [ ] **Планы целей (`goalType`):** `LOSE_WEIGHT` / `MAINTAIN` / `GAIN_MUSCLE`.
  Авторасчёт КБЖУ: BMR (Mifflin–St Jeor) × activityCoefficient × цель.
  Белки/жиры/углеводы — по коэффициентам от `goalType`.

- [ ] **`user_profile.startWeightKg` + `GET /api/profile/weight-progress`:**
  ```json
  { "startWeightKg": 81, "currentWeightKg": 79, "targetWeightKg": 75,
    "progressPercent": 33.3, "remainingKg": 4.0, "direction": "LOSE" }
  ```

- [ ] **(v2) `weight_log`** — история веса для графика.

- [ ] **Аватар:** `user_profile.avatarUrl` (URL из `POST /api/images/upload`).
  Переиспользовать существующий эндпоинт для фото рецептов.

- [ ] **`GET /api/ingredients/base/search`** — поиск по базовым (проверить формат параметра).

### Frontend

- [ ] **Автокомплит при поиске ингредиентов:**
    - Страница «Ингредиенты» → вкладка «Базовые» — поле поиска с автокомплитом.
    - Форма создания рецепта — серверный поиск с debounce (вместо локального).
    - Форма создания ингредиента — проверка на дубликаты.
    - _API-поиск уточнить в Swagger._

- [ ] **Форма редактирования рецепта** (после `PUT /api/recipes/{id}`).

- [ ] **`ProfilePage` — убрать редактирование `activityLevel`** (read-only, транслируется из целей).

- [ ] **`GoalsPage` — выбор плана (`goalType`)** + авторасчёт КБЖУ.

- [ ] **Смена пароля** — блок в `/profile`.

- [ ] **Восстановление пароля** — 2 страницы: `/forgot-password`, `/reset-password`.

- [ ] **Прогресс-бары по БЖУ** (не только белок) в `/diary`.

- [ ] **`WeightProgressCard`** — в `/profile` и `/diary`.

- [ ] **`UserAvatar`** — загрузка аватара (после `avatarUrl` на бэке).

- [ ] **Волна L — Полировка:**
    - Единые пустые состояния (Empty State)
    - Скелетоны вместо крутилок
    - Обработка `Network Error` / `500`
    - Подтверждения удаления везде
    - Кнопки с loading-состоянием

---

## 📄 Лицензия

MIT — см. [LICENSE](./LICENSE).