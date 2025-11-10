import path from "path";
import fs from "fs";
import { UsuarioModel } from "../models/usuarios.js";
import { ContenidoModel } from "../models/contenido.js";
import { TagModel } from "../models/tags.js";

export class ContenidoController {
  static async subirPDF(req, res) {
    return ContenidoController._guardar(req, res, "application/pdf");
  }
  static async getTodos(req, res) {
    try {
      const result = await ContenidoModel.getTodos();
      res.json(result);
    } catch (error) {
      console.error("❌ Error en getTodos:", error);
      res
        .status(500)
        .json({
          mensaje: "Error al obtener todos los contenidos",
          error: error.message,
        });
    }
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
        return res
          .status(404)
          .json({ mensaje: "No hay contenidos almacenados" });

      res.json(listado);
    } catch (e) {
      return res
        .status(404)
        .json({ mensaje: "Ocurrió un error en la lista de contenidos" });
    }
  }

  static async listarArchivosPorId(req, res) {
    // 🔎 logs para ver qué llega
    console.log("[listarArchivosPorId] url:", req.originalUrl);
    console.log("[listarArchivosPorId] params:", req.params);
    console.log(
      "[listarArchivosPorId] headers.authorization:",
      req.headers?.authorization?.slice(0, 20) || "(no auth)"
    );

    // ✅ aceptar id como string (no forzar Number)
    const id = String(req.params.id ?? "").trim();

    if (!id) {
      console.warn("[listarArchivosPorId] id vacío/undefined");
      return res.status(400).json({ mensaje: "id inválido" });
    }

    try {
      const files = await ContenidoModel.findFilesById(
        id,
        ({ tipo, fileName }) =>
          `/api/contenidos/archivo/${tipo}/${encodeURIComponent(fileName)}`
      );
      return res.json({ id, files });
    } catch (e) {
      console.error("[listarArchivosPorId] error:", e);
      return res
        .status(500)
        .json({ mensaje: "Error al listar archivos", error: e.message });
    }
  }

  static async servirArchivo(req, res) {
    const { tipo, fileName } = req.params;
    try {
      await ContenidoModel.streamFile({ tipo, fileName, req, res });
      // La función ya escribe la respuesta (incluye Range si es video)
    } catch (e) {
      return res
        .status(404)
        .json({ mensaje: "Archivo no encontrado", error: e.message });
    }
  }

  // COSAS NUEVAS
  static async getAll(req, res) {
    try {
      const data = await ContenidoModel.getAll();
      if (data.length === 0)
        return res.status(404).json({ mensaje: "No hay contenidos" });
      return res.json(data);
    } catch (error) {
      return res
        .status(500)
        .json({ mensaje: "Error en getAll", error: error.message });
    }
  }

  // static async getById(req, res) {
  //   const { id } = req.params;
  //   try {
  //     const contenido = await ContenidoModel.getByIdNuevo({ id });
  //     if (!contenido) return res.status(404).json({ mensaje: "No encontrado" });
  //     return res.json(contenido);
  //   } catch (error) {
  //     return res
  //       .status(500)
  //       .json({ mensaje: "Error en getById", error: error.message });
  //   }
  // }
  static async getById(req, res) {
    const { id } = req.params;
    try {
      const contenido = await ContenidoModel.getByIdNuevo({ id });
      if (!contenido)
        return res.status(404).json({ mensaje: "Contenido no encontrado" });

      const rutaArchivo = path.join(
        process.env.RUTA_CONTENIDOS,
        contenido.url_archivo
      );
      const extension = path.extname(rutaArchivo).toLowerCase();
      const baseUrl = `${req.protocol}://${req.get("host")}`;

      // Si no existe el archivo físico
      if (!fs.existsSync(rutaArchivo)) {
        console.warn("⚠️ Archivo no encontrado:", rutaArchivo);
        return res.json({ ...contenido, url_completa: null });
      }

      // Detectar tipo y devolver según tamaño
      const stats = fs.statSync(rutaArchivo);
      const sizeMB = stats.size / (1024 * 1024);
      let url_completa = null;

      if ([".jpg", ".jpeg", ".png"].includes(extension) && sizeMB <= 5) {
        // 📸 Imagen chica → embebida base64
        const buffer = fs.readFileSync(rutaArchivo);
        const base64 = buffer.toString("base64");
        const tipo = extension.replace(".", "");
        url_completa = `data:image/${tipo};base64,${base64}`;
      } else if ([".mp4", ".mov", ".webm"].includes(extension)) {
        // 🎥 Video → URL directa
        const rutaNormalizada = contenido.url_archivo.replace(/\\/g, "/");
        console.log("url_completa", rutaNormalizada);
        const [tipoCarpeta, archivo] = rutaNormalizada.split("/");
        url_completa = `${baseUrl}/ver-contenido/${tipoCarpeta}/${archivo}`;
      } else if (extension === ".pdf") {
        // 📄 PDF → URL directa
        const rutaNormalizada = contenido.url_archivo.replace(/\\/g, "/");
        console.log("url_completa", rutaNormalizada);
        const [tipoCarpeta, archivo] = rutaNormalizada.split("/");
        url_completa = `${baseUrl}/ver-contenido/${tipoCarpeta}/${archivo}`;
      } else {
        // 📝 Texto u otros → descripción
        url_completa = null;
      }
      return res.json({ ...contenido, extension, url_completa });
    } catch (error) {
      console.error("❌ Error al obtener contenido:", error);
      return res.status(500).json({
        mensaje: "Error interno al obtener contenido",
        error: error.message,
      });
    }
  }

  static async create(req, res) {
    const { titulo, descripcion, id_tipo, id_usuario, url_archivo } = req.body;
    try {
      const nuevo = await ContenidoModel.create({
        input: { titulo, descripcion, id_tipo, id_usuario, url_archivo },
      });
      return res.status(201).json({ mensaje: "Contenido creado", nuevo });
    } catch (error) {
      return res
        .status(500)
        .json({ mensaje: "Error en create", error: error.message });
    }
  }

  static async delete(req, res) {
    const { id } = req.params;
    try {
      await ContenidoModel.delete({ id });
      return res.json({ mensaje: "Contenido eliminado" });
    } catch (error) {
      return res
        .status(500)
        .json({ mensaje: "Error en delete", error: error.message });
    }
  }

  static async update(req, res) {
    const { id } = req.params;
    const { titulo, descripcion, id_tipo, url_archivo } = req.body;
    console.log(id);
    console.log(titulo, descripcion, id_tipo, url_archivo);
    try {
      await ContenidoModel.update({
        id,
        input: { titulo, descripcion, id_tipo, url_archivo },
      });
      return res.json({ mensaje: "Contenido actualizado" });
    } catch (error) {
      return res
        .status(500)
        .json({ mensaje: "Error en update", error: error.message });
    }
  }
  // static async getUltimos(req, res) {
  //   try {
  //     const limite = parseInt(req.query.limite) || 5;
  //     const data = await ContenidoModel.getUltimos({ limite });
  //     if (!data || data.length === 0)
  //       return res.status(404).json({ mensaje: "No hay contenidos recientes" });
  //     return res.json(data);
  //   } catch (error) {
  //     return res.status(500).json({
  //       mensaje: "Error al obtener contenidos recientes",
  //       error: error.message,
  //     });
  //   }
  // }
  static async getUltimos(req, res) {
    try {
      const limite = parseInt(req.query.limite) || 5;
      const idUsuario = req.query.idUsuario
        ? parseInt(req.query.idUsuario)
        : null;
      const data = await ContenidoModel.getUltimos({ limite, idUsuario });
      if (!data || data.length === 0)
        return res.status(404).json({ mensaje: "No hay contenidos recientes" });
      return res.json(data);
    } catch (error) {
      return res.status(500).json({
        mensaje: "Error al obtener contenidos recientes",
        error: error.message,
      });
    }
  }

  static async buscar(req, res) {
    const { query } = req.params;
    const idUsuario = req.query.idUsuario
      ? parseInt(req.query.idUsuario)
      : null;
    try {
      const resultados = await ContenidoModel.buscar({ query, idUsuario });
      if (resultados.length === 0)
        return res.status(404).json({ mensaje: "Sin resultados" });
      return res.json(resultados);
    } catch (error) {
      return res
        .status(500)
        .json({ mensaje: "Error en búsqueda", error: error.message });
    }
  }
}
