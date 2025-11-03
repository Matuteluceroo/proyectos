import { useApiRequest } from "./apiRequest";

export const useObtenerDocumentoByID = () => {
  const apiRequest = useApiRequest();
  return async (idDocumento: number) =>
    await apiRequest(`documentos/HTML/${idDocumento}`, {
      method: "GET",
    });
};

// 🔹 Crear nuevo documento HTML
export const useCrearDocumento = () => {
  const apiRequest = useApiRequest();
  return async ({
    titulo,
    descripcion,
    id_tipo,
    id_usuario,
    almacenamiento,
    url_archivo,
    html,
    textoPlano,
  }: {
    titulo: string;
    descripcion?: string;
    id_tipo: number;
    id_usuario: number;
    almacenamiento: "ARCHIVO" | "HTML" | "TEXTO";
    url_archivo?: string;
    html?: string;
    textoPlano?: string;
  }) =>
    await apiRequest("documentos/HTML", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        titulo,
        descripcion,
        id_tipo,
        id_usuario,
        almacenamiento,
        url_archivo,
        html,
        textoPlano,
      }),
    });
};

// 🔹 Buscar documentos HTML
export const useBuscarDocumentos = () => {
  const apiRequest = useApiRequest();
  return async (query: string) =>
    await apiRequest(`documentos/buscarHTML?q=${encodeURIComponent(query)}`, {
      method: "GET",
    });
};
