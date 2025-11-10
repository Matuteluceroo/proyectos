import { sql } from "../connection.js";

export class CapacitacionModel {
  // 🔹 Obtener todas las capacitaciones activas
  static async getAll() {
    const result = await sql.query(`
      SELECT 
        C.id_capacitacion,
        C.nombre,
        C.descripcion,
        U.nombre AS creador,
        CONVERT(varchar, C.fecha_creacion, 103) AS fecha_creacion
      FROM Capacitaciones C
      JOIN Usuarios U ON U.id_Usuario = C.id_creador
      WHERE C.estado = 1
      ORDER BY C.fecha_creacion DESC;
    `);
    return result.recordset;
  }

  // 🔹 Obtener una capacitación con todos sus contenidos (archivos + HTML)
  static async getById(id) {
    const result = await sql.query(`
      SELECT 
        C.id_capacitacion,
        C.nombre,
        C.descripcion,
        C.fecha_creacion,
        CC.id_contenido,
        CC.tipo_origen,
        COALESCE(CA.titulo, CH.titulo) AS titulo,
        COALESCE(CA.descripcion, CH.descripcion) AS descripcion,
        COALESCE(CA.url_archivo, CH.url_archivo) AS url_archivo,
        COALESCE(TA.nombre, TH.nombre) AS tipoNombre,
        U.nombre AS autorNombre
      FROM Capacitaciones C
      LEFT JOIN Capacitacion_Contenido CC ON C.id_capacitacion = CC.id_capacitacion
      LEFT JOIN Contenido CA ON (CA.id_contenido = CC.id_contenido AND CC.tipo_origen = 'ARCHIVO')
      LEFT JOIN ContenidoHTML CH ON (CH.id_contenido = CC.id_contenido AND CC.tipo_origen = 'HTML')
      LEFT JOIN TiposConocimiento TA ON CA.id_tipo = TA.id_tipo
      LEFT JOIN TiposConocimiento TH ON CH.id_tipo = TH.id_tipo
      LEFT JOIN Usuarios U ON U.id_Usuario = COALESCE(CA.id_usuario, CH.id_usuario)
      WHERE C.id_capacitacion = ${id};
    `);
    return result.recordset;
  }

  // 🔹 Crear nueva capacitación con contenidos
  static async create({ nombre, descripcion, id_creador, contenidos }) {
    const request = new sql.Request();
    request.input("nombre", sql.NVarChar, nombre);
    request.input("descripcion", sql.NVarChar, descripcion);
    request.input("id_creador", sql.Int, id_creador);

    const res = await request.query(`
      INSERT INTO Capacitaciones (nombre, descripcion, id_creador)
      OUTPUT INSERTED.id_capacitacion
      VALUES (@nombre, @descripcion, @id_creador);
    `);

    const idCapacitacion = res.recordset[0].id_capacitacion;

    // Asociar contenidos
    for (const { id_contenido, tipo_origen } of contenidos || []) {
      const req = new sql.Request();
      req.input("id_capacitacion", sql.Int, idCapacitacion);
      req.input("id_contenido", sql.Int, id_contenido);
      req.input("tipo_origen", sql.VarChar, tipo_origen);
      await req.query(`
        INSERT INTO Capacitacion_Contenido (id_capacitacion, id_contenido, tipo_origen)
        VALUES (@id_capacitacion, @id_contenido, @tipo_origen);
      `);
    }

    return idCapacitacion;
  }

  // 🔹 Actualizar capacitación y sus contenidos
  static async update({ id, nombre, descripcion, contenidos }) {
    const req = new sql.Request();
    req.input("id", sql.Int, id);
    req.input("nombre", sql.NVarChar, nombre);
    req.input("descripcion", sql.NVarChar, descripcion);

    await req.query(`
      UPDATE Capacitaciones
      SET nombre = @nombre, descripcion = @descripcion
      WHERE id_capacitacion = @id;
    `);

    // Borrar y volver a asociar contenidos
    await sql.query(`
      DELETE FROM Capacitacion_Contenido WHERE id_capacitacion = ${id};
    `);

    for (const { id_contenido, tipo_origen } of contenidos || []) {
      const r = new sql.Request();
      r.input("id_capacitacion", sql.Int, id);
      r.input("id_contenido", sql.Int, id_contenido);
      r.input("tipo_origen", sql.VarChar, tipo_origen);
      await r.query(`
        INSERT INTO Capacitacion_Contenido (id_capacitacion, id_contenido, tipo_origen)
        VALUES (@id_capacitacion, @id_contenido, @tipo_origen);
      `);
    }

    return true;
  }

  // 🔹 Borrado lógico
  static async delete(id) {
    await sql.query(`
      UPDATE Capacitaciones SET estado = 0 WHERE id_capacitacion = ${id};
    `);
    return true;
  }
}
