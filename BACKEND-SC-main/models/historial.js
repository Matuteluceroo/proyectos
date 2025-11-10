import { sql } from "../connection.js";

export class HistorialModel {
  // ✅ Inserta una nueva consulta
  // static async registrarConsulta({ id_usuario, id_contenido }) {
  //   const query = `
  //     INSERT INTO HistorialConsultas (id_usuario, id_contenido, fecha_consulta)
  //     VALUES (@id_usuario, @id_contenido, GETDATE());
  //   `;
  //   const request = new sql.Request();
  //   request.input("id_usuario", sql.Int, id_usuario);
  //   request.input("id_contenido", sql.Int, id_contenido);
  //   const result = await request.query(query);
  //   return result.rowsAffected[0] > 0;
  // }
  static async registrarConsulta({
    id_usuario,
    id_contenido,
    tipo = "ARCHIVO",
  }) {
    try {
      if (!id_usuario || !id_contenido) {
        throw new Error("Datos incompletos para registrar historial");
      }

      const request = new sql.Request();
      request.input("id_usuario", sql.Int, id_usuario);
      request.input("id_contenido", sql.Int, id_contenido);

      if (tipo === "HTML") {
        await request.query(`
        INSERT INTO HistorialConsultasHTML (id_usuario, id_contenido, fecha_consulta)
        VALUES (@id_usuario, @id_contenido, GETDATE());
      `);
      } else {
        await request.query(`
        INSERT INTO HistorialConsultas (id_usuario, id_contenido, fecha_consulta)
        VALUES (@id_usuario, @id_contenido, GETDATE());
      `);
      }

      return true;
    } catch (err) {
      console.error("❌ Error en registrarConsulta:", err);
      throw err;
    }
  }

  // ✅ Obtiene todo el historial (útil para debug o dashboard)
  static async getAll() {
    const result = await sql.query(`
      SELECT TOP 1000 
          H.id_historial,
          H.id_usuario,
          H.id_contenido,
          H.fecha_consulta,
          U.nombre AS nombre_usuario,
          C.titulo AS titulo_contenido
      FROM HistorialConsultas H
      JOIN Usuarios U ON U.id_usuario = H.id_usuario
      JOIN Contenido C ON C.id_contenido = H.id_contenido
      ORDER BY H.fecha_consulta DESC;
    `);
    return result.recordset;
  }

  // ✅ Devuelve los 5 contenidos más consultados recientemente
  static async getTopConsultados() {
    const result = await sql.query(`
    SELECT TOP 5
      id_contenido, titulo, descripcion, autorNombre, tipoNombre, url_archivo,
      totalConsultas, ultimaConsulta, origen
    FROM (
      SELECT 
        C.id_contenido,
        C.titulo,
        C.descripcion,
        U.nombre AS autorNombre,
        T.nombre AS tipoNombre,
        C.url_archivo,
        COUNT(H.id_historial) AS totalConsultas,
        MAX(H.fecha_consulta) AS ultimaConsulta,
        'ARCHIVO' AS origen
      FROM HistorialConsultas H
      JOIN Contenido C ON C.id_contenido = H.id_contenido
      JOIN Usuarios U ON U.id_Usuario = C.id_usuario
      JOIN TiposConocimiento T ON T.id_tipo = C.id_tipo
      GROUP BY C.id_contenido, C.titulo, C.descripcion, U.nombre, T.nombre, C.url_archivo

      UNION ALL

      SELECT 
        CH.id_contenido,
        CH.titulo,
        CH.descripcion,
        U.nombre AS autorNombre,
        T.nombre AS tipoNombre,
        CH.url_archivo,
        COUNT(HH.id_historial) AS totalConsultas,
        MAX(HH.fecha_consulta) AS ultimaConsulta,
        'HTML' AS origen
      FROM HistorialConsultasHTML HH
      JOIN ContenidoHTML CH ON CH.id_contenido = HH.id_contenido
      JOIN Usuarios U ON U.id_Usuario = CH.id_usuario
      JOIN TiposConocimiento T ON T.id_tipo = CH.id_tipo
      GROUP BY CH.id_contenido, CH.titulo, CH.descripcion, U.nombre, T.nombre, CH.url_archivo
    ) AS combined
    ORDER BY ultimaConsulta DESC;
  `);
    return result.recordset;
  }
}
