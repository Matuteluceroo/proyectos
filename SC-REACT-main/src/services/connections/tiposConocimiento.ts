import { useApiRequest } from "./apiRequest"

// =============================================
// HOOKS PARA TIPOS DE CONOCIMIENTO
// =============================================

// 🔹 GET - Obtener todos los tipos de conocimiento
export const useObtenerTiposConocimiento = () => {
  const apiRequest = useApiRequest()
  return async () => await apiRequest(`tipos-conocimiento`, { method: "GET" })
}

// 🔹 GET - Obtener tipo por ID
export const useObtenerTipoPorId = () => {
  const apiRequest = useApiRequest()
  return async (idTipo) =>
    await apiRequest(`tipos-conocimiento/${idTipo}`, { method: "GET" })
}

// 🔹 POST - Crear nuevo tipo de conocimiento
export const useCrearTipoConocimiento = () => {
  const apiRequest = useApiRequest()
  return async ({ nombre }) =>
    await apiRequest(`tipos-conocimiento`, {
      method: "POST",
      body: JSON.stringify({ nombre }),
    })
}

// 🔹 PATCH - Actualizar un tipo de conocimiento
export const useActualizarTipoConocimiento = () => {
  const apiRequest = useApiRequest()
  return async (idTipo, { nombre }) =>
    await apiRequest(`tipos-conocimiento/${idTipo}`, {
      method: "PATCH",
      body: JSON.stringify({ nombre }),
    })
}

// 🔹 DELETE - Eliminar un tipo de conocimiento
export const useEliminarTipoConocimiento = () => {
  const apiRequest = useApiRequest()
  return async (idTipo) =>
    await apiRequest(`tipos-conocimiento/${idTipo}`, {
      method: "DELETE",
    })
}
