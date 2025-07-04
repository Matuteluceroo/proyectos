// models/user.js
import { sql } from '../connection.js'
const tableName = 'Licitaciones'

export class LicitacionModel {
  static async getAll() {
    const result = await sql.query(`SELECT [id]
      ,[cliente]
      ,[fecha]
      ,[nroLic]
      ,[tipo]
      ,[hora]
      ,[objeto]
      ,[estado]
      ,[codCliente]
	  ,cli.NOMBRE_PRO as provincia
	  ,cli.REGION as nombreZona
  FROM Licitaciones l
  JOIN Cliente_Provincia as cli
  ON cli.COD_CLIENT = l.codCliente
  ORDER BY fecha DESC;
  `)

    return result.recordset
  }

  static async getByID({ idLicitacion }) {
    try {
      const result = await sql.query(`SELECT [id]
      ,[cliente]
      ,[fecha]
      ,[nroLic]
      ,[tipo]
      ,[hora]
      ,[objeto]
      ,[estado]
      ,[codCliente]
	  ,cli.NOMBRE_PRO as provincia
	  ,cli.REGION as nombreZona
  FROM Licitaciones l
  LEFT JOIN Cliente_Provincia cli
  ON cli.COD_CLIENT = l.codCliente
   WHERE id = ${idLicitacion};`)

      return result.recordset[0]
    } catch (error) {
      //return null
      throw new Error('Error al obtener la licitación');
    }
  }

  static async verificarExistencia({ input }) {
    const { nroLic, codCliente, fecha } = input;

    try { // WHERE nroLic = ${nroLic} AND codCliente = ${codCliente} AND fecha = ${fecha};
      const result = await sql.query(`SELECT * FROM ${tableName} WHERE nroLic = ${nroLic} AND fecha = ${fecha}`)

      return result.recordset
    } catch (error) {
      //return null
      console.log("ERROR:", error);
      throw new Error('Error al obtener la licitación');
    }
  }

  static async create({ input }) {
    //console.log("INPUT:", input);
    const { codCliente, cliente, fecha, nroLic, tipo, hora, objeto, estado } = input;

    const request = new sql.Request();
    try {
      // Insertar la nueva licitación
      request.input('codCliente', sql.VarChar, codCliente);
      request.input('cliente', sql.VarChar, cliente);
      request.input('fecha', sql.Date, fecha);
      request.input('nroLic', sql.VarChar, nroLic);
      request.input('tipo', sql.VarChar, tipo);
      request.input('hora', sql.VarChar, hora);
      request.input('objeto', sql.VarChar, objeto);
      request.input('estado', sql.VarChar, estado)

      await request.query(`
            INSERT INTO ${tableName} 
            (codCliente, cliente, fecha, nroLic, tipo, hora, objeto, estado) 
            VALUES (@codCliente, @cliente, @fecha, @nroLic, @tipo, @hora, @objeto, @estado)
        `);

      // Recuperar la licitación recién insertada (sin necesidad de pasar el id, que es autoincremental)
      const resultNuevo = await request.query(`
            SELECT TOP 1 * FROM ${tableName} ORDER BY id DESC
        `);

      return resultNuevo.recordset[0]; // Devuelve el nuevo registro con id generado automáticamente

    } catch (e) {
      throw new Error('Error creating licitacion: ' + e.message);
    }
  }

  static async eliminarLicitacion({ idLicitacion }) {
    const request = new sql.Request();
    request.input('idLicitacion', sql.Int, idLicitacion);

    try {
      // Verificar si la licitación existe
      const resultExistente = await request.query(`SELECT * FROM ${tableName} WHERE id = @idLicitacion`);

      if (resultExistente.recordset.length === 0) return false;


      // Eliminar la licitación
      await request.query(`DELETE FROM Compras WHERE idLicitacion = @idLicitacion`);
      await request.query(`DELETE FROM Renglones WHERE idLicitacion = @idLicitacion`);
      await request.query(`DELETE FROM Usuario_Licitacion WHERE idLicitacion = @idLicitacion`);
      await request.query(`DELETE FROM ${tableName} WHERE id = @idLicitacion`);

      return true; // Devuelve true si se eliminó la licitación

    } catch (e) {
      throw new Error('Error deleting licitación: ' + e.message);
    }
  }

  static async modificarLicitacion({ idLicitacion, input }) {
    const { codCliente, cliente, fecha, nroLic, tipo, hora, objeto, estado } = input;

    // Verificar si la licitación existe
    const request = new sql.Request();
    request.input('idLicitacion', sql.Int, idLicitacion);

    const resultExistente = await request.query(`
        SELECT * FROM ${tableName} WHERE id = @idLicitacion
    `);

    if (resultExistente.recordset.length === 0) {
      throw new Error('Licitación no encontrada');
    }

    try {
      // Actualizar solo los campos proporcionados
      if (codCliente) request.input('codCliente', sql.VarChar, codCliente);
      if (cliente) request.input('cliente', sql.VarChar, cliente);
      if (fecha) request.input('fecha', sql.Date, fecha);
      if (nroLic) request.input('nroLic', sql.VarChar, nroLic);
      if (tipo) request.input('tipo', sql.VarChar, tipo);
      if (hora) request.input('hora', sql.VarChar, hora);
      if (objeto) request.input('objeto', sql.VarChar, objeto);
      if (estado) request.input('estado', sql.VarChar, estado);

      // Crear la consulta de actualización
      let updateQuery = `
            UPDATE ${tableName} SET
        `;

      // Generar la parte dinámica de la consulta según los campos que se proporcionaron
      const setClauses = [];
      if (codCliente) setClauses.push("codCliente = @codCliente");
      if (cliente) setClauses.push("cliente = @cliente");
      if (fecha) setClauses.push("fecha = @fecha");
      if (nroLic) setClauses.push("nroLic = @nroLic");
      if (tipo) setClauses.push("tipo = @tipo");
      if (hora) setClauses.push("hora = @hora");
      if (objeto) setClauses.push("objeto = @objeto");
      if (estado) setClauses.push("estado = @estado");

      updateQuery += setClauses.join(", ") + " WHERE id = @idLicitacion";

      // Ejecutar la consulta de actualización
      await request.query(updateQuery);

      // Recuperar la licitación actualizada
      const resultActualizado = await request.query(`
            SELECT * FROM ${tableName} WHERE id = @idLicitacion
        `);

      return resultActualizado.recordset[0]; // Devuelve el registro actualizado

    } catch (e) {
      console.log("ERROR: ", e.message)
      throw new Error('Error al actualizar la licitación: ' + e.message);
    }
  }

  static async obtenerLicitacionesUsuario({ idUsuario }) {
    const request = new sql.Request()
    request.input('idUsuario', sql.Int, idUsuario)

    try {
      const result = await request.query(`SELECT 
        l.id, l.cliente, l.fecha, l.nroLic, l.tipo, l.hora, l.objeto, l.estado, l.codCliente
        FROM Usuario_Licitacion u_l
        JOIN Licitaciones l 
        ON u_l.idLicitacion = l.id
        where u_l.idUsuario = @idUsuario
        ORDER BY fecha DESC;`)
      return result.recordset;
    } catch (error) {
      throw new Error('Error al obtener la licitación')
    }
  }

  static async obtenerUsuariosLicitacion({ idLicitacion }) {
    const request = new sql.Request();
    request.input('idLicitacion', sql.Int, idLicitacion);

    try {
      // Usa la instancia request en lugar de sql.query
      const result = await request.query(`SELECT 
		u.id, u.userName, u.nombre, u_r.rol
        FROM Usuario_Licitacion u_l
        JOIN Usuarios u 
			ON u_l.idUsuario = u.id
		JOIN Usuario_Rol u_r 
			ON u_r.idUsuario = u.id
        where u_l.idLicitacion = @idLicitacion`);

      return result.recordset; // Devuelve los resultados de la consulta
    } catch (error) {
      //return null
      throw new Error('Error al obtener la licitación');
    }
  }

  static async obtenerLicitadoresDeLicitacion({ idLicitacion }) {
    const request = new sql.Request();
    request.input('idLicitacion', sql.Int, idLicitacion);

    try {
      // Usa la instancia request en lugar de sql.query
      const result = await request.query(`SELECT 
	u.id, u.userName, u.rol, u.nombre, u_r.rol
    FROM Usuario_Licitacion u_l
    JOIN Usuarios u 
		ON u_l.idUsuario = u.id
	JOIN Usuario_Rol u_r
		ON u_r.idUsuario = u.id AND u_r.rol LIKE '%LICITADOR%'
    where u_l.idLicitacion = @idLicitacion
    ORDER BY u.nombre
    `);

      return result.recordset; // Devuelve los resultados de la consulta
    } catch (error) {
      //return null
      throw new Error('Error al obtener la licitación');
    }
  }

  static async getByIDZona({ idZona }) {
    const request = new sql.Request();

    try {
      let consulta = `SELECT 
    lic.id as idLicitacion,
    lic.cliente,
    lic.fecha,
    lic.nroLic,
    lic.tipo,
    lic.hora,
    lic.objeto,
    lic.estado,
    lic.codCliente,
    cli.REGION,
    cli.NOMBRE_PRO as provincia
FROM Licitaciones lic
LEFT JOIN Cliente_Provincia cli
      ON lic.codCliente = cli.COD_CLIENT`

      if (idZona !== "TODO") {
        request.input('idZona', sql.VarChar, idZona)
        consulta = consulta + `
          WHERE cli.REGION = @idZona
          ORDER BY fecha DESC`

        // Usa la instancia request en lugar de sql.query
        const result = await request.query(consulta)

        return result.recordset // Devuelve los resultados de la consulta
      } else {
        consulta = consulta + ` ORDER BY fecha DESC`
        const result = await request.query(consulta)

        return result.recordset
      }
    } catch (error) {
      //return null
      throw new Error('Error al obtener la licitación')
    }
  }

  static async getByProvincia({ provincia }) {
    const request = new sql.Request();
    request.input('provincia', sql.VarChar, provincia);

    try {
      const result = await request.query(`SELECT [id]
      ,[cliente]
      ,[fecha]
      ,[nroLic]
      ,[tipo]
      ,[hora]
      ,[objeto]
      ,[estado]
      ,[codCliente]
    FROM Cliente_Provincia as cli
    JOIN Licitaciones l
    ON l.codCliente = cli.COD_CLIENT
    WHERE cli.NOMBRE_PRO = @provincia
    ORDER BY fecha DESC;`);

      return result.recordset; // Devuelve los resultados de la consulta
    } catch (error) {
      //return null
      throw new Error('Error al obtener la licitación');
    }
  }

  static async obtenerRenglonesLicitacion({ idLicitacion }) {
    const request = new sql.Request()
    request.input('idLicitacion', sql.Int, idLicitacion)

    try {
      const result = await request.query(`SELECT * FROM Renglones 
WHERE idLicitacion = @idLicitacion 
ORDER BY CAST(renglon AS INT) ASC`);

      return result.recordset
    } catch (error) {
      console.error('Error al obtener la licitación:', error)
      throw new Error('Error al obtener la licitación')
    }
  }

  static async obtenerCotizacionesLicitacion({ idLicitacion }) {
    const request = new sql.Request();
    request.input('idLicitacion', sql.Int, idLicitacion);
    try {
      // Usa la instancia request en lugar de sql.query
      const result = await request.query(`SELECT 
      comp.idCompra, reng.idLicitacion, reng.idRenglon, reng.renglon, reng.cantidad, reng.descripcion, 
        comp.costoFinal, comp.mantenimiento, comp.observaciones, comp.fechora_comp,
        ktc.ANMAT, ktc.nombre_comercial, ktc.droga_presentacion, ktc.laboratorio, ktc.idKairos,
      us.nombre as modificadoPor
        FROM 
      Compras comp
      LEFT JOIN
        Renglones reng 
        ON reng.idRenglon = comp.idRenglon AND reng.alternativo = 0
      JOIN
        BaseKTC ktc
        ON 
      ktc.idKairos = comp.idKairos
      JOIN
      Usuarios us
      ON comp.idUsuario = us.id
     
      WHERE reng.idLicitacion = ${idLicitacion}
      ORDER BY CAST(renglon AS INT) ASC;`);

      //console.log(result.recordset)

      return result.recordset; // Devuelve los resultados de la consulta
    } catch (error) {
      return null
    }
  }

  static async obtenerRealesLicitacion({ idLicitacion }) {
    const request = new sql.Request();
    request.input('idLicitacion', sql.Int, idLicitacion);

    try {
      // Usa la instancia request en lugar de sql.query
      const result = await request.query(`
           SELECT ren.[idRenglon]
          ,ren.[idLicitacion]
          ,rea.idReal
          ,rea.laboratorio_real
          ,rea.cantidad_real
          ,rea.costo_real
          ,rea.precio_real
          FROM Renglones ren
          INNER JOIN Reales rea
          ON ren.idRenglon = rea.idRenglon
          WHERE ren.idLicitacion = @idLicitacion
          ORDER BY CAST(ren.renglon AS INT) ASC, rea.idReal
        `);

      return result.recordset;

    } catch (error) {
      console.error('Error al obtener valores reales:', error);
      throw new Error('Error al obtener valores reales');
    }
  }

}
