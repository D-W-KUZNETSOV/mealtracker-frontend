import { Box, Button, Container, Typography } from '@mui/material';
import BuildIcon from '@mui/icons-material/Build';

export default function ServerDownScreen() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 2,
      }}
    >
      <Container maxWidth="sm" sx={{ textAlign: 'center' }}>
        <BuildIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
        <Typography variant="h4" gutterBottom>
          Идут технические работы
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Мы обновляем «Баланс», чтобы он работал ещё лучше.
          Пожалуйста, загляните чуть позже — мы скоро вернёмся!
        </Typography>
        <Button
          variant="contained"
          onClick={() => window.location.reload()}
        >
          Попробовать снова
        </Button>
      </Container>
    </Box>
  );
}