import { useApiRequest } from "./apiRequest";

/* ============================
   HOOKS PARA HISTORIAL
   ============================ */

// 🔹 Registrar una nueva consulta en el historial
export const useRegistrarHistorial = () => {
  const apiRequest = useApiRequest();
  return async ({
    id_usuario,
    id_contenido,
    tipo = "ARCHIVO", // 👈 nuevo parámetro opcional
  }: {
    id_usuario: number;
    id_contenido: number;
    tipo?: "HTML" | "ARCHIVO";
  }) => {
    return await apiRequest("historial/agregar", {
      method: "POST",
      body: JSON.stringify({
        id_usuario,
        id_contenido,
        tipo, // 👈 enviar tipo al backend
      }),
    });
  };
};

// 🔹 Obtener todas las consultas del historial (opcional, útil para debug o dashboard)
export const useObtenerHistorial = () => {
  const apiRequest = useApiRequest();
  return async () =>
    await apiRequest("historial", {
      method: "GET",
    });
};

// 🔹 Obtener historial por usuario (opcional)
export const useObtenerHistorialPorUsuario = () => {
  const apiRequest = useApiRequest();
  return async (id_usuario: number) =>
    await apiRequest(`historial/usuario/${id_usuario}`, {
      method: "GET",
    });
};

// 🔹 Obtener el Top 5 contenidos más consultados recientemente
export const useObtenerTopConsultados = () => {
  const apiRequest = useApiRequest();
  return async () =>
    await apiRequest("historial/top", {
      method: "GET",
    });
};
