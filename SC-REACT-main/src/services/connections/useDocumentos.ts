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
        html,
        textoPlano,
        autor,
    }: {
        titulo: string;
        html: string;
        textoPlano: string;
        autor: number;
    }) =>
        await apiRequest("documentos", {
            method: "POST",
            body: JSON.stringify({
                titulo,
                html,
                textoPlano,
                autor,
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
