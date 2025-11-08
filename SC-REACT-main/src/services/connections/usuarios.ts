import { url } from "./consts";
import { useApiRequest } from "./apiRequest";
export type Rol =
  | "LICITADOR"
  | "EMPLEADO"
  | "ADMINISTRADOR"
  | "EXPERTO"
  | "SIN_ROL";

// GET - Obtiene todos los usuarios
export const useObtenerUsuarios = () => {
  const apiRequest = useApiRequest();
  return async () => await apiRequest(`usuarios`, { method: "GET" });
};

// GET - Obtiene los usuarios en línea
export const useObtenerUsuariosEnLinea = () => {
  const apiRequest = useApiRequest();
  return async () => await apiRequest(`connected-users`, { method: "GET" });
};

// POST - Agrega un nuevo usuario
export const useAgregarUsuario = () => {
  const apiRequest = useApiRequest();
  return async ({
    userName,
    nombre,
    idZona,
    otros,
    rol,
  }: {
    userName: string;
    nombre: string;
    idZona: string;
    otros: string;
    rol: Rol;
  }) => {
    return await apiRequest(`usuarios`, {
      method: "POST",
      body: JSON.stringify({
        userName,
        nombre,
        idZona,
        otros,
        rol,
      }),
    });
  };
};

// DELETE - Elimina un usuario
export const useEliminarUsuario = () => {
  const apiRequest = useApiRequest();
  return async ({ idUsuario }: { idUsuario: number }) =>
    await apiRequest(`usuarios/${idUsuario}`, {
      method: "DELETE",
    });
};

// PATCH - Modifica un usuario
export const useModificarUsuario = () => {
  const apiRequest = useApiRequest();
  return async ({
    idUsuario,
    datos,
  }: {
    idUsuario: number;
    datos: {
      userName: string;
      nombre: string;
      idZona: string;
      otros: string;
      rol: Rol;
      id: number;
    };
  }) =>
    await apiRequest(`usuarios/${idUsuario}`, {
      method: "PATCH",
      body: JSON.stringify(datos),
    });
};

// PATCH - Cambia la contraseña de un usuario
export const useCambiarPassword = () => {
  const apiRequest = useApiRequest();
  return async ({
    idUsuario,
    userName,
    password,
    newPassword,
  }: {
    idUsuario: number;
    userName: string;
    password: string;
    newPassword: string;
  }) =>
    await apiRequest(`usuarios/change-password/${idUsuario}`, {
      method: "PATCH",
      body: JSON.stringify({
        userName,
        password,
        newPassword,
      }),
    });
};

// PATCH - Restablece la contraseña de un usuario
export const useRestartPassword = () => {
  const apiRequest = useApiRequest();
  return async ({ idUsuario }: { idUsuario: number }) =>
    await apiRequest(`usuarios/restart-password/${idUsuario}`, {
      method: "PATCH",
    });
};

export async function verificarLogin({
  userName,
  password,
}: {
  userName: string;
  password: string;
}) {
  const thisUrl = url.substring(0, url.length - 4);

  try {
    const response = await fetch(`${thisUrl}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userName, password }),
      credentials: "include", // Incluir cookies
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      console.error("Credenciales incorrectas");
      return null;
    }
  } catch (error) {
    console.error("Error al comunicarse con el servidor", error);
    return null;
  }
}

// POST - Agrega un nuevo rol al usuario
export const useAgregarRolUsuario = () => {
  const apiRequest = useApiRequest();
  return async ({ idUsuario, rol }: { idUsuario: number; rol: Rol }) =>
    await apiRequest(`usuarios/roles/${idUsuario}`, {
      method: "POST",
      body: JSON.stringify({ rol }),
    });
};

// DELETE - Elimina un rol del usuario
export const useEliminarRolUsuario = () => {
  const apiRequest = useApiRequest();
  return async ({ idUsuario, rol }: { idUsuario: number; rol: Rol }) =>
    await apiRequest(`usuarios/roles/${idUsuario}`, {
      method: "DELETE",
      body: JSON.stringify({ rol }),
    });
};

export const useEnviarImagenAlBackend = () => {
  const apiRequest = useApiRequest();
  return async ({
    base64Image,
    idUsuario,
  }: {
    base64Image: string;
    idUsuario: string;
  }) => {
    await apiRequest(`usuarios/guardar-foto`, {
      method: "POST",
      body: JSON.stringify({
        imagen: base64Image,
        idUsuario,
      }),
    });
  };
};
export const useObtenerImagenPerfil = () => {
  const apiRequest = useApiRequest();
  return async ({ idUsuario }: { idUsuario: string }) => {
    return await apiRequest(`usuarios/obtener-foto/${idUsuario}`, {
      method: "GET",
    });
  };
};
export const useEliminarFotoPerfil = () => {
  const apiRequest = useApiRequest();
  return async ({ idUsuario }: { idUsuario: string }) => {
    await apiRequest(`usuarios/eliminar-foto/${idUsuario}`, {
      method: "DELETE",
    });
  };
};
