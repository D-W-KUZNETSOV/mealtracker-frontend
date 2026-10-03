import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Chip,
  Stack,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

// ============================================================
// Справочник пользователя MealTracker
// ============================================================
export default function GuidePage() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Справочник
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Справочник «Баланса» — всё, что нужно знать о питании, КБЖУ и работе приложения.
      </Typography>

      <Stack spacing={1}>
        {/* ============ Как пользоваться приложением ============ */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Как пользоваться приложением</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={1.5}>
              <Typography>
                <b>1. Заполни профиль</b> → раздел «Профиль».
                Укажи рост, вес, дату рождения, пол, уровень активности.
              </Typography>
              <Typography>
                <b>2. Поставь цели</b> → раздел «Цели».
                Выбери цель: похудеть / поддерживать / набрать массу.
                Калории и белок рассчитаются автоматически.
              </Typography>
              <Typography>
                <b>3. Создай рецепты</b> → раздел «Рецепты».
                Добавь ингредиенты (в граммах, штуках, мл или ложках).
              </Typography>
              <Typography>
                <b>4. Веди дневник</b> → раздел «Дневник».
                Выбирай рецепт и вес порции — КБЖУ посчитается сам.
                Можно добавлять порции прямо из плана меню (кнопка «Из плана»).
              </Typography>
              <Typography>
                <b>5. Планируй меню</b> → раздел «Меню».
                Составь меню на день или неделю: завтрак, обед, ужин, перекус.
                КБЖУ за день считается автоматически.
              </Typography>
              <Typography>
                <b>6. Составляй список покупок</b> → раздел «Покупки».
                Сгенерируй список из плана меню — ингредиенты агрегируются
                автоматически. Или добавь продукты вручную.
              </Typography>
              <Typography>
                <b>7. Отслеживай прогресс</b> → раздел «Замеры».
                Записывай вес и обхваты — увидишь графики.
              </Typography>
            </Stack>
          </AccordionDetails>
        </Accordion>

        {/* ============ Меню (планировщик) ============ */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Меню — планировщик питания</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={2}>
              <Typography variant="body2">
                <b>Что это:</b> раздел для планирования приёмов пищи
                на день или неделю вперёд.
              </Typography>

              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Как пользоваться
                </Typography>
                <Typography variant="body2" sx={{ pl: 2 }}>
                  • <b>Выбери период</b> — день или неделя (переключатель сверху)<br />
                  • <b>Кликни на слот</b> — Завтрак / Обед / Ужин / Перекус<br />
                  • <b>Выбери блюдо</b> — из своих рецептов, публичных рецептов
                  или отдельных ингредиентов<br />
                  • <b>Укажи порцию</b> — в граммах или в порциях (если у рецепта
                  заданы servings)
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Что показывает
                </Typography>
                <Typography variant="body2" sx={{ pl: 2 }}>
                  • <b>Итоги КБЖУ за день</b> — сумма по всем слотам<br />
                  • <b>Прогресс-бары</b> — сколько съедено от цели (калории + белок)<br />
                  • <b>Сетка недели</b> — краткая сводка по каждому дню
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Перенос в дневник
                </Typography>
                <Typography variant="body2" sx={{ pl: 2 }}>
                  Два способа:<br />
                  1. <b>Из меню:</b> на карточке блюда — кнопка «Съедено»<br />
                  2. <b>Из дневника:</b> кнопка «Из плана» → выбрать блюда из меню
                  на сегодня
                </Typography>
              </Box>

              <Typography variant="body2" color="text.secondary">
                💡 Совет: планируй меню на неделю заранее — так проще
                контролировать КБЖУ и закупаться продуктами.
              </Typography>
            </Stack>
          </AccordionDetails>
        </Accordion>

        {/* ============ Покупки ============ */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Покупки — списки продуктов</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={2}>
              <Typography variant="body2">
                <b>Что это:</b> списки продуктов, которые нужно купить.
                Можно создавать автоматически из плана меню или добавлять вручную.
              </Typography>

              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Как создать список
                </Typography>
                <Typography variant="body2" sx={{ pl: 2 }}>
                  <b>1. Из плана меню</b> — кнопка «Сгенерировать из плана».<br />
                  Выбери период (день / неделя / свой диапазон) — система
                  соберёт все ингредиенты из рецептов и агрегирует
                  одинаковые позиции с суммированием веса.<br /><br />
                  <b>2. Вручную</b> — кнопка «Добавить вручную».<br />
                  Пригодится для бытовых продуктов (мыло, бумага),
                  не связанных с рецептами.
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Что можно делать со списком
                </Typography>
                <Typography variant="body2" sx={{ pl: 2 }}>
                  • <b>Отмечать купленное</b> — чекбокс рядом с позицией<br />
                  • <b>Архивировать</b> — завершённые списки уходят в архив<br />
                  • <b>Повторять</b> — кнопка «Повторить» создаёт копию списка
                  (для регулярных закупок)<br />
                  • <b>Редактировать</b> — менять количество, удалять позиции
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Как считается количество
                </Typography>
                <Typography variant="body2" sx={{ pl: 2 }}>
                  Если один и тот же ингредиент встречается в нескольких
                  рецептах — веса суммируются. Например, в трёх рецептах
                  нужна курица по 200 г → в списке будет «Курица — 600 г».
                </Typography>
              </Box>

              <Typography variant="body2" color="text.secondary">
                💡 Совет: сохраняй шаблонные списки через «Повторить» —
                для еженедельных закупок это экономит время.
              </Typography>
            </Stack>
          </AccordionDetails>
        </Accordion>

        {/* ============ Дневник — новая кнопка «Из плана» ============ */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Дневник: добавление «Из плана»</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={2}>
              <Typography variant="body2">
                В дневнике есть <b>две кнопки</b> для добавления еды:
              </Typography>

              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  «Добавить порцию» — вручную
                </Typography>
                <Typography variant="body2" sx={{ pl: 2 }}>
                  Выбираешь рецепт из своих или публичных, указываешь вес
                  порции — КБЖУ считается автоматически.
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  «Из плана» — массово из меню
                </Typography>
                <Typography variant="body2" sx={{ pl: 2 }}>
                  Открывается список блюд, запланированных в меню на сегодня.
                  Отмечаешь нужные галочками — и они разом добавляются в
                  дневник с указанными порциями.<br /><br />
                  Удобно, если ты заранее спланировал меню на день и хочешь
                  быстро перенести всё съеденное в дневник.
                </Typography>
              </Box>

              <Typography variant="body2" color="text.secondary">
                💡 Совет: планируй меню утром или вечером накануне —
                тогда в течение дня просто отмечаешь съеденное через «Из плана».
              </Typography>
            </Stack>
          </AccordionDetails>
        </Accordion>

        {/* ============ Что такое КБЖУ ============ */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Что такое КБЖУ</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={2}>
              <Box>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 0.5 }}>
                  <Chip label="Белки" color="success" size="small" />
                  <Typography variant="body2" color="text.secondary">
                    4 ккал/г
                  </Typography>
                </Stack>
                <Typography variant="body2">
                  Нужны для мышц, кожи, иммунитета.
                  Норма: 1.2–1.6 г/кг (поддержание), 1.8–2.2 г/кг (похудение).
                  Источники: курица, рыба, яйца, творог, бобовые.
                </Typography>
              </Box>

              <Box>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 0.5 }}>
                  <Chip label="Жиры" color="warning" size="small" />
                  <Typography variant="body2" color="text.secondary">
                    9 ккал/г
                  </Typography>
                </Stack>
                <Typography variant="body2">
                  Нужны для гормонов, витаминов A/D/E/K.
                  Норма: 0.8–1.0 г/кг.
                  Полезные: оливковое масло, авокадо, орехи, жирная рыба.
                </Typography>
              </Box>

              <Box>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 0.5 }}>
                  <Chip label="Углеводы" color="info" size="small" />
                  <Typography variant="body2" color="text.secondary">
                    4 ккал/г
                  </Typography>
                </Stack>
                <Typography variant="body2">
                  Главный источник энергии. Норма: 2–4 г/кг.
                  Полезные (сложные): овсянка, гречка, бурый рис, овощи.
                  Ограничить: сахар, белый хлеб, газировка.
                </Typography>
              </Box>
            </Stack>
          </AccordionDetails>
        </Accordion>

        {/* ============ ИМТ ============ */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">ИМТ (Индекс массы тела)</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={1.5}>
              <Typography>
                <b>Формула:</b> вес (кг) / (рост (м))²
              </Typography>
              <Typography>
                <b>Норма (ВОЗ):</b> 18.5–24.9
              </Typography>
              <Typography>
                <b>С учётом возраста (40+):</b> до 26 — норма, потому что
                с возрастом снижается мышечная масса.
              </Typography>
              <Typography variant="subtitle2" sx={{ mt: 1 }}>
                Что важнее ИМТ:
              </Typography>
              <Typography variant="body2">
                • <b>Обхват талии:</b> &lt; 80 см (женщины), &lt; 94 см (мужчины)<br />
                • <b>Процент жира:</b> 22–28% (женщины), 12–20% (мужчины)<br />
                • <b>Мышечная масса:</b> сохраняй силовыми тренировками
              </Typography>
            </Stack>
          </AccordionDetails>
        </Accordion>

        {/* ============ Яйца ============ */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Яйца: сырые vs варёные</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={1.5}>
              <Typography variant="body2">
                <b>КБЖУ (на 100 г):</b> почти одинаково — 157 ккал, 12.7 г белка.
              </Typography>
              <Typography variant="body2">
                <b>НО вес меняется:</b>
              </Typography>
              <Typography variant="body2" sx={{ pl: 2 }}>
                • Сырое (без скорлупы): <b>~55 г</b><br />
                • Варёное (без скорлупы): <b>~50 г</b> (вода испаряется)
              </Typography>
              <Typography variant="body2">
                <b>Усвояемость белка:</b>
              </Typography>
              <Typography variant="body2" sx={{ pl: 2 }}>
                • Сырое — ~50% (авидин мешает)<br />
                • Варёное — ~90%
              </Typography>
              <Typography variant="body2">
                <b>Как вводить в трекер:</b> взвешиваешь сырое → выбирай «Яйцо куриное (сырое)» (55 г/шт).
                После варки вес уменьшится, но КБЖУ на 100 г остаётся тем же.
              </Typography>
            </Stack>
          </AccordionDetails>
        </Accordion>

        {/* ============ Мясо/рыба ============ */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Мясо и рыба: сырое vs готовое</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={1.5}>
              <Typography variant="body2">
                При готовке мясо и рыба теряют <b>~25% воды</b>. Поэтому КБЖУ
                на 100 г <b>готового</b> продукта выше, чем на 100 г <b>сырого</b>.
              </Typography>
              <Typography variant="body2">
                <b>Пример — куриная грудка:</b>
              </Typography>
              <Typography variant="body2" sx={{ pl: 2 }}>
                • Сырая: 156 ккал / 31 г белка<br />
                • Варёная: 137 ккал / 29.8 г белка (но на 100 г <i>готового</i> вес меньше)
              </Typography>
              <Typography variant="body2">
                <b>Как взвешивать:</b> взвешивай <b>до готовки</b> (сырое).
                Если взвешиваешь готовое — выбирай «варёное» / «запечённое» в базе.
              </Typography>
            </Stack>
          </AccordionDetails>
        </Accordion>

        {/* ============ Полезные жиры ============ */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Полезные жиры</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={1.5}>
              <Typography variant="body2">
                <b>Норма:</b> 0.8–1.0 г/кг веса
              </Typography>
              <Typography variant="body2">
                <b>Полезные источники:</b>
              </Typography>
              <Typography variant="body2" sx={{ pl: 2 }}>
                • Оливковое масло (extra virgin)<br />
                • Авокадо<br />
                • Орехи (миндаль, грецкий, кешью)<br />
                • Жирная рыба (лосось, скумбрия, сельдь)<br />
                • Семена льна, чиа
              </Typography>
              <Typography variant="body2">
                <b>Ограничить:</b> трансжиры (маргарин, фастфуд), жареное на
                многократно использованном масле.
              </Typography>
            </Stack>
          </AccordionDetails>
        </Accordion>

        {/* ============ Полезные углеводы ============ */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Полезные углеводы (сложные)</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={1.5}>
              <Typography variant="body2">
                <b>Норма:</b> 2–4 г/кг веса
              </Typography>
              <Typography variant="body2">
                <b>Полезные (сложные):</b>
              </Typography>
              <Typography variant="body2" sx={{ pl: 2 }}>
                • Овсянка, гречка, бурый рис, киноа<br />
                • Бобовые (фасоль, чечевица, горох)<br />
                • Овощи (кроме картофеля)<br />
                • Фрукты (яблоки, ягоды, цитрусовые)
              </Typography>
              <Typography variant="body2">
                <b>Ограничить:</b> сахар, белый хлеб, выпечка, газировка, соки.
              </Typography>
            </Stack>
          </AccordionDetails>
        </Accordion>

        {/* ============ Полезные белки ============ */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Полезные белки</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={1.5}>
              <Typography variant="body2">
                <b>Норма (по цели):</b>
              </Typography>
              <Typography variant="body2" sx={{ pl: 2 }}>
                • Поддержание: 1.2–1.6 г/кг<br />
                • Похудение: 1.8–2.2 г/кг (сохранить мышцы)<br />
                • Набор массы: 1.6–2.0 г/кг
              </Typography>
              <Typography variant="body2">
                <b>Источники:</b>
              </Typography>
              <Typography variant="body2" sx={{ pl: 2 }}>
                • Курица, индейка, говядина<br />
                • Рыба (лосось, треска, тунец)<br />
                • Яйца<br />
                • Творог, греческий йогурт<br />
                • Бобовые (для вегетарианцев)
              </Typography>
            </Stack>
          </AccordionDetails>
        </Accordion>

        {/* ============ Вредные продукты ============ */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Вредные продукты (ограничить)</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={1.5}>
              <Typography variant="body2">
                <b>Трансжиры:</b> маргарин, фастфуд, магазинная выпечка,
                чипсы, попкорн для микроволновки.
              </Typography>
              <Typography variant="body2">
                <b>Простые сахара:</b> газировка, конфеты, торты, соки из
                пакета, сладкие йогурты.
              </Typography>
              <Typography variant="body2">
                <b>Рафинированные углеводы:</b> белый хлеб, белый рис,
                макароны из мягких сортов пшеницы.
              </Typography>
              <Typography variant="body2">
                <b>Алкоголь:</b> пустые калории, вреден для печени.
              </Typography>
            </Stack>
          </AccordionDetails>
        </Accordion>

        {/* ============ Советы по питанию ============ */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Советы по питанию</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={1.5}>
              <Typography variant="body2">
                <b>💧 Питьевой режим:</b> 30 мл воды на 1 кг веса.
                Для 80 кг — 2.4 л в день.
              </Typography>
              <Typography variant="body2">
                <b>🍽 Дробное питание:</b> 3–4 приёма пищи в день.
                Белок в каждый приём (20–30 г).
              </Typography>
              <Typography variant="body2">
                <b>⏰ Не есть за 2–3 часа до сна:</b> чтобы не мешать сну
                и не набирать лишнее.
              </Typography>
              <Typography variant="body2">
                <b>🥗 Овощи в каждый приём:</b> клетчатка, витамины,
                насыщение.
              </Typography>
              <Typography variant="body2">
                <b>📏 Взвешивай еду:</b> глазомер обманывает. Кухонные весы —
                твой друг.
              </Typography>
            </Stack>
          </AccordionDetails>
        </Accordion>

        {/* ============ FAQ ============ */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">FAQ (частые вопросы)</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={2}>
              <Box>
                <Typography variant="subtitle2">
                  Сколько калорий мне нужно?
                </Typography>
                <Typography variant="body2">
                  Зависит от пола, возраста, роста, веса, активности и цели.
                  Рассчитай в разделе «Цели» — система посчитает по формуле
                  Миффлина–Сан Жеора.
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2">
                  Почему вес стоит?
                </Typography>
                <Typography variant="body2">
                  Возможные причины: задержка воды, недостаток сна, стресс,
                  недостаток белка, слишком большой дефицит калорий.
                  Проверь сон, белок и уровень стресса.
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2">
                  Как считать порции?
                </Typography>
                <Typography variant="body2">
                  Взвешивай еду на кухонных весах. Для яиц, молока и масла
                  используй переключатель единиц: г / шт / мл / ст.л.
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2">
                  Что делать, если вес не уходит?
                </Typography>
                <Typography variant="body2">
                  Следи за дефицитом калорий (важен для похудения),
                  белком (сохраняет мышцы) и силовыми тренировками.
                  Веди дневник честно — иногда мы едим больше, чем думаем.
                </Typography>
              </Box>

              {/* 🆕 Новый FAQ-пункт про меню */}
              <Box>
                <Typography variant="subtitle2">
                  Зачем планировать меню, если есть дневник?
                </Typography>
                <Typography variant="body2">
                  Дневник — это «что я уже съел». Меню — «что я планирую съесть».
                  Планирование помогает:<br />
                  • Заранее рассчитать КБЖУ на день<br />
                  • Составить список покупок без лишнего<br />
                  • Не думать «что бы поесть» в течение дня<br />
                  • Видеть, укладываешься ли в цели ещё до еды
                </Typography>
              </Box>
            </Stack>
          </AccordionDetails>
        </Accordion>
      </Stack>
    </Box>
  );
}