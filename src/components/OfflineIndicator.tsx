import { useEffect, useState } from "react";
import { Alert } from "@mui/material";

export default function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <Alert severity="info" sx={{ mb: 2 }}>
      📡 Офлайн-режим. Данные могут быть неактуальны.
    </Alert>
  );
}
