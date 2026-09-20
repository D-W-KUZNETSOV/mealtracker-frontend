import { Typography, Box } from '@mui/material';

export default function DiaryPage() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Дневник питания
      </Typography>
      <Typography color="text.secondary">
        Здесь будет дневник за сегодня и по датам. Пока — заглушка.
      </Typography>
    </Box>
  );
}