import { useApiRequest } from './apiRequest'

export const useObtenerDocumentoByID = () => {
    const apiRequest = useApiRequest();
    return async ({ idDocumento }: { idDocumento: number }) =>
        await apiRequest(`documentos/${idDocumento}`, {
            method: "GET",
        });
};
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
    await apiRequest("documentos", {
      method: "POST",
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

export const useBuscarDocumentos = () => {
    const apiRequest = useApiRequest();
    return async ({ query }: { query: string }) =>
        await apiRequest(`documentos/buscar?q=${encodeURIComponent(query)}`, {
            method: "GET",
        });
};
