// models/user.js
import { sql } from "../connection.js";
const tableName = "Usuarios";

export class UsuarioModel {
  static async getAll() {
    const result = await sql.query(`  SELECT [id_Usuario] AS id,
         [userName],
         [rol],
         [nombre],
         [otros],
         [idZona]
  FROM [Usuarios]
  WHERE estado = 1
  ORDER BY rol ASC, nombre ASC;`); // Cambia según tu esquema

    return result.recordset; // Devuelve los usuarios
  }

  static async getById({ id }) {
    const result = await sql.query(`
  SELECT * FROM ${tableName} 
  WHERE id_Usuario = '${id}' AND estado = 1;
`);

    return result.recordset[0];
  }

  static async buscarUsuario({ userName }) {
    const result = await sql.query(`
      SELECT id_Usuario, userName, rol, nombre, otros, idZona 
      FROM ${tableName} 
      WHERE userName = '${userName}' AND estado = 1;
    `);

    return result.recordset[0];
  }

  static async getRolesDeUsuario({ idUsuario }) {
    const request = new sql.Request();
    request.input("idUsuario", sql.Int, idUsuario);

    const result = await request.query(`
        SELECT * FROM Usuario_Rol WHERE idUsuario = @idUsuario
    `);

    return result.recordset;
  }

  static async create({ input }) {
    const { userName, password, rol, nombre, otros, idZona } = input;
    const request = new sql.Request();

    try {
      // Insertar un nuevo renglón en TalicomRenglones
      //request.input('id', sql.Int, newId); // idLicitacion es de tipo int
      request.input("userName", sql.VarChar, userName); // renglon es de tipo varchar
      request.input("password", sql.VarChar, password); // cantidad es de tipo varchar
      request.input("rol", sql.VarChar, rol); // descripcion es de tipo varchar
      request.input("nombre", sql.VarChar, nombre); // codigoTarot es de tipo varchar
      request.input("otros", sql.VarChar, otros); // codigoTarot es de tipo varchar
      request.input("idZona", sql.VarChar, idZona); // codigoTarot es de tipo varchar

      // Realizamos la inserción en TalicomRenglones
      await request.query(`
            INSERT INTO ${tableName} 
            ( userName, password, rol, nombre, otros, idZona ) 
            VALUES ( @userName, @password, @rol, @nombre, @otros, @idZona )
        `);

      // Recuperar el renglón recién insertado (sin necesidad de pasar el idLicitacion, ya que es un dato proporcionado)
      const resultNuevo = await request.query(`
            SELECT TOP 1 * FROM ${tableName} ORDER BY id_Usuario DESC
        `);

      return resultNuevo.recordset[0]; // Devuelve el nuevo registro con id generado automáticamente
    } catch (e) {
      throw new Error("Error creating Usuarios record: " + e.message);
    }
  }

  static async delete({ id }) {
    const request = new sql.Request();
    request.input("id_Usuario", sql.Int, id);

    const resultExistente = await request.query(`
        SELECT * FROM ${tableName} WHERE id_Usuario = @id_Usuario
    `);

    if (resultExistente.recordset.length === 0) {
      throw new Error("Usuario no encontrado");
    }

    try {
      // Eliminar la licitación
      await request.query(`
        UPDATE ${tableName} 
        SET estado = 0 
        WHERE id_Usuario = @id_Usuario
      `);

      return { message: "Usuario eliminado con éxito" };
    } catch (e) {
      throw new Error("Error al eliminar usuario: " + e.message);
    }
  }

  static async update({ id, input }) {
    const { userName, rol, nombre, otros, idZona } = input;
    const request = new sql.Request();

    try {
      // Actualizar solo los campos proporcionados

      request.input("id_Usuario", sql.Int, id);

      if (userName) request.input("userName", sql.VarChar, userName);
      if (rol) request.input("rol", sql.VarChar, rol);
      if (nombre) request.input("nombre", sql.VarChar, nombre);
      if (otros) request.input("otros", sql.VarChar, otros);
      if (idZona) request.input("idZona", sql.VarChar, idZona);

      // Crear la consulta de actualización
      let updateQuery = `
                UPDATE ${tableName} SET
            `;

      // Generar la parte dinámica de la consulta según los campos que se proporcionaron
      const setClauses = [];
      if (userName) setClauses.push("userName = @userName");
      if (rol) setClauses.push("rol = @rol");
      if (nombre) setClauses.push("nombre = @nombre");
      if (otros) setClauses.push("otros = @otros");
      if (idZona) setClauses.push("idZona = @idZona");

      updateQuery += setClauses.join(", ") + " WHERE id_Usuario = @id_Usuario";

      // Ejecutar la consulta de actualización
      await request.query(updateQuery);

      // Recuperar la licitación actualizada
      const resultActualizado = await request.query(`
                SELECT * FROM ${tableName} WHERE id_Usuario = @id_Usuario
            `);

      return resultActualizado.recordset[0];
    } catch (e) {
      throw new Error("Error creating Usuarios record: " + e.message);
    }
  }

  static async updatePassword({ id, input }) {
    const { password } = input;
    const request = new sql.Request();
    //console.log("INPUT:",input)
    //console.log("MOdels REQ: ",req.body)

    try {
      // Insertar un nuevo renglón en TalicomRenglones
      request.input("id_Usuario", sql.Int, id); // idLicitacion es de tipo int
      request.input("password", sql.VarChar, password); // renglon es de tipo varchar

      // Realizamos la modificacion en TalicomRenglones
      await request.query(`
      UPDATE Usuarios 
        SET password = @password
        WHERE id_Usuario = @id_Usuario;
        `);

      // Recuperar el renglón recién insertado (sin necesidad de pasar el idLicitacion, ya que es un dato proporcionado)
      const resultNuevo = await request.query(`
            SELECT TOP 1 * FROM Usuarios ORDER BY id_Usuario DESC
        `);

      return resultNuevo.recordset[0]; // Devuelve el nuevo registro con id generado automáticamente
    } catch (e) {
      throw new Error("Error creating Usuarios record: " + e.message);
    }
  }

  static async asociarUsuario({ input }) {
    const { idUsuario, idLicitacion } = input;
    const request = new sql.Request();

    try {
      request.input("idUsuario", sql.VarChar, idUsuario.toString());
      request.input("idLicitacion", sql.VarChar, idLicitacion.toString());

      const listaAnterior = await request.query(`
        SELECT TOP 1 * FROM Usuario_Licitacion WHERE idUsuario = @idUsuario AND idLicitacion = @idLicitacion ORDER BY idUsuario DESC
    `);
      if (listaAnterior.recordset.length > 0) return listaAnterior.recordset[0];

      await request.query(`
            INSERT INTO Usuario_Licitacion 
            ( idUsuario, idLicitacion ) 
            VALUES ( @idUsuario, @idLicitacion )
        `);

      const resultNuevo = await request.query(`
            SELECT TOP 1 * FROM Usuario_Licitacion ORDER BY idUsuario DESC
        `);

      return resultNuevo.recordset[0];
    } catch (e) {
      throw new Error("Error creating Usuarios record: " + e.message);
    }
  }

  static async obtenerLicitacionesUsuario({ id }) {
    const request = new sql.Request();
    request.input("id_Usuario", sql.Int, id);

    try {
      const result = await request.query(`SELECT 
        l.id_Usuario, l.cliente, l.fecha, l.nroLic, l.tipo, l.hora, l.objeto, l.estado, l.codCliente
        FROM Usuario_Licitacion u_l
        JOIN Licitaciones l 
        ON u_l.idLicitacion = l.id_Usuario
        where u_l.idUsuario = @id_Usuario`);
      return result.recordset;
    } catch (error) {
      throw new Error("Error al obtener la licitación");
    }
  }

  static async agregarRolUsuario({ input }) {
    const { idUsuario, rol } = input;
    const request = new sql.Request();

    try {
      request.input("idUsuario", sql.VarChar, idUsuario.toString());
      request.input("rol", sql.VarChar, rol.toString());

      await request.query(`
          INSERT INTO Usuario_Rol 
          ( idUsuario, rol ) 
          VALUES ( @idUsuario, @rol )
      `);

      const resultNuevo = await request.query(`
          SELECT * FROM Usuario_Rol Where idUsuario = @idUsuario ORDER BY idUsuario DESC 
      `);

      return resultNuevo.recordset;
    } catch (e) {
      throw new Error("Error creating Usuarios record: " + e.message);
    }
  }

  static async eliminarRolUsuario({ input }) {
    const { idUsuario, rol } = input;
    const request = new sql.Request();

    try {
      request.input("idUsuario", sql.VarChar, idUsuario.toString());
      request.input("rol", sql.VarChar, rol.toString());

      await request.query(`
          DELETE FROM Usuario_Rol WHERE idUsuario = @idUsuario AND rol = @rol
      `);

      return true;
    } catch (e) {
      throw new Error("Error creating Usuarios record: " + e.message);
    }
  }

  static async listarUsuarios() {}
}
