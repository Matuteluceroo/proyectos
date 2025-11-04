import { useApiRequest } from "./apiRequest";
// 🔹 Eliminar documento HTML
export const useEliminarDocumento = () => {
  const apiRequest = useApiRequest();

  return async (id: number) =>
    await apiRequest(`documentos/HTML/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });
};
// 🔹 Actualizar un documento HTML existente
export const useActualizarDocumento = () => {
  const apiRequest = useApiRequest();

  return async ({
    id_contenido,
    titulo,
    descripcion,
    url_archivo,
    html,
    textoPlano,
  }: {
    id_contenido: number;
    titulo: string;
    descripcion?: string;
    url_archivo?: string;
    html: string;
    textoPlano: string;
  }) =>
    await apiRequest(`documentos/HTML/${id_contenido}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        titulo,
        descripcion,
        url_archivo,
        html,
        textoPlano,
      }),
    });
};
export const useBuscarHTML = () => {
  const apiRequest = useApiRequest();

  return async (id: number) =>
    await apiRequest(`documentos/HTML/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
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
export const useObtenerDocumentoByID = () => {
  const apiRequest = useApiRequest();
  return async (idDocumento: number) =>
    await apiRequest(`documentos/HTML/${idDocumento}`, {
      method: "GET",
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

// // 🔹 Actualizar documento HTML existente
// export const useActualizarDocumento = () => {
//   const apiRequest = useApiRequest();
//   return async (id: number, datos: any) =>
//     await apiRequest(`documentos/HTML/${id}`, {
//       method: "PATCH",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(datos),
//     });
// };

// 🔹 Obtener todos los contenidos HTML
export const useObtenerContenidosHTML = () => {
  const apiRequest = useApiRequest();
  return async () =>
    await apiRequest("documentos/listar/HTML", {
      method: "GET",
    });
};
