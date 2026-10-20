import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import { Html5Qrcode } from "html5-qrcode";
import { apiClient } from "../api/client";
import type { ApiError } from "../types/api";
import AddPortionDialog from "./AddPortionDialog";
import type { IngredientDto } from "../types/api";

// Тип ответа от бэка (совпадает с ProductLookupResponse.java)
interface ProductLookupResponse {
    id?: number | null;
  barcode: string;
  name: string | null;
  caloriesPer100g: number | null;
  proteinsPer100g: number | null;
  fatsPer100g: number | null;
  carbsPer100g: number | null;
  found: boolean;
}

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function BarcodeScannerDialog({ open, onClose }: Props) {
  const [code, setCode] = useState("");
  const [searchCode, setSearchCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ProductLookupResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
    const [selectedIngredient, setSelectedIngredient] = useState<IngredientDto | null>(null);
    const [portionDialogOpen, setPortionDialogOpen] = useState(false);

  // 🆕 Состояния для камеры
  const [isCameraActive, setIsCameraActive] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);


  const navigate = useNavigate();

  // 🆕 Остановка камеры при закрытии диалога
  useEffect(() => {
    if (!open && scannerRef.current) {
      scannerRef.current.stop().catch(console.error);
      scannerRef.current = null;
      setIsCameraActive(false);
    }
 // Cleanup: если компонент удаляется из DOM, тоже стопим камеру
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(console.error);
        scannerRef.current = null;
      }
    };
  }, [open]);


  const handleSearch = async (codeToSearch: string = code) => {
    if (!codeToSearch.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await apiClient.get<ProductLookupResponse>(
        `/api/ingredients/barcode/${codeToSearch.trim()}`
      );
      setResult(res.data);
      setSearchCode(codeToSearch.trim());
    } catch (err) {
      const apiError = err as ApiError;
      console.error(err);
      setError(apiError.message || "Ошибка поиска. Попробуйте позже.");
    } finally {
      setLoading(false);
    }
  };

  // 🆕 Запуск камеры
  const startCamera = async () => {
    setIsCameraActive(true);
    setCameraError(null);
    setResult(null);

    // Ждем, пока отрендерится div для камеры
    setTimeout(async () => {
      try {
        const html5QrCode = new Html5Qrcode("reader");
        scannerRef.current = html5QrCode;

        await html5QrCode.start(
          { facingMode: "environment" }, // Задняя камера на телефоне
          {
            fps: 10,
            qrbox: { width: 250, height: 150 }, // Прямоугольник под штрихкод
          },
          (decodedText) => {
            // Успешно отсканировали
            html5QrCode.stop().then(() => {
              setIsCameraActive(false);
              setCode(decodedText);
              handleSearch(decodedText); // Автоматически ищем
            }).catch(console.error);
          },
          (_errorMessage) => {
            // Игнорируем ошибки сканирования (когда просто водят камерой)
          }
        );
      } catch (err: any) {
        console.error(err);
        setCameraError("Не удалось включить камеру. Разрешите доступ в браузере.");
        setIsCameraActive(false);
      }
    }, 100);
  };

  // 🆕 Остановка камеры вручную
  const stopCamera = () => {
    if (scannerRef.current) {
      scannerRef.current.stop().then(() => {
        setIsCameraActive(false);
        scannerRef.current = null;
      }).catch(console.error);
    } else {
      setIsCameraActive(false);
    }
  };

  const handleCreate = () => {
    onClose();
    navigate(`/ingredients?barcode=${searchCode}`);
  };

  const handleClose = async() => {
    if (scannerRef.current) {
    try {
            await scannerRef.current.stop(); // 👈 ЖДЕМ, пока камера реально выключится
          } catch (e) {
            console.error("Ошибка при остановке камеры:", e);
          }
          scannerRef.current = null;
        }
    setCode("");
    setSearchCode("");
    setResult(null);
    setError(null);
    setCameraError(null);
    setIsCameraActive(false);
    onClose();
  };

  return (
       <>
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>Сканировать штрихкод</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>

          {/* 🆕 Блок камеры */}
          {isCameraActive ? (
            <Box>
              <div id="reader" style={{ width: "100%" }}></div>
              <Button
                variant="outlined"
                color="error"
                fullWidth
                onClick={stopCamera}
                sx={{ mt: 2 }}
              >
                Остановить камеру
              </Button>
            </Box>
          ) : (
            <Button variant="contained" color="secondary" onClick={startCamera}>
              Включить камеру
            </Button>
          )}

          {cameraError && <Alert severity="warning">{cameraError}</Alert>}

          <Typography align="center" variant="body2" color="text.secondary">
            или введите вручную
          </Typography>

          <TextField
            label="Введите штрихкод"
            fullWidth
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Например, 4601234567890"
            slotProps={{ htmlInput: { inputMode: "numeric" } }}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch();
            }}
          />
          <Button
            variant="contained"
            onClick={() => handleSearch()}
            disabled={!code.trim() || loading}
          >
            {loading ? "Ищем..." : "Найти"}
          </Button>

          {loading && (
            <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
              <CircularProgress size={24} />
            </Box>
          )}

          {error && <Alert severity="error">{error}</Alert>}

          {result && !loading && (
            <>
              {result.found ? (
                <Box sx={{ p: 2, bgcolor: "success.light", borderRadius: 1 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{ color: "success.contrastText" }}
                  >
                    Найдено: {result.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "success.contrastText" }}
                  >
                    {result.caloriesPer100g ?? "?"} ккал / 100 г
                  </Typography>
                                    <Button
                                      size="small"
                                      sx={{ mt: 1, color: "success.contrastText" }}
                                      onClick={() => {
                                        // Формируем объект IngredientDto из ответа бэка
                                        const ing: IngredientDto = {
                                          id: result.id!,
                                          name: result.name || "Без названия",
                                          caloriesPer100g: result.caloriesPer100g,
                                          proteinsPer100g: result.proteinsPer100g || 0,
                                          fatsPer100g: result.fatsPer100g || 0,
                                          carbsPer100g: result.carbsPer100g || 0,
                                          unitType: "GRAM",
                                          unitWeightGrams: null,
                                          barcode: result.barcode,
                                        };
                                        setSelectedIngredient(ing);
                                        setPortionDialogOpen(true);
                                        handleClose(); // Закрываем сканер, чтобы открылся дневник
                                      }}
                                    >
                                      Добавить в дневник
                                    </Button>
                </Box>
              ) : (
                <Alert
                  severity="warning"
                  action={
                    <Button color="inherit" size="small" onClick={handleCreate}>
                      Создать
                    </Button>
                  }
                >
                  Продукт не найден. Создать новый?
                </Alert>
              )}
            </>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Закрыть</Button>
      </DialogActions>
    </Dialog>
       {/* 🆕 Диалог добавления порции (рядом со сканером!) */}
       <AddPortionDialog
         open={portionDialogOpen}
         onClose={() => setPortionDialogOpen(false)}
         initialIngredient={selectedIngredient}
         onSuccess={async () => {
           await handleClose(); // 1. Ждем, пока сканер и камера полностью закроются
           navigate("/diary");  // 2. Только потом переходим в дневник
         }}
       />
  </>
  );
}