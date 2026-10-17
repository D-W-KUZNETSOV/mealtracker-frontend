/**
 * Убирает ведущий 0 при вводе числа.
 * '0' → '0' (сохраняем, чтобы можно было ввести 0.5)
 * '05' → '5'
 * '00' → '0'
 * '0.5' → '0.5'
 */
export function normalizeNumberInput(raw: string): string {
  if (raw === '') return '';
  // Только цифры и одна точка/запятая
  // Убираем ведущие нули, если после них есть цифра (05 → 5, 00 → 0)
  return raw.replace(/^0+(?=\d)/, '');
}

/** Разрешаем только цифры и точку/запятую */
export function isValidNumberInput(raw: string): boolean {
  return raw === '' || /^\d*[.,]?\d*$/.test(raw);
}