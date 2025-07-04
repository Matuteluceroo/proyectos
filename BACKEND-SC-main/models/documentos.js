import { sql } from '../connection.js';
const tableName = 'Documentos';

export class DocumentoModel {
  static async crear({ titulo, html, textoPlano, fechaCreacion, autor }) {
    const request = new sql.Request();
    request.input('titulo', sql.VarChar, titulo);
    request.input('html', sql.Text, html);
    request.input('textoPlano', sql.Text, textoPlano);
    request.input('fechaCreacion', sql.DateTime, fechaCreacion);
    request.input('autor', sql.Int, autor);

    await request.query(`
      INSERT INTO ${tableName} (titulo, html, textoPlano, fechaCreacion, autor)
      VALUES (@titulo, @html, @textoPlano, @fechaCreacion, @autor)
    `);

    const result = await request.query(`SELECT TOP 1 * FROM ${tableName} ORDER BY id DESC`);
    return result.recordset[0];
  }

  static async buscar({ query }) {
    const request = new sql.Request();
    request.input('query', sql.VarChar, `%${query}%`);
    const result = await request.query(`
      SELECT * FROM ${tableName}
      WHERE textoPlano LIKE @query
      ORDER BY fechaCreacion DESC
    `);
    return result.recordset;
  }

  static async getByID({ id }) {
    const request = new sql.Request();
    request.input('id', sql.Int, id);
    const result = await request.query(`SELECT * FROM ${tableName} WHERE id = @id`);
    return result.recordset[0];
  }
}
