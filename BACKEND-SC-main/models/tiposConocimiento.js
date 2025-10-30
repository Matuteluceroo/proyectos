import { sql } from "../connection.js";
const tableName = "TiposConocimiento";

export class TiposConocimientoModel {
  static async getAll() {
    const result = await sql.query(`
      SELECT id_tipo, nombre
      FROM ${tableName}
      ORDER BY nombre ASC;
    `);
    return result.recordset;
  }

  static async getById({ id }) {
    const request = new sql.Request();
    request.input("id", sql.Int, id);
    const result = await request.query(`
      SELECT id_tipo, nombre
      FROM ${tableName}
      WHERE id_tipo = @id;
    `);
    return result.recordset[0];
  }

  static async create({ nombre }) {
    const request = new sql.Request();
    request.input("nombre", sql.VarChar, nombre);
    await request.query(`
      INSERT INTO ${tableName} (nombre)
      VALUES (@nombre);
    `);
    const nuevo = await sql.query(`SELECT TOP 1 * FROM ${tableName} ORDER BY id_tipo DESC;`);
    return nuevo.recordset[0];
  }

  static async update({ id, nombre }) {
    const request = new sql.Request();
    request.input("id", sql.Int, id);
    request.input("nombre", sql.VarChar, nombre);
    await request.query(`
      UPDATE ${tableName}
      SET nombre = @nombre
      WHERE id_tipo = @id;
    `);
    return true;
  }

  static async delete({ id }) {
    const request = new sql.Request();
    request.input("id", sql.Int, id);
    await request.query(`DELETE FROM ${tableName} WHERE id_tipo = @id;`);
    return true;
  }
}
