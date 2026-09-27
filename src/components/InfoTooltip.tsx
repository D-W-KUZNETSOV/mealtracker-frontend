import { Tooltip, IconButton, Box } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import type { ReactNode } from 'react';

interface InfoTooltipProps {
  /** Текст или JSX подсказки */
  title: ReactNode;
  /** Размер иконки в px */
  size?: number;
  /** Цвет иконки */
  color?: string;
}

// ============================================================
// Иконка ⓘ с всплывающей подсказкой.
// Используется рядом с непонятными показателями (ИМТ, КБЖУ, и т.д.).
// ============================================================
export default function InfoTooltip({
  title,
  size = 16,
  color = 'text.secondary',
}: InfoTooltipProps) {
  return (
    <Tooltip
      title={title}
      arrow
      placement="top"
      slotProps={{
        tooltip: {
          sx: {
            maxWidth: 320,
            fontSize: '0.85rem',
          },
        },
      }}
    >
      <IconButton
        size="small"
        sx={{ p: 0.5, color }}
        component="span"
        aria-label="Подсказка"
      >
        <InfoOutlinedIcon sx={{ fontSize: size }} />
      </IconButton>
    </Tooltip>
  );
}

// ============================================================
// Готовые подсказки для частых случаев
// ============================================================

export const tooltips = {
  bmi: (
    <Box>
      <b>ИМТ (Индекс массы тела)</b>
      <br />
      Соотношение веса и роста.
      <br />
      <br />
      <b>Норма:</b> 18.5–24.9
      <br />
      <b>С учётом возраста (40+):</b> до 26
      <br />
      <br />
      <b>Что делать:</b>
      <ul style={{ margin: '4px 0', paddingLeft: 18 }}>
        <li>Следить за обхватом талии (&lt; 80 см для женщин)</li>
        <li>Сохранять мышцы (силовые 2–3 раза/нед)</li>
        <li>Белок 1.2–1.6 г/кг веса</li>
      </ul>
    </Box>
  ),

  calories: (
    <Box>
      <b>Дневная норма калорий</b>
      <br />
      Рассчитана по формуле Миффлина–Сан Жеора с учётом:
      <ul style={{ margin: '4px 0', paddingLeft: 18 }}>
        <li>пола, возраста, роста, веса</li>
        <li>уровня активности</li>
        <li>цели (похудеть / поддерживать / набрать)</li>
      </ul>
    </Box>
  ),

  protein: (
    <Box>
      <b>Белок</b>
      <br />
      Нужен для мышц, кожи, иммунитета.
      <br />
      <br />
      <b>Норма:</b>
      <ul style={{ margin: '4px 0', paddingLeft: 18 }}>
        <li>Поддержание: 1.2–1.6 г/кг</li>
        <li>Похудение: 1.8–2.2 г/кг</li>
        <li>Набор массы: 1.6–2.0 г/кг</li>
      </ul>
    </Box>
  ),

  fats: (
    <Box>
      <b>Жиры</b>
      <br />
      Нужны для гормонов, витаминов A/D/E/K, здоровья сердца.
      <br />
      <br />
      <b>Норма:</b> 0.8–1.0 г/кг веса
      <br />
      <br />
      <b>Полезные:</b> оливковое масло, авокадо, орехи, жирная рыба
    </Box>
  ),

  carbs: (
    <Box>
      <b>Углеводы</b>
      <br />
      Главный источник энергии.
      <br />
      <br />
      <b>Норма:</b> 2–4 г/кг веса
      <br />
      <br />
      <b>Полезные (сложные):</b> овсянка, гречка, бурый рис, овощи
      <br />
      <b>Ограничить:</b> сахар, белый хлеб, газировка
    </Box>
  ),

  weightProgress: (
    <Box>
      <b>Прогресс веса</b>
      <br />
      Разница между первым и последним замером.
      <br />
      <br />
      <b>Оптимально:</b> −0.5…−1 кг в неделю (безопасное похудение)
    </Box>
  ),
};