// models/contenido.js
import { sql } from "../connection.js";
const tableName = "Contenido";
import fs from "fs";
import fsP from "fs/promises";
import path from "path";
import mime from "mime";
const BASE_DIR = process.env.RUTA_CONTENIDOS || "uploads";
const FOLDERS = {
  PDF: path.join(BASE_DIR, "PDF"),
  IMAGEN: path.join(BASE_DIR, "IMAGEN"),
  VIDEO: path.join(BASE_DIR, "VIDEO"),
};
const VALID_EXT = {
  PDF: [".pdf"],
  IMAGEN: [".jpg", ".jpeg", ".png", ".webp"],
  VIDEO: [".mp4", ".webm", ".mov", ".mkv"],
};

function assertTipo(tipo) {
  if (!Object.prototype.hasOwnProperty.call(FOLDERS, tipo)) {
    throw new Error("tipo inválido");
  }
}

export class ContenidoModel {
  static async crearContenido({ titulo, descripcion, id_tipo, id_usuario }) {
    const request = new sql.Request();
    request.input("titulo", sql.NVarChar(255), titulo);
    request.input("descripcion", sql.NVarChar(sql.MAX), descripcion);
    request.input("id_tipo", sql.Int, id_tipo);
    request.input("id_usuario", sql.Int, id_usuario);

    const result = await request.query(`
      INSERT INTO ${tableName} (titulo, descripcion, id_tipo, id_usuario, fecha_creacion)
      OUTPUT INSERTED.id_contenido
      VALUES (@titulo, @descripcion, @id_tipo, @id_usuario, GETDATE())
    `);

    return result.recordset[0].id_contenido;
  }

  static async actualizarUrlArchivo({ id_contenido, url_archivo }) {
    const request = new sql.Request();
    request.input("id_contenido", sql.Int, id_contenido);
    request.input("url_archivo", sql.NVarChar(500), url_archivo);

    await request.query(`
      UPDATE ${tableName}
      SET url_archivo = @url_archivo
      WHERE id_contenido = @id_contenido
    `);
  }

  static async getById({ id }) {
    const result = await sql.query(`
      SELECT * FROM ${tableName} WHERE id_contenido = ${id}
    `);
    return result.recordset[0];
  }

  static async listarTodos() {
    const result = await sql.query(`
  SELECT * FROM ${tableName}
  WHERE estado = 1
  ORDER BY fecha_creacion DESC
`);
    return result.recordset;
  }

  static async listarContenidos() {
    // listarContenidos
    const result = await sql.query(`
  SELECT 
    c.id_contenido AS id,
    c.titulo,
    c.descripcion,
    tc.nombre,
    u.userName AS autor
  FROM Contenido c
  JOIN Usuarios u ON c.id_usuario = u.id_Usuario
  JOIN TiposConocimiento tc ON c.id_tipo = tc.id_tipo
  WHERE c.estado = 1
  ORDER BY c.fecha_creacion DESC
`);

    return result.recordset;
  }
  static async findFilesById(id, makeUrl) {
    console.log("[findFilesById] baseDir:", BASE_DIR, "id:", id);
    const results = [];
    const idPrefix = `${id}-`.toLowerCase();

    const tipos = Object.keys(FOLDERS);
    await Promise.all(
      tipos.map(async (t) => {
        const tipo = t; // 'PDF' | 'IMAGEN' | 'VIDEO'
        const dir = FOLDERS[tipo];
        let entries = [];
        try {
          entries = await fsP.readdir(dir, { withFileTypes: true });
        } catch (e) {
          console.warn(`[findFilesById] no existe carpeta ${dir}`, e?.code);
          return;
        }

        for (const ent of entries) {
          if (!ent.isFile()) continue;
          const ext = path.extname(ent.name).toLowerCase();
          if (!VALID_EXT[tipo].includes(ext)) continue;

          const nameLc = ent.name.toLowerCase();
          if (!nameLc.startsWith(idPrefix)) continue;

          results.push({
            tipo,
            fileName: ent.name,
            absPath: path.join(dir, ent.name),
            url: makeUrl({ tipo, fileName: ent.name }),
          });
        }
      })
    );

    console.log("[findFilesById] encontrados:", results.length);
    return results;
  }

  static async streamFile({ tipo, fileName, req, res }) {
    assertTipo(tipo);
    // Evitar path traversal
    if (fileName.includes("..") || path.isAbsolute(fileName)) {
      throw new Error("nombre inválido");
    }
    const abs = path.join(FOLDERS[tipo], fileName);
    const stat = await fsP.stat(abs); // lanza si no existe
    const mimeType = mime.getType(abs) || "application/octet-stream";
    const isVideo = mimeType.startsWith("video/");

    res.setHeader("Content-Type", mimeType);
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${encodeURIComponent(fileName)}"`
    );

    if (!isVideo) {
      fs.createReadStream(abs).pipe(res);
      return;
    }

    // Soporte de Range para video
    const range = req.headers.range;
    if (!range) {
      res.setHeader("Content-Length", stat.size.toString());
      fs.createReadStream(abs).pipe(res);
      return;
    }

    const CHUNK_SIZE = 1 * 1024 * 1024;
    const [startStr, endStr] = range.replace(/bytes=/, "").split("-");
    const start = parseInt(startStr, 10);
    const end = Math.min(
      start + CHUNK_SIZE,
      endStr ? parseInt(endStr, 10) : stat.size - 1
    );

    res.status(206).set({
      "Content-Range": `bytes ${start}-${end}/${stat.size}`,
      "Accept-Ranges": "bytes",
      "Content-Length": end - start + 1,
      "Content-Type": mimeType,
    });

    fs.createReadStream(abs, { start, end }).pipe(res);
  }

  static async getAll() {
    const result = await sql.query(`
      SELECT 
        C.id_contenido AS id,
        C.titulo,
        C.descripcion,
        C.id_tipo,
        T.nombre AS tipoNombre,
        C.id_usuario,
        U.nombre AS autorNombre,
        CONVERT(varchar, C.fecha_creacion, 103) AS fecha_creacion,
        C.url_archivo
      FROM ${tableName} AS C
      LEFT JOIN TiposConocimiento AS T ON C.id_tipo = T.id_tipo
      LEFT JOIN Usuarios AS U ON C.id_usuario = U.id_Usuario
      ORDER BY C.fecha_creacion DESC;
    `);
    return result.recordset;
  }

  static async getByIdNuevo({ id }) {
    const result = await sql.query(`
  SELECT 
    C.id_contenido AS id,
    C.titulo,
    C.descripcion,
    C.id_tipo,
    T.nombre AS tipoNombre,
    C.id_usuario,
    U.nombre AS autorNombre,
    CONVERT(varchar, C.fecha_creacion, 103) AS fecha_creacion,
    C.url_archivo
  FROM ${tableName} AS C
  LEFT JOIN TiposConocimiento AS T ON C.id_tipo = T.id_tipo
  LEFT JOIN Usuarios AS U ON C.id_usuario = U.id_Usuario
  WHERE C.id_contenido = '${id}' AND C.estado = 1;
`);

    return result.recordset[0];
  }

  //   static async buscar({ query }) {
  //     const request = new sql.Request();
  //     request.input("query", sql.VarChar, `%${query}%`);

  //     const result = await request.query(`
  //   SELECT
  //     C.id_contenido AS id,
  //     C.titulo,
  //     C.descripcion,
  //     T.nombre AS tipoNombre,
  //     U.nombre AS autorNombre,
  //     C.fecha_creacion,
  //     C.url_archivo
  //   FROM ${tableName} AS C
  //   LEFT JOIN TiposConocimiento AS T ON C.id_tipo = T.id_tipo
  //   LEFT JOIN Usuarios AS U ON C.id_usuario = U.id_Usuario
  //   WHERE C.estado = 1
  //     AND (C.titulo LIKE @query OR C.descripcion LIKE @query OR T.nombre LIKE @query OR U.nombre LIKE @query)
  //   ORDER BY C.fecha_creacion DESC;
  // `);

  //     return result.recordset;
  //   }

  static async create({ input }) {
    const { titulo, descripcion, id_tipo, id_usuario, url_archivo } = input;
    const request = new sql.Request();
    request.input("titulo", sql.VarChar, titulo);
    request.input("descripcion", sql.VarChar, descripcion);
    request.input("id_tipo", sql.Int, id_tipo);
    request.input("id_usuario", sql.Int, id_usuario);
    request.input("url_archivo", sql.VarChar, url_archivo);

    await request.query(`
  INSERT INTO ${tableName} (titulo, descripcion, id_tipo, id_usuario, fecha_creacion, url_archivo, estado)
  VALUES (@titulo, @descripcion, @id_tipo, @id_usuario, GETDATE(), @url_archivo, 1);
`);

    const nuevo = await sql.query(
      `SELECT TOP 1 * FROM ${tableName} ORDER BY id_contenido DESC;`
    );
    return nuevo.recordset[0];
  }

  static async delete({ id }) {
    const request = new sql.Request();
    request.input("id", sql.Int, id);
    await request.query(`
  UPDATE ${tableName}
  SET estado = 0
  WHERE id_contenido = @id;
`);
    return true;
  }

  // static async update({ id, input }) {
  //   const { titulo, descripcion, id_tipo, url_archivo } = input;
  //   const request = new sql.Request();
  //   request.input("id", sql.Int, id);
  //   request.input("titulo", sql.VarChar, titulo);
  //   request.input("descripcion", sql.VarChar, descripcion);
  //   request.input("id_tipo", sql.Int, id_tipo);
  //   request.input("url_archivo", sql.VarChar, url_archivo);

  //   await request.query(`
  //     UPDATE ${tableName}
  //     SET titulo=@titulo,
  //         descripcion=@descripcion,
  //         id_tipo=@id_tipo,
  //         url_archivo=@url_archivo
  //     WHERE id_contenido=@id;
  //   `);
  //   return true;
  // }
  static async update({ id, input }) {
    const { titulo, descripcion, id_tipo } = input;
    const request = new sql.Request();
    request.input("id", sql.Int, id);

    // 🔹 1. Buscar datos actuales
    const resultActual = await sql.query(`
    SELECT titulo, descripcion, id_tipo, url_archivo
    FROM Contenido
    WHERE id_contenido = ${id};
  `);

    if (resultActual.recordset.length === 0) {
      throw new Error("Contenido no encontrado");
    }

    const actual = resultActual.recordset[0];
    const tituloActual = actual.titulo;
    const idTipoActual = actual.id_tipo;
    const urlArchivoActual = actual.url_archivo;

    // 🔹 2. Determinar la carpeta (por id_tipo)
    let subCarpeta = "OTROS";
    if (id_tipo == 1 || idTipoActual == 1) subCarpeta = "PDF";
    if (id_tipo == 2 || idTipoActual == 2) subCarpeta = "VIDEO";
    if (id_tipo == 3 || idTipoActual == 3) subCarpeta = "IMAGEN";

    const basePath = process.env.RUTA_CONTENIDOS;
    const carpetaDestino = path.join(basePath, subCarpeta);

    // 🔹 3. Obtener extensión actual del archivo
    const extension = path.extname(urlArchivoActual);
    const nuevoNombreArchivo = `${id}-${titulo.replace(
      /\s+/g,
      "_"
    )}${extension}`;
    const nuevaRutaRelativa = path.join(subCarpeta, nuevoNombreArchivo);
    const rutaVieja = path.join(basePath, urlArchivoActual);
    const rutaNueva = path.join(carpetaDestino, nuevoNombreArchivo);

    // 🔹 4. Renombrar físicamente el archivo (si existe)
    try {
      if (fs.existsSync(rutaVieja)) {
        fs.renameSync(rutaVieja, rutaNueva);
      } else {
        console.warn(
          "⚠️ Archivo físico no encontrado para renombrar:",
          rutaVieja
        );
      }
    } catch (err) {
      console.error("❌ Error al renombrar archivo:", err);
      throw new Error("Error al renombrar el archivo físico");
    }

    // 🔹 5. Actualizar la base de datos
    request.input("titulo", sql.VarChar, titulo || tituloActual);
    request.input(
      "descripcion",
      sql.VarChar,
      descripcion || actual.descripcion
    );
    request.input("id_tipo", sql.Int, id_tipo ?? idTipoActual);
    request.input("url_archivo", sql.VarChar, nuevaRutaRelativa);

    await request.query(`
    UPDATE Contenido
    SET titulo = @titulo,
        descripcion = @descripcion,
        id_tipo = @id_tipo,
        url_archivo = @url_archivo
    WHERE id_contenido = @id;
  `);

    return {
      mensaje: "Contenido actualizado",
      nuevoArchivo: nuevaRutaRelativa,
    };
  }

  // static async getUltimos({ limite = 5 } = {}) {
  //   const request = new sql.Request();
  //   request.input("limite", sql.Int, limite);

  //   const result = await request.query(`
  //   SELECT
  //     C.id_contenido AS id,
  //     C.titulo,
  //     C.descripcion,
  //     C.id_tipo,
  //     T.nombre AS tipoNombre,
  //     C.id_usuario,
  //     U.nombre AS autorNombre,
  //     CONVERT(varchar, C.fecha_creacion, 103) AS fecha_creacion,
  //     C.url_archivo
  //   FROM (
  //     SELECT *,
  //            ROW_NUMBER() OVER (PARTITION BY id_tipo ORDER BY fecha_creacion DESC) AS rn
  //     FROM Contenido
  //   ) AS C
  //   LEFT JOIN TiposConocimiento AS T ON C.id_tipo = T.id_tipo
  //   LEFT JOIN Usuarios AS U ON C.id_usuario = U.id_Usuario
  //   WHERE rn <= @limite
  //   ORDER BY C.id_tipo, C.fecha_creacion DESC;
  // `);

  //   // ✅ Agrupar manualmente por tipo
  //   const rows = result.recordset;
  //   const grupos = {};

  //   rows.forEach((r) => {
  //     if (!grupos[r.tipoNombre]) {
  //       grupos[r.tipoNombre] = { tipo: r.tipoNombre, items: [] };
  //     }
  //     grupos[r.tipoNombre].items.push({
  //       id: r.id,
  //       titulo: r.titulo,
  //       descripcion: r.descripcion,
  //       autorNombre: r.autorNombre,
  //       fecha_creacion: r.fecha_creacion,
  //       url_archivo: r.url_archivo,
  //     });
  //   });

  //   return Object.values(grupos); // devuelve [{tipo:"Manual", items:[...]}, ...]
  // }
  static async getUltimos({ limite = 5, idUsuario = null } = {}) {
    const request = new sql.Request();
    request.input("limite", sql.Int, limite);
    if (idUsuario) request.input("idUsuario", sql.Int, idUsuario);

    const queryContenido = `
    SELECT 
      C.id_contenido AS id,
      C.titulo,
      C.descripcion,
      C.id_tipo,
      T.nombre AS tipoNombre,
      C.id_usuario,
      U.nombre AS autorNombre,
      CONVERT(varchar, C.fecha_creacion, 103) AS fecha_creacion,
      C.url_archivo,
      'ARCHIVO' AS origen
    FROM (
      SELECT *,
             ROW_NUMBER() OVER (PARTITION BY id_tipo ORDER BY fecha_creacion DESC) AS rn
      FROM Contenido
      WHERE estado = 1
    ) AS C
    LEFT JOIN TiposConocimiento AS T ON C.id_tipo = T.id_tipo
    LEFT JOIN Usuarios AS U ON C.id_usuario = U.id_Usuario
    WHERE rn <= @limite
  `;

    const queryHTML = `
    SELECT 
      H.id_contenido AS id,
      H.titulo,
      H.descripcion,
      H.id_tipo,
      T.nombre AS tipoNombre,
      H.id_usuario,
      U.nombre AS autorNombre,
      CONVERT(varchar, H.fecha_creacion, 103) AS fecha_creacion,
      H.url_archivo,
      'HTML' AS origen
    FROM (
      SELECT *,
             ROW_NUMBER() OVER (PARTITION BY id_tipo ORDER BY fecha_creacion DESC) AS rn
      FROM ContenidoHTML
      WHERE estado = 1
    ) AS H
    LEFT JOIN TiposConocimiento AS T ON H.id_tipo = T.id_tipo
    LEFT JOIN Usuarios AS U ON H.id_usuario = U.id_Usuario
    WHERE rn <= @limite
  `;

    const queryTagsUsuario = idUsuario
      ? `
      UNION ALL
      SELECT 
        C.id_contenido AS id,
        C.titulo,
        C.descripcion,
        C.id_tipo,
        T.nombre AS tipoNombre,
        C.id_usuario,
        U.nombre AS autorNombre,
        CONVERT(varchar, C.fecha_creacion, 103) AS fecha_creacion,
        C.url_archivo,
        'TAG' AS origen
      FROM Contenido C
      JOIN Contenido_Tags CT ON C.id_contenido = CT.id_contenido
      JOIN Tags TG ON TG.id_tag = CT.id_tag
      JOIN UsuarioTags UT ON UT.tag = TG.nombre
      LEFT JOIN TiposConocimiento AS T ON C.id_tipo = T.id_tipo
      LEFT JOIN Usuarios AS U ON C.id_usuario = U.id_Usuario
      WHERE C.estado = 1
        AND UT.id_usuario = @idUsuario
    `
      : "";

    const queryFinal = `
    ${queryContenido}
    UNION ALL
    ${queryHTML}
    ${queryTagsUsuario}
    ORDER BY fecha_creacion DESC
  `;

    const result = await request.query(queryFinal);

    // Agrupar por tipo
    const grupos = {};
    result.recordset.forEach((r) => {
      const tipo = r.tipoNombre || "Sin tipo";
      if (!grupos[tipo]) grupos[tipo] = { tipo, items: [] };
      grupos[tipo].items.push(r);
    });

    return Object.values(grupos);
  }

  static async buscar({ query, idUsuario = null }) {
    const request = new sql.Request();
    request.input("query", sql.VarChar, `%${query}%`);
    if (idUsuario) request.input("idUsuario", sql.Int, idUsuario);

    const qContenido = `
    SELECT 
      C.id_contenido AS id,
      C.titulo,
      C.descripcion,
      T.nombre AS tipoNombre,
      U.nombre AS autorNombre,
      C.fecha_creacion,
      C.url_archivo,
      'ARCHIVO' AS origen
    FROM Contenido C
    LEFT JOIN TiposConocimiento T ON C.id_tipo = T.id_tipo
    LEFT JOIN Usuarios U ON C.id_usuario = U.id_Usuario
    WHERE C.estado = 1
      AND (
        C.titulo LIKE @query OR
        C.descripcion LIKE @query OR
        T.nombre LIKE @query OR
        U.nombre LIKE @query
      )
  `;

    const qHTML = `
    SELECT 
      H.id_contenido AS id,
      H.titulo,
      H.descripcion,
      T.nombre AS tipoNombre,
      U.nombre AS autorNombre,
      H.fecha_creacion,
      H.url_archivo,
      'HTML' AS origen
    FROM ContenidoHTML H
    LEFT JOIN TiposConocimiento T ON H.id_tipo = T.id_tipo
    LEFT JOIN Usuarios U ON H.id_usuario = U.id_Usuario
    WHERE H.estado = 1
      AND (
        H.titulo LIKE @query OR
        H.descripcion LIKE @query OR
        H.textoPlano LIKE @query OR
        T.nombre LIKE @query OR
        U.nombre LIKE @query
      )
  `;

    const qTags = idUsuario
      ? `
      UNION ALL
      SELECT 
        C.id_contenido AS id,
        C.titulo,
        C.descripcion,
        T.nombre AS tipoNombre,
        U.nombre AS autorNombre,
        C.fecha_creacion,
        C.url_archivo,
        'TAG' AS origen
      FROM Contenido C
      JOIN Contenido_Tags CT ON C.id_contenido = CT.id_contenido
      JOIN Tags TG ON CT.id_tag = TG.id_tag
      JOIN UsuarioTags UT ON UT.tag = TG.nombre
      LEFT JOIN TiposConocimiento T ON C.id_tipo = T.id_tipo
      LEFT JOIN Usuarios U ON C.id_usuario = U.id_Usuario
      WHERE C.estado = 1
        AND UT.id_usuario = @idUsuario
        AND (
          C.titulo LIKE @query OR
          C.descripcion LIKE @query OR
          TG.nombre LIKE @query
        )
    `
      : "";

    const queryFinal = `
    ${qContenido}
    UNION ALL
    ${qHTML}
    ${qTags}
    ORDER BY fecha_creacion DESC
  `;

    const result = await request.query(queryFinal);
    return result.recordset;
  }
  static async getTodos() {
    const result = await sql.query(`
    SELECT 
      C.id_contenido AS id,
      C.titulo,
      C.descripcion,
      C.url_archivo,
      T.nombre AS tipoNombre,
      U.nombre AS autorNombre,
      'ARCHIVO' AS origen
    FROM Contenido C
    LEFT JOIN TiposConocimiento T ON C.id_tipo = T.id_tipo
    LEFT JOIN Usuarios U ON C.id_usuario = U.id_Usuario
    WHERE C.estado = 1

    UNION ALL

    SELECT 
      H.id_contenido AS id,
      H.titulo,
      H.descripcion,
      H.url_archivo,
      T.nombre AS tipoNombre,
      U.nombre AS autorNombre,
      'HTML' AS origen
    FROM ContenidoHTML H
    LEFT JOIN TiposConocimiento T ON H.id_tipo = T.id_tipo
    LEFT JOIN Usuarios U ON H.id_usuario = U.id_Usuario
    WHERE H.estado = 1

    ORDER BY titulo;
  `);
    return result.recordset;
  }
}
