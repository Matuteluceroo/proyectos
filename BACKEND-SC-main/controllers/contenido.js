import path from "path";
import fs from "fs";
import { UsuarioModel } from "../models/usuarios.js";
import { ContenidoModel } from "../models/contenido.js";
import { TagModel } from "../models/tags.js";

export class ContenidoController {
  static async subirPDF(req, res) {
    return ContenidoController._guardar(req, res, "application/pdf");
  }

  static async subirVideo(req, res) {
    return ContenidoController._guardar(req, res, "video/");
  }

  static async subirImagen(req, res) {
    return ContenidoController._guardar(req, res, "image/");
  }

  static async _guardar(req, res, tipoEsperado) {
    try {
      const { titulo, descripcion, id_tipo, id_usuario } = req.body;
      const archivo = req.file;
      console.log("req.body", req.body);

      if (!archivo) {
        return res.status(400).json({ error: "No se subió ningún archivo" });
      }

      // Validar tipo
      if (
        (tipoEsperado === "application/pdf" &&
          archivo.mimetype !== "application/pdf") ||
        (tipoEsperado === "video/" && !archivo.mimetype.startsWith("video/")) ||
        (tipoEsperado === "image/" && !archivo.mimetype.startsWith("image/"))
      ) {
        return res.status(400).json({
          error: `Tipo de archivo inválido. Se esperaba ${tipoEsperado}`,
        });
      }

      // 1. Buscar id_usuario real
      const user = await UsuarioModel.buscarUsuario({ userName: id_usuario });
      if (!user) {
        return res.status(400).json({ error: "Usuario no encontrado" });
      }
      const idUser = user.id_Usuario;

      // 2. Crear registro en DB
      const idContenido = await ContenidoModel.crearContenido({
        titulo,
        descripcion,
        id_tipo,
        id_usuario: idUser,
      });

      // 3. Determinar carpeta según tipo
      let subCarpeta = "OTROS";
      if (tipoEsperado === "application/pdf") subCarpeta = "PDF";
      if (tipoEsperado === "video/") subCarpeta = "VIDEO";
      if (tipoEsperado === "image/") subCarpeta = "IMAGEN";

      const carpetaDestino = path.join(process.env.RUTA_CONTENIDOS, subCarpeta);

      // Crear carpeta si no existe
      if (!fs.existsSync(carpetaDestino)) {
        fs.mkdirSync(carpetaDestino, { recursive: true });
      }

      // 4. Renombrar archivo
      const extension = path.extname(archivo.originalname);
      const nuevoNombre = `${idContenido}-${titulo.replace(
        /\s+/g,
        "_"
      )}${extension}`;
      const rutaFinal = path.join(carpetaDestino, nuevoNombre);

      fs.renameSync(archivo.path, rutaFinal);

      // 5. Guardar la URL relativa en DB
      await ContenidoModel.actualizarUrlArchivo({
        id_contenido: idContenido,
        url_archivo: path.join(subCarpeta, nuevoNombre), // ej: "PDF/23-manual.pdf"
      });

      console.log("req.body.tags", req.body.tags);

      if (req.body.tags) {
        const listaTags = req.body.tags
          .split(";")
          .map((t) => t.trim())
          .filter(Boolean);

        for (const tag of listaTags) {
          const idTag = await TagModel.buscarOCrear(tag);
          await TagModel.asociarATcontenido(idContenido, idTag);
        }
      }
      // 6. Respuesta al cliente
      const tags = await TagModel.obtenerPorContenido(idContenido);

      return res.json({
        mensaje: "Contenido guardado correctamente",
        data: {
          id_contenido: idContenido,
          titulo,
          descripcion,
          id_tipo,
          id_usuario: idUser,
          archivo: nuevoNombre,
          ruta: rutaFinal,
          tags: tags.map((t) => t.nombre), // ["cosecha","herramientas","manual"]
        },
      });
    } catch (error) {
      console.error("Error al guardar contenido:", error);
      return res.status(500).json({ error: "Error interno del servidor" });
    }
  }


  static async listarContenidos(req, res) {
    try {
      const listado = await ContenidoModel.listarContenidos();

      if (listado.length === 0)
        return res.status(404).json({ mensaje: "No hay contenidos almacenados" });

      res.json(listado);
    } catch (e) {
      return res.status(404).json({ mensaje: "Ocurrió un error en la lista de contenidos" });
    }
  }
}
