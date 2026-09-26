import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { useSnackbar } from 'notistack';

import {
  useCreateMeasurement,
  useDeleteMeasurement,
  useMeasurements,
} from '../hooks/useMeasurements';
import type { ApiError, BodyMeasurementDto } from '../types/api';
import MeasurementsChart from '../components/MeasurementsChart';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

// ============================================================
// Схема валидации формы замера
// ============================================================
const measurementSchema = z.object({
  measuredAt: z.string().min(1, 'Укажите дату'),
  weightKg: z.number().nullable().optional(),
  chestCm: z.number().nullable().optional(),
  waistCm: z.number().nullable().optional(),
  bellyCm: z.number().nullable().optional(),
  hipsCm: z.number().nullable().optional(),
  thighCm: z.number().nullable().optional(),
  armCm: z.number().nullable().optional(),
  neckCm: z.number().nullable().optional(),
  note: z.string().max(500, 'Максимум 500 символов').optional(),
});

type MeasurementForm = z.infer<typeof measurementSchema>;

const todayISO = () => new Date().toISOString().slice(0, 10);

export default function MeasurementsPage() {
  const { enqueueSnackbar } = useSnackbar();
  const measurementsQuery = useMeasurements();
  const createMutation = useCreateMeasurement();
  const deleteMutation = useDeleteMeasurement();

  const [formOpen, setFormOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MeasurementForm>({
    resolver: zodResolver(measurementSchema),
    defaultValues: {
      measuredAt: todayISO(),
      weightKg: null,
      chestCm: null,
      waistCm: null,
      bellyCm: null,
      hipsCm: null,
      thighCm: null,
      armCm: null,
      neckCm: null,
      note: '',
    },
  });

  const onSubmit = async (data: MeasurementForm) => {
    try {
      await createMutation.mutateAsync({
        measuredAt: data.measuredAt,
        weightKg: data.weightKg ?? null,
        chestCm: data.chestCm ?? null,
        waistCm: data.waistCm ?? null,
        bellyCm: data.bellyCm ?? null,
        hipsCm: data.hipsCm ?? null,
        thighCm: data.thighCm ?? null,
        armCm: data.armCm ?? null,
        neckCm: data.neckCm ?? null,
        note: data.note || null,
      });
      enqueueSnackbar('Замер добавлен', { variant: 'success' });
      reset({
        measuredAt: todayISO(),
        weightKg: null,
        chestCm: null,
        waistCm: null,
        bellyCm: null,
        hipsCm: null,
        thighCm: null,
        armCm: null,
        neckCm: null,
        note: '',
      });
      setFormOpen(false);
    } catch (err) {
      const apiError = err as ApiError;
      enqueueSnackbar(apiError.message || 'Ошибка сохранения', {
        variant: 'error',
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Удалить замер?')) return;
    try {
      await deleteMutation.mutateAsync(id);
      enqueueSnackbar('Замер удалён', { variant: 'success' });
    } catch (err) {
      const apiError = err as ApiError;
      enqueueSnackbar(apiError.message || 'Ошибка удаления', {
        variant: 'error',
      });
    }
  };

  if (measurementsQuery.isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (measurementsQuery.isError) {
    return (
      <Alert severity="error">
        Ошибка загрузки замеров:{' '}
        {(measurementsQuery.error as unknown as ApiError)?.message}
      </Alert>
    );
  }

  const measurements: BodyMeasurementDto[] = measurementsQuery.data ?? [];

  return (
    <Box>
      <Stack
        direction="row"
        sx={{
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
          flexWrap: 'wrap',
          gap: 1,
        }}
      >
        <Typography variant="h4">Замеры тела</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setFormOpen((v) => !v)}
        >
          {formOpen ? 'Отмена' : 'Добавить замер'}
        </Button>
      </Stack>

      {/* ============ Форма ============ */}
      {formOpen && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Новый замер
            </Typography>

            <form onSubmit={handleSubmit(onSubmit)}>
              <Stack spacing={2} sx={{ mt: 1 }}>
                <TextField
                  label="Дата"
                  type="date"
                  fullWidth
                  slotProps={{ inputLabel: { shrink: true } }}
                  {...register('measuredAt')}
                  error={!!errors.measuredAt}
                  helperText={errors.measuredAt?.message}
                />

                <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap' }}>
                  <TextField
                    label="Вес, кг"
                    type="number"
                    sx={{ minWidth: 120, flex: 1 }}
                    slotProps={{ htmlInput: { step: '0.1', min: 0 } }}
                    {...register('weightKg', { valueAsNumber: true })}
                    error={!!errors.weightKg}
                    helperText={errors.weightKg?.message}
                  />
                  <TextField
                    label="Шея, см"
                    type="number"
                    sx={{ minWidth: 120, flex: 1 }}
                    slotProps={{ htmlInput: { step: '0.1', min: 0 } }}
                    {...register('neckCm', { valueAsNumber: true })}
                  />
                  <TextField
                    label="Грудь, см"
                    type="number"
                    sx={{ minWidth: 120, flex: 1 }}
                    slotProps={{ htmlInput: { step: '0.1', min: 0 } }}
                    {...register('chestCm', { valueAsNumber: true })}
                  />
                </Stack>

                <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap' }}>
                  <TextField
                    label="Талия, см"
                    type="number"
                    sx={{ minWidth: 120, flex: 1 }}
                    slotProps={{ htmlInput: { step: '0.1', min: 0 } }}
                    {...register('waistCm', { valueAsNumber: true })}
                  />
                  <TextField
                    label="Живот, см"
                    type="number"
                    sx={{ minWidth: 120, flex: 1 }}
                    slotProps={{ htmlInput: { step: '0.1', min: 0 } }}
                    {...register('bellyCm', { valueAsNumber: true })}
                  />
                  <TextField
                    label="Бёдра, см"
                    type="number"
                    sx={{ minWidth: 120, flex: 1 }}
                    slotProps={{ htmlInput: { step: '0.1', min: 0 } }}
                    {...register('hipsCm', { valueAsNumber: true })}
                  />
                </Stack>

                <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap' }}>
                  <TextField
                    label="Бедро, см"
                    type="number"
                    sx={{ minWidth: 120, flex: 1 }}
                    slotProps={{ htmlInput: { step: '0.1', min: 0 } }}
                    {...register('thighCm', { valueAsNumber: true })}
                  />
                  <TextField
                    label="Рука, см"
                    type="number"
                    sx={{ minWidth: 120, flex: 1 }}
                    slotProps={{ htmlInput: { step: '0.1', min: 0 } }}
                    {...register('armCm', { valueAsNumber: true })}
                  />
                </Stack>

                <TextField
                  label="Заметка"
                  fullWidth
                  multiline
                  minRows={2}
                  {...register('note')}
                  error={!!errors.note}
                  helperText={errors.note?.message}
                />

                <Button
                  type="submit"
                  variant="contained"
                  disabled={createMutation.isPending}
                  sx={{ alignSelf: 'flex-start' }}
                >
                  {createMutation.isPending ? 'Сохранение...' : 'Сохранить'}
                </Button>
              </Stack>
            </form>
          </CardContent>
        </Card>
      )}

  {/* ============ Графики ============ */}
      {measurements.length > 1 && (
        <MeasurementsChart measurements={measurements} />
      )}
      {/* ============ Список ============ */}
                 {measurements.length === 0 ? (
                   <Alert severity="info">
                     Пока нет замеров. Нажмите «Добавить замер», чтобы добавить первый.
                   </Alert>
                 ) : (
                   <Accordion>
                     <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                       <Typography variant="h6">
                         История замеров ({measurements.length})
                       </Typography>
                     </AccordionSummary>
                     <AccordionDetails>
                       <Stack spacing={2}>
                         {measurements.map((m) => (
                           <Card key={m.id} sx={{ p: 2 }}>
                             <Stack
                               direction="row"
                               sx={{
                                 justifyContent: 'space-between',
                                 alignItems: 'flex-start',
                                 mb: 2,
                               }}
                             >
                               <Box>
                                 <Typography variant="h6">
                                   {new Date(m.measuredAt).toLocaleDateString('ru-RU', {
                                     day: 'numeric',
                                     month: 'long',
                                     year: 'numeric',
                                   })}
                                 </Typography>
                                 <Typography variant="caption" color="text.secondary">
                                   {new Date(m.measuredAt).toLocaleDateString('ru-RU', {
                                     weekday: 'long',
                                   })}
                                 </Typography>
                               </Box>

                               <IconButton
                                 color="error"
                                 size="small"
                                 onClick={() => handleDelete(m.id)}
                                 disabled={deleteMutation.isPending}
                               >
                                 <DeleteIcon fontSize="small" />
                               </IconButton>
                             </Stack>

                             <Box
                               sx={{
                                 display: 'grid',
                                 gridTemplateColumns: {
                                   xs: 'repeat(2, 1fr)',
                                   sm: 'repeat(3, 1fr)',
                                   md: 'repeat(4, 1fr)',
                                 },
                                 gap: 2,
                               }}
                             >
                               {m.weightKg != null && (
                                 <StatBlock label="Вес" value={`${m.weightKg} кг`} />
                               )}
                               {m.neckCm != null && (
                                 <StatBlock label="Шея" value={`${m.neckCm} см`} />
                               )}
                               {m.chestCm != null && (
                                 <StatBlock label="Грудь" value={`${m.chestCm} см`} />
                               )}
                               {m.waistCm != null && (
                                 <StatBlock label="Талия" value={`${m.waistCm} см`} />
                               )}
                               {m.bellyCm != null && (
                                 <StatBlock label="Живот" value={`${m.bellyCm} см`} />
                               )}
                               {m.hipsCm != null && (
                                 <StatBlock label="Бёдра" value={`${m.hipsCm} см`} />
                               )}
                               {m.thighCm != null && (
                                 <StatBlock label="Бедро" value={`${m.thighCm} см`} />
                               )}
                               {m.armCm != null && (
                                 <StatBlock label="Рука" value={`${m.armCm} см`} />
                               )}
                             </Box>

                             {m.note && (
                               <Box
                                 sx={{
                                   mt: 2,
                                   pt: 2,
                                   borderTop: 1,
                                   borderColor: 'divider',
                                 }}
                               >
                                 <Typography variant="body2" color="text.secondary">
                                   💬 {m.note}
                                 </Typography>
                               </Box>
                             )}
                           </Card>
                         ))}
                       </Stack>
                     </AccordionDetails>
                   </Accordion>
                 )}
    </Box>
  );
}
// ============================================================
// Небольшой блок «label + value» для сетки замеров
// ============================================================
function StatBlock({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{
          display: 'block',
          textTransform: 'uppercase',
          fontSize: '0.7rem',
        }}
      >
        {label}
      </Typography>
      <Typography variant="body1" sx={{ fontWeight: 600 }}>
        {value}
      </Typography>
    </Box>
  );
}