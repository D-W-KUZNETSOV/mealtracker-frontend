import SvgIcon from '@mui/material/SvgIcon';
import type { SvgIconProps } from '@mui/material/SvgIcon';

/**
 * Иконка «Баланс» — стилизованные весы.
 * Наследует цвет (currentColor) и размер от MUI.
 */
export default function BalanceIcon(props: SvgIconProps) {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      {/* Стойка */}
      <path d="M12 3 V 20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      {/* Перекладина */}
      <path d="M5 6 H 19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      {/* Точка баланса */}
      <circle cx="12" cy="6" r="1.3" fill="currentColor" />
      {/* Левая чаша */}
      <path d="M5 6 L3 12 H7 Z" fill="currentColor" opacity="0.85" />
      {/* Правая чаша */}
      <path d="M19 6 L17 12 H21 Z" fill="currentColor" opacity="0.85" />
      {/* Основание */}
      <path d="M8 20 H 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" fill="none" />
    </SvgIcon>
  );
}