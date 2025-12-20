import { useApiRequest } from "./apiRequest";

export const useAudios = () => {
  const apiRequest = useApiRequest();

  const uploadAudio = async (formData: FormData) => {
    return await apiRequest("audios/upload", {
      method: "POST",
      body: formData,
    });
  };

  const getAudiosByContenido = async (
    tipo_origen: string,
    id_contenido: number
  ) => {
    return await apiRequest(`audios/${tipo_origen}/${id_contenido}`, {
      method: "GET",
    });
  };

  return {
    uploadAudio,
    getAudiosByContenido,
  };
};
