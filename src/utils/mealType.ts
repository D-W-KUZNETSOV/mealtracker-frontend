export const MEAL_TYPE_LABELS: Record<string, string> = {
  BREAKFAST: 'Завтрак',
  LUNCH: 'Обед',
  DINNER: 'Ужин',
  SNACK: 'Перекус',
  DESSERT: 'Десерт',
  DRINK: 'Напиток',
};

export function mealTypeLabel(value: string | null | undefined): string {
  if (!value) return '';
  return MEAL_TYPE_LABELS[value] ?? value;
}