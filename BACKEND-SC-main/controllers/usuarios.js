import { UsuarioModel } from "../models/usuarios.js";
import bcrypt from "bcrypt";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const connectedUsers = new Map(); // Usamos un Map para rastrear usuarios conectados

export class UsuarioController {
  static async getAll(req, res) {
    try {
      const usuarios = await UsuarioModel.getAll();

      if (usuarios.length === 0)
        return res.status(404).json({ mensaje: "No hay usuarios almacenados" });

      for (let i = 0; i < usuarios.length; i++) {
        const rolesDeUsuario = await UsuarioModel.getRolesDeUsuario({
          idUsuario: usuarios[i].id,
        });
        usuarios[i].rolesDeUsuario = rolesDeUsuario;
      }

      res.json(usuarios);
    } catch (e) {
      return res.status(404).json({ mensaje: "Ocurrió un error en Usuarios" });
    }
  }
  static async buscarUsuario(req, res) {
    const { userName } = req.params;
    try {
      if (!userName) return res.status(401).json({ mensaje: "Falta userName" });
      const usuario = await UsuarioModel.buscarUsuario({ userName });

      if (!usuario)
        return res
          .status(404)
          .json({ mensaje: `No existe el usuario ${userName}` });

      return res.json(usuario);
    } catch (e) {
      return res.status(404).json({ mensaje: "Ocurrió un error en Usuarios" });
    }
  }

  static async getById(req, res) {
    const { id } = req.params;
    try {
      const usuario = await UsuarioModel.getById({ id });

      if (usuario.length === 0)
        return res.status(404).json({ mensaje: `No hay usuario con id ${id}` });

      return res.json(usuario);
    } catch (e) {
      return res.status(404).json({ mensaje: "Ocurrió un error en Usuarios" });
    }
  }

  static async create(req, res) {
    const { userName, rol, nombre, tags, idZona } = req.body;

    try {
      const existingUser = await UsuarioModel.buscarUsuario({ userName });
      if (existingUser)
        return res
          .status(401)
          .json({ mensaje: `Usuario ${userName} ya existe` });

      if (!userName || !rol || !nombre) {
        return res.status(401).json({ mensaje: "Faltan campos obligatorios" });
      }

      const initialPassword = "SC_" + userName;

      const hashedPassword = await bcrypt.hash(initialPassword, 10);
      const newUsuario = await UsuarioModel.create({
        input: {
          userName,
          password: hashedPassword,
          rol,
          nombre,
          tags,
          idZona,
        },
      });

      if (!newUsuario) {
        return res.status(401).json({ mensaje: "Usuario no disponible" });
      }

      return res.status(201).json({ mensaje: "Usuario creado", newUsuario });
    } catch (e) {
      return res
        .status(404)
        .json({ mensaje: "Ocurrió un error en Usuarios", error: e.message });
    }
  }

  static async delete(req, res) {
    const { id } = req.params;
    console.log("delete", id);

    try {
      const result = await UsuarioModel.delete({ id });

      if (result === false) {
        return res.status(404).json({ mensaje: "Usuario no encontrado" });
      }

      return res.json({ mensaje: "Usuario eliminado" });
    } catch (e) {
      return res
        .status(404)
        .json({ mensaje: "Ocurrió un error en Usuarios", error: e.message });
    }
  }

  static async update(req, res) {
    const { id } = req.params;
    const { userName, rol, nombre, tags, idZona } = req.body;
    console.log("update", id, userName, rol, nombre, tags, idZona);
    if (!id) return res.status(401).json({ mensaje: "Falta ID" });

    try {
      const usuarioModificado = await UsuarioModel.update({
        id,
        input: { userName, rol, nombre, tags, idZona },
      });

      if (!usuarioModificado) {
        return res.status(404).json({ mensaje: "Usuario no encontrado" });
      }

      return res.json({ mensaje: "Usuario actualizado", usuarioModificado });
    } catch (error) {
      return res
        .status(401)
        .json({ mensaje: "Error en Usuarios", error: error.message });
    }
  }
  static async getTopTags(req, res) {
    try {
      const tags = await UsuarioModel.getTopTags();
      if (tags.length === 0)
        return res.status(404).json({ mensaje: "No hay tags disponibles" });
      return res.json(tags);
    } catch (e) {
      return res
        .status(500)
        .json({ mensaje: "Error al obtener tags", error: e.message });
    }
  }

