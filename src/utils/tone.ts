// ============================================================
// Тексты в тёплом тоне — для всего продукта
// ============================================================

type GoalType = 'LOSE_WEIGHT' | 'MAINTAIN' | 'GAIN_MUSCLE';
type Gender = 'MALE' | 'FEMALE';

// ------------------------------------------------------------
// Калории
// ------------------------------------------------------------
export function getCaloriesText({
  caloriesPercent,
  remaining,
  goalType,
  gender,
}: {
  caloriesPercent: number;
  remaining: number;
  goalType?: GoalType;
  gender?: Gender;
}): string {
  if (caloriesPercent <= 100) {
    return `Ещё немного — осталось ${Math.round(remaining)} ккал`;
  }

  const ate = gender === 'FEMALE' ? 'поела' : 'поел';

  if (goalType === 'GAIN_MUSCLE') {
    return 'Отлично, набор идёт. Так держать';
  }

  if (goalType === 'MAINTAIN') {
    return `Хорошо ${ate}. Баланс держим. Спокойно`;
  }

  return `Хорошо ${ate}. Завтра — чуть полегче. Без насилия`;
}

// ------------------------------------------------------------
// Белок
// ------------------------------------------------------------
export function getProteinText({
  proteinPercent,
  proteins,
  targetProtein,
}: {
  proteinPercent: number;
  proteins: number;
  targetProtein: number;
}): string {
  if (proteinPercent > 100) {
    return 'Белок — супер. Ты в норме';
  }

  const left = Math.round(targetProtein - proteins);
  if (left > 0) {
    return `Белка маловато — ещё ${left} г`;
  }

  return `${Math.round(proteinPercent)}% от цели`;
}

// ------------------------------------------------------------
// Калории — для дневника (Alert)
// ------------------------------------------------------------
export function getCaloriesOverAlert({
  goalType,
  gender,
}: {
  goalType?: GoalType;
  gender?: Gender;
}): string {
  const ate = gender === 'FEMALE' ? 'поела' : 'поел';

  if (goalType === 'GAIN_MUSCLE') {
    return 'Отлично, набор идёт. Так держать';
  }

  if (goalType === 'MAINTAIN') {
    return `Хорошо ${ate}. Баланс держим. Спокойно`;
  }

  return `Хорошо ${ate}. Завтра — чуть полегче. Без насилия`;
}