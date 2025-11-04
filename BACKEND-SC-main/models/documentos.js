import { sql } from "../connection.js";
const tableName = "Contenido";
const tableName2 = "ContenidoHTML";

export class ContenidoModel {
  static async crearBase({ titulo, descripcion, id_tipo, id_usuario }) {
    const request = new sql.Request();
    request.input("titulo", sql.NVarChar, titulo);
    request.input("descripcion", sql.NVarChar, descripcion || null);
    request.input("id_tipo", sql.Int, id_tipo);
    request.input("id_usuario", sql.Int, id_usuario);

    const query = `
      INSERT INTO ${tableName} (titulo, descripcion, id_tipo, id_usuario, fecha_creacion, almacenamiento)
      OUTPUT INSERTED.*
      VALUES (@titulo, @descripcion, @id_tipo, @id_usuario, GETDATE(), 'ARCHIVO')
    `;
    const result = await request.query(query);
    return result.recordset[0];
  }

  static async asignarArchivo({ id_contenido, url_archivo }) {
    const request = new sql.Request();
    request.input("id", sql.Int, id_contenido);
    request.input("url_archivo", sql.NVarChar, url_archivo);

    await request.query(`
      UPDATE ${tableName}
      SET url_archivo = @url_archivo
      WHERE id_contenido = @id
    `);
  }

  static async buscar({ query }) {
    const request = new sql.Request();
    request.input("query", sql.NVarChar, `%${query}%`);

    const result = await request.query(`
      SELECT * FROM ${tableName}
      WHERE titulo LIKE @query OR descripcion LIKE @query
      ORDER BY fecha_creacion DESC
    `);
    return result.recordset;
  }

  static async getByID({ id }) {
    const request = new sql.Request();
    request.input("id", sql.Int, id);
    const result = await request.query(
      `SELECT * FROM ${tableName} WHERE id_contenido = @id`
    );
    return result.recordset[0];
  }

  static async crearHTML({
    titulo,
    descripcion,
    id_tipo,
    id_usuario,
    almacenamiento,
    url_archivo,
    html,
    textoPlano,
  }) {
    const request = new sql.Request();
    request.input("titulo", sql.VarChar, titulo);
    request.input("descripcion", sql.Text, descripcion);
    request.input("id_tipo", sql.Int, id_tipo);
    request.input("id_usuario", sql.Int, id_usuario);
    request.input("almacenamiento", sql.VarChar, almacenamiento);
    request.input("url_archivo", sql.VarChar, url_archivo || null);
    request.input("html", sql.Text, html || null);
    request.input("textoPlano", sql.Text, textoPlano || null);

    await request.query(`
      INSERT INTO ${tableName2}
      (titulo, descripcion, id_tipo, id_usuario, fecha_creacion, almacenamiento, url_archivo, html, textoPlano)
      VALUES (@titulo, @descripcion, @id_tipo, @id_usuario, GETDATE(), @almacenamiento, @url_archivo, @html, @textoPlano)
    `);

    const result = await request.query(
      `SELECT TOP 1 * FROM ${tableName2} ORDER BY id_contenido DESC`
    );
    return result.recordset[0];
  }

  static async buscarHTML({ query }) {
    const request = new sql.Request();
    request.input("query", sql.VarChar, `%${query}%`);
    const result = await request.query(`
      SELECT * FROM ${tableName2}
      WHERE textoPlano LIKE @query OR html LIKE @query OR titulo LIKE @query
      ORDER BY fecha_creacion DESC
    `);
    return result.recordset;
  }

  static async getByIDHTML({ id }) {
    const request = new sql.Request();
    request.input("id", sql.Int, id);
    const result = await request.query(
      `SELECT * FROM ${tableName2} WHERE id_contenido = @id`
    );
    return result.recordset[0];
  }
  // static async actualizarHTML({
  //   id,
  //   titulo,
  //   descripcion,
  //   id_tipo,
  //   id_usuario,
  //   almacenamiento,
  //   url_archivo,
  //   html,
  //   textoPlano,
  // }) {
  //   const request = new sql.Request();
  //   request.input("id_contenido", sql.Int, id);
  //   request.input("titulo", sql.VarChar, titulo);
  //   request.input("descripcion", sql.NVarChar, descripcion || null);
  //   request.input("id_tipo", sql.Int, id_tipo);
  //   request.input("id_usuario", sql.Int, id_usuario);
  //   request.input("almacenamiento", sql.VarChar, almacenamiento);
  //   request.input("url_archivo", sql.NVarChar, url_archivo || null);
  //   request.input("html", sql.NVarChar, html || null);
  //   request.input("textoPlano", sql.NVarChar, textoPlano || null);

  //   const result = await request.query(`
  //   UPDATE ContenidoHTML
  //   SET
  //     titulo = @titulo,
  //     descripcion = @descripcion,
  //     id_tipo = @id_tipo,
  //     id_usuario = @id_usuario,
  //     almacenamiento = @almacenamiento,
  //     url_archivo = @url_archivo,
  //     html = @html,
  //     textoPlano = @textoPlano,
  //     fecha_creacion = GETDATE()
  //   WHERE id_contenido = @id_contenido
  // `);

  //   return result.rowsAffected[0] > 0;
  // }
  static async actualizarHTML({
    id_contenido,
    titulo,
    descripcion,
    url_archivo,
    html,
    textoPlano,
  }) {
    const request = new sql.Request();
    request.input("id_contenido", sql.Int, id_contenido);
    request.input("titulo", sql.VarChar, titulo);
    request.input("descripcion", sql.Text, descripcion);
    request.input("url_archivo", sql.VarChar, url_archivo || null);
    request.input("html", sql.Text, html);
    request.input("textoPlano", sql.Text, textoPlano);

    await request.query(`
    UPDATE ${tableName2}
    SET titulo = @titulo,
        descripcion = @descripcion,
        url_archivo = @url_archivo,
        html = @html,
        textoPlano = @textoPlano
    WHERE id_contenido = @id_contenido
  `);
  }

  static async listarHTML() {
    const result = await sql.query(`
    SELECT 
      id_contenido,
      titulo,
      descripcion,
      id_tipo,
      id_usuario,
      almacenamiento,
      url_archivo,
      fecha_creacion
    FROM ContenidoHTML
    ORDER BY fecha_creacion DESC
  `);
    return result.recordset;
  }
  static async obtenerHTML({ id }) {
    const request = new sql.Request();
    request.input("id_contenido", sql.Int, id);
    const result = await request.query(`
    SELECT id_contenido, titulo, descripcion, id_usuario, fecha_creacion, html
    FROM ${tableName2}
    WHERE id_contenido = @id_contenido
  `);
    return result.recordset[0];
  }
  static async eliminarHTML({ id }) {
    const request = new sql.Request();
    request.input("id_contenido", sql.Int, id);

    await request.query(`
    DELETE FROM ${tableName2}
    WHERE id_contenido = @id_contenido
  `);
  }
}