  static async updatePassword(req, res) {
    const { id } = req.params;
    const { password, newPassword } = req.body;

    if (!password || !newPassword)
      return res.status(401).json({ mensaje: "Faltan campos obligatorios" });

    try {
      const usuario = await UsuarioModel.getById({ id });
      if (!usuario)
        return res.status(404).json({ mensaje: `El usuario no existe` });

      const hashedCurrentPassword = usuario.password;

      const passwordMatch = await bcrypt.compare(
        password,
        hashedCurrentPassword
      );
      if (!passwordMatch)
        return res.status(401).json({ mensaje: "Contraseña incorrecta" });

      const hashedNewPassword = await bcrypt.hash(newPassword, 10);

      const usuarioModificado = await UsuarioModel.updatePassword({
        id,
        input: { password: hashedNewPassword },
      });

      if (!usuarioModificado) {
        return res.status(404).json({ mensaje: "Usuario no encontrado" });
      }

      return res.json({ mensaje: "Usuario actualizado", usuarioModificado });
    } catch (e) {
      return res
        .status(404)
        .json({ mensaje: "Ocurrió un error en Usuarios", error: e.message });
    }
  }

  static async restartPassword(req, res) {
    const { id } = req.params;

    try {
      const usuario = await UsuarioModel.getById({ id });
      if (!usuario)
        return res.status(404).json({ mensaje: `El usuario no existe` });

      const initialPassword = "MPH_" + usuario.userName;
      const hashedPassword = await bcrypt.hash(initialPassword, 10);

      const usuarioModificado = await UsuarioModel.updatePassword({
        id,
        input: { password: hashedPassword },
      });

      if (!usuarioModificado) {
        return res.status(404).json({ mensaje: "Usuario no encontrado" });
      }

      return res.json({ mensaje: "Usuario actualizado", usuarioModificado });
    } catch (e) {
      return res
        .status(404)
        .json({ mensaje: "Ocurrió un error en Usuarios", error: e.message });
    }
  }

  static async agregarRolUsuario(req, res) {
    const { idUsuario } = req.params;
    const { rol } = req.body;

    if (!idUsuario || !rol)
      return res.status(401).json({ mensaje: "Faltan campos obligatorios" });

    try {
      const usuario = await UsuarioModel.getById({ id: idUsuario });
      if (!usuario)
        return res.status(404).json({ mensaje: `El usuario no existe` });
      const newRolUsuario = await UsuarioModel.agregarRolUsuario({
        input: { idUsuario, rol },
      });

      if (!newRolUsuario)
        return res
          .status(401)
          .json({ mensaje: "No pudo asociarse el rol al usuario" });

      return res.status(201).json({
        mensaje: "Nuevo rol asignado al usuario",
        asociacion: newRolUsuario,
      });
    } catch (e) {
      console.log("ERROR: ", e.message);
      return res
        .status(404)
        .json({ mensaje: "Ocurrió un error en Usuarios", error: e.message });
    }
  }

  static async eliminarRolUsuario(req, res) {
    const { idUsuario } = req.params;
    const { rol } = req.body;

    if (!idUsuario || !rol)
      return res.status(401).json({ mensaje: "Faltan campos obligatorios" });

    try {
      const newRolUsuario = await UsuarioModel.eliminarRolUsuario({
        input: { idUsuario, rol },
      });

      if (!newRolUsuario)
        return res
          .status(401)
          .json({ mensaje: "No pudo asociarse el rol al usuario" });

      return res
        .status(201)
        .json({ mensaje: "Rol eliminado", asociacion: newRolUsuario });
    } catch (e) {
      return res
        .status(404)
        .json({ mensaje: "Ocurrió un error en Usuarios", error: e.message });
    }
  }

  static async obtenerImagen(req, res) {
    try {
      const { idUsuario } = req.params;

      // Ruta base donde están las imágenes (si no hay env, devolver sin imagen)
      if (!process.env.RUTA_FOTO_PERFIL) {
        return res.json({
          idUsuario,
          extension: "none",
          imagen: null,
        });
      }

      const carpetaImagenes = path.resolve(process.env.RUTA_FOTO_PERFIL);

      // Buscar imagen con extensión conocida (puede ser .jpg o .png)
      const extensiones = [".jpg", ".jpeg", ".png"];
      let imagenEncontrada = null;

      for (const ext of extensiones) {
        const rutaImagen = path.join(
          carpetaImagenes,
          `usuario_${idUsuario}${ext}`
        );
        if (fs.existsSync(rutaImagen)) {
          imagenEncontrada = rutaImagen;
          break;
        }
      }

      if (!imagenEncontrada) {
        return res.json({
          idUsuario,
          extension: "none",
          imagen: null,
        });
        //return res.status(404).json({ mensaje: 'Imagen no encontrada' });
      }
      // Leer y codificar imagen en base64
      const imagenBuffer = fs.readFileSync(imagenEncontrada);
      const imagenBase64 = imagenBuffer.toString("base64");

      // Extraer extensión para que el frontend sepa el tipo
      const extension = path.extname(imagenEncontrada).slice(1);

      return res.json({
        idUsuario,
        extension,
        imagen: `data:image/${extension};base64,${imagenBase64}`,
      });
    } catch (error) {
      console.error("Error al obtener la imagen:", error);
      return res.status(500).json({ error: "Error interno del servidor" });
    }
  }

  static async subirImagen(req, res) {
    try {
      const { imagen, idUsuario } = req.body;

      if (!idUsuario)
        return res.status(400).json({ error: "ID de usuario requerido" });
      if (!imagen) return res.status(400).json({ error: "Imagen requerida" });

      const matches = imagen.match(/^data:image\/(jpeg|png);base64,(.+)$/);
      if (!matches) return res.status(400).json({ error: "Formato inválido" });

      const ext = matches[1];
      const data = matches[2];
      const buffer = Buffer.from(data, "base64");

      const uploadsDir =
        process.env.RUTA_FOTO_PERFIL || path.resolve("uploads/fotos");
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const fileName = `usuario_${idUsuario}.jpg`;
      const filePath = path.join(uploadsDir, fileName);

      // Escribimos la imagen al disco
      fs.writeFileSync(filePath, buffer);

      // Respuesta final
      return res.json({
        mensaje: "Foto de perfil actualizada",
        archivo: fileName,
      });
    } catch (err) {
      console.error("Error interno:", err);
      return res.status(500).json({ error: "Error interno del servidor" });
    }
  }

  static async eliminarImagen(req, res) {
    try {
      const { idUsuario } = req.params;

      const carpetaImagenes = path.join(process.env.RUTA_FOTO_PERFIL);
      const extensiones = [".jpg", ".jpeg", ".png"];
      let imagenEncontrada = null;

      for (const ext of extensiones) {
        const rutaImagen = path.join(
          carpetaImagenes,
          `usuario_${idUsuario}${ext}`
        );
        if (fs.existsSync(rutaImagen)) {
          imagenEncontrada = rutaImagen;
          break;
        }
      }

      if (!imagenEncontrada) {
        return res
          .status(404)
          .json({ mensaje: "Imagen no encontrada para eliminar" });
      }

      fs.unlinkSync(imagenEncontrada);

      return res.json({ mensaje: "Imagen eliminada correctamente" });
    } catch (error) {
      console.error("Error al eliminar la imagen:", error);
      return res
        .status(500)
        .json({ error: "Error interno al eliminar imagen" });
    }
  }
}
