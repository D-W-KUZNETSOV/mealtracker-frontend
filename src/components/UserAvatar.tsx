import { Avatar } from '@mui/material';
import { getImageFullUrl } from '../utils/imageUrl';

// ============================================================
// Утилита: подбираем цвет по username (детерминированно).
// ============================================================
const AVATAR_COLORS = [
  '#2e7d32', // зелёный
  '#1976d2', // синий
  '#d32f2f', // красный
  '#f57c00', // оранжевый
  '#7b1fa2', // пурпурный
  '#00796b', // тёмно-зелёный
  '#5d4037', // коричневый
  '#c2185b', // розовый
];

function pickColor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  const idx = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

function pickInitials(username: string): string {
  const trimmed = username.trim();
  if (!trimmed) return '?';
  return trimmed[0].toUpperCase();
}

interface UserAvatarProps {
  /** Имя пользователя (для инициалов и цвета) */
  username: string;
  /** URL аватара (относительный или абсолютный). Может быть null. */
  avatarUrl?: string | null;
  /** Размер в px */
  size?: number;
}

// ============================================================
// Аватар пользователя:
// - если есть avatarUrl — показываем картинку
// - иначе — инициал + цвет, подобранный по username
// ============================================================
export default function UserAvatar({
  username,
  avatarUrl,
  size = 40,
}: UserAvatarProps) {
  const fullUrl = getImageFullUrl(avatarUrl);

  if (fullUrl) {
    return (
      <Avatar
        src={fullUrl}
        alt={username}
        sx={{ width: size, height: size }}
      />
    );
  }

  return (
    <Avatar
      sx={{
        width: size,
        height: size,
        bgcolor: pickColor(username),
        fontSize: size * 0.5,
      }}
    >
      {pickInitials(username)}
    </Avatar>
  );
}