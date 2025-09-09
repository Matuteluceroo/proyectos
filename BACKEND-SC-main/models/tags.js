import { sql } from "../connection.js";

export class TagModel {
  static async buscarOCrear(nombre) {
    const request = new sql.Request();
    request.input("nombre", sql.NVarChar(100), nombre);

    // Buscar si existe
    let result = await request.query(`
      SELECT id_tag FROM Tags WHERE nombre = @nombre
    `);

    if (result.recordset.length > 0) {
      return result.recordset[0].id_tag;
    }

    // Crear si no existe
    result = await request.query(`
      INSERT INTO Tags (nombre)
      OUTPUT INSERTED.id_tag
      VALUES (@nombre)
    `);

    return result.recordset[0].id_tag;
  }

  static async asociarATcontenido(id_contenido, id_tag) {
    const request = new sql.Request();
    request.input("id_contenido", sql.Int, id_contenido);
    request.input("id_tag", sql.Int, id_tag);

    await request.query(`
      INSERT INTO Contenido_Tags (id_contenido, id_tag)
      VALUES (@id_contenido, @id_tag)
    `);
  }

  static async obtenerPorContenido(id_contenido) {
    const request = new sql.Request();
    request.input("id_contenido", sql.Int, id_contenido);

    const result = await request.query(`
      SELECT t.id_tag, t.nombre 
      FROM Contenido_Tags ct
      JOIN Tags t ON ct.id_tag = t.id_tag
      WHERE ct.id_contenido = @id_contenido
    `);

    return result.recordset;
  }
}
