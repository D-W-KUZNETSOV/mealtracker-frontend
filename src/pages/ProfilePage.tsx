import { Typography, Box } from '@mui/material';

export default function ProfilePage() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Профиль
      </Typography>
      <Typography color="text.secondary">
        Здесь будет профиль пользователя. Пока — заглушка.
      </Typography>
    </Box>
  );
}