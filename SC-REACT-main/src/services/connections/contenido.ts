import { useApiRequest } from "./apiRequest";

export const useEnviarContenido = () => {
  const apiRequest = useApiRequest();
  return async ({
    titulo,
    descripcion,
    id_tipo,
    id_usuario,
    archivo,
    tags,
  }: {
    titulo: string;
    descripcion: string;
    id_tipo: number;
    id_usuario: string;
    archivo: File; // 👈 el file que elegís en fileCont
    tags: string;
  }) => {
    const formData = new FormData();
    formData.append("titulo", titulo);
    formData.append("descripcion", descripcion);
    formData.append("id_tipo", id_tipo.toString());
    formData.append("id_usuario", id_usuario);
    formData.append("archivo", archivo); // el archivo en crudo
    formData.append("tags", tags); // string separado por ";"

    let endpoint = "";
    if (id_tipo === 1) endpoint = "contenidos/subir-pdf";
    if (id_tipo === 2) endpoint = "contenidos/subir-video";
    if (id_tipo === 3) endpoint = "contenidos/subir-imagen";

    await apiRequest(endpoint, {
      method: "POST",
      body: formData,
    });
  };
};
export const useObtenerContenidos = () => {
  const apiRequest = useApiRequest();
  return async () => {
    return await apiRequest("contenidos/listar", {
      method: "GET",
    });
  };
};
