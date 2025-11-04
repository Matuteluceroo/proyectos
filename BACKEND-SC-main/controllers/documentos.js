import { ContenidoModel } from "../models/documentos.js";
import path from "path";
import fs from "fs";
const basePath = process.env.RUTA_CONTENIDOS || "uploads"; // fallback

export class ContenidoController {
  static async crearConArchivo(req, res) {
    const { titulo, descripcion, id_tipo, id_usuario, tipo } = req.body;
    const archivo = req.file;

    if (!archivo || !titulo || !id_tipo || !id_usuario || !tipo) {
      return res.status(400).json({ mensaje: "Faltan datos obligatorios" });
    }

    try {
      // 1. Insertar metadatos
      const contenido = await ContenidoModel.crearBase({
        titulo,
        descripcion,
        id_tipo,
        id_usuario,
      });
      const idContenido = contenido.id_contenido;

      // 2. Definir carpeta según tipo
      let folder = path.join(basePath, "otros");
      if (tipo === "pdf") folder = path.join(basePath, "pdf");
      if (tipo === "imagen") folder = path.join(basePath, "imagenes");
      if (tipo === "video") folder = path.join(basePath, "videos");
      fs.mkdirSync(folder, { recursive: true });

      // 3. Armar nombre del archivo
      const ext = path.extname(archivo.originalname);
      const safeTitle = titulo.replace(/[^a-z0-9]/gi, "_").toLowerCase();
      const newFilename = `${idContenido}_${safeTitle}${ext}`;
      const newPath = path.join(folder, newFilename);

      // 4. Mover archivo desde tmp
      fs.renameSync(archivo.path, newPath);

      // 5. Generar URL relativa (por ej. para servir estático desde /contenidos)
      const url_archivo = `/contenidos/${tipo}/${newFilename}`;

      // 6. Actualizar BD
      await ContenidoModel.asignarArchivo({
        id_contenido: idContenido,
        url_archivo,
      });

      res.status(201).json({
        mensaje: "Contenido creado con archivo",
        id_contenido: idContenido,
        url_archivo,
      });
    } catch (error) {
      console.error("Error creando contenido:", error);
      res
        .status(500)
        .json({ mensaje: "Error creando contenido", error: error.message });
    }
  }

  static async buscar(req, res) {
    const { q } = req.query;
    try {
      const resultados = await ContenidoModel.buscar({ query: q || "" });
      res.json(resultados);
    } catch (error) {
      res
        .status(500)
        .json({ mensaje: "Error en la búsqueda", error: error.message });
    }
  }

  static async getByID(req, res) {
    const { id } = req.params;
    try {
      const doc = await ContenidoModel.getByID({ id });
      if (!doc) return res.status(404).json({ mensaje: "No encontrado" });
      res.json(doc);
    } catch (error) {
      res
        .status(500)
        .json({ mensaje: "Error al obtener documento", error: error.message });
    }
  }

  static async crearHTML(req, res) {
    const {
      titulo,
      descripcion,
      id_tipo,
      id_usuario,
      almacenamiento,
      url_archivo,
      html,
      textoPlano,
    } = req.body;
    console.log({
      titulo: titulo.length,
      almacenamiento: almacenamiento.length,
      url_archivo: url_archivo?.length,
      textoPlano: textoPlano?.length,
      html: html?.length,
    });
    if (!titulo || !id_tipo || !id_usuario || !almacenamiento) {
      return res.status(400).json({ mensaje: "Faltan campos obligatorios" });
    }

    try {
      const nuevo = await ContenidoModel.crearHTML({
        titulo,
        descripcion,
        id_tipo,
        id_usuario,
        almacenamiento,
        url_archivo,
        html,
        textoPlano,
      });
      return res
        .status(201)
        .json({ mensaje: "Contenido creado", contenido: nuevo });
    } catch (e) {
      return res
        .status(500)
        .json({ mensaje: "Error al crear contenido", error: e.message });
    }
  }

  static async buscarHTML(req, res) {
    const { q } = req.query;
    if (!q)
      return res.status(400).json({ mensaje: "Falta parámetro de búsqueda" });

    try {
      const resultados = await ContenidoModel.buscarHTML({ query: q });
      return res.json(resultados);
    } catch (e) {
      return res
        .status(500)
        .json({ mensaje: "Error en la búsqueda", error: e.message });
    }
  }

  static async getByIDHTML(req, res) {
    const { id } = req.params;
    try {
      const contenido = await ContenidoModel.getByIDHTML({ id });
      if (!contenido)
        return res.status(404).json({ mensaje: "Contenido no encontrado" });
      return res.json(contenido);
    } catch (e) {
      return res
        .status(500)
        .json({ mensaje: "Error al obtener contenido", error: e.message });
    }
  }
  static async actualizarHTML(req, res) {
    const { id } = req.params;
    const { titulo, descripcion, url_archivo, html, textoPlano } = req.body;

    try {
      await ContenidoModel.actualizarHTML({
        id_contenido: id,
        titulo,
        descripcion,
        url_archivo,
        html,
        textoPlano,
      });
      res.json({ mensaje: "Documento actualizado correctamente" });
    } catch (e) {
      res
        .status(500)
        .json({ mensaje: "Error al actualizar", error: e.message });
    }
  }

  // static async actualizarHTML(req, res) {
  //   const { id } = req.params;
  //   const {
  //     titulo,
  //     descripcion,
  //     id_tipo,
  //     id_usuario,
  //     almacenamiento,
  //     url_archivo,
  //     html,
  //     textoPlano,
  //   } = req.body;

  //   if (!titulo || !id_tipo || !id_usuario || !almacenamiento) {
  //     return res.status(400).json({ mensaje: "Faltan campos obligatorios" });
  //   }

  //   try {
  //     const actualizado = await ContenidoModel.actualizarHTML({
  //       id,
  //       titulo,
  //       descripcion,
  //       id_tipo,
  //       id_usuario,
  //       almacenamiento,
  //       url_archivo,
  //       html,
  //       textoPlano,
  //     });

  //     if (!actualizado)
  //       return res.status(404).json({ mensaje: "Contenido no encontrado" });

  //     res.status(200).json({ mensaje: "Contenido actualizado correctamente" });
  //   } catch (error) {
  //     console.error("Error al actualizar contenido:", error);
  //     res.status(500).json({ mensaje: "Error interno del servidor" });
  //   }
  // }
  static async listarHTML(req, res) {
    try {
      const resultados = await ContenidoModel.listarHTML();
      res.json(resultados);
    } catch (e) {
      console.error("Error al listar documentos HTML:", e);
      res.status(500).json({ mensaje: "Error interno del servidor" });
    }
  }
  static async obtenerHTML(req, res) {
    const { id } = req.params;
    try {
      const result = await ContenidoModel.obtenerHTML({ id });
      if (!result) return res.status(404).json({ mensaje: "No encontrado" });
      res.json(result); // devuelve todo el registro, no solo el html
    } catch (error) {
      res
        .status(500)
        .json({ mensaje: "Error al obtener contenido", error: error.message });
    }
  }
  static async eliminarHTML(req, res) {
    const { id } = req.params;

    if (!id)
      return res.status(400).json({ mensaje: "Falta el ID del contenido" });

    try {
      await ContenidoModel.eliminarHTML({ id });
      res.json({ mensaje: "✅ Contenido eliminado correctamente" });
    } catch (error) {
      console.error("❌ Error al eliminar contenido:", error);
      res
        .status(500)
        .json({
          mensaje: "Error al eliminar el contenido",
          error: error.message,
        });
    }
  }
}
