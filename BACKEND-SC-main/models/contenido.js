// models/contenido.js
import { sql } from "../connection.js";
const tableName = "Contenido";

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
      SELECT * FROM ${tableName} ORDER BY fecha_creacion DESC
    `);
    return result.recordset;
  }

  static async listarContenidos() {
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
      ORDER BY c.fecha_creacion DESC
    `);

    return result.recordset;
  }
}
