import { sql } from '../connection.js'
const tableName = 'Compras'

export class ComprasModel {
  static async getAll() {
    // AQUI ANDAAAAAAAAAAAA
    const result = await sql.query(`SELECT 
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
      ON comp.idUsuario = us.id`); // Cambia según tu esquema
    return result.recordset; // Devuelve los usuarios
  }

  static async getListaKairos(filters) {
    try {
      const consulta = `SELECT 
    l.id as idLicitacion,
	  l.cliente,
	  l.fecha,
    l.nroLic,
	l.estado,
    r.idRenglon,
    r.renglon,
	  r.cantidad,
	  r.descripcion,
	  r.codigoTarot,
	  b.idKairos,
    b.laboratorio,
    b.nombre_comercial,
    b.droga_presentacion,
    b.ANMAT,
	  tc.costoFinal,
	  tc.mantenimiento,
	  tc.observaciones,
    tc.idUsuario,
    tc.idCompra,
    tc.fechora_comp,
    us.nombre as nombre_usuario
      FROM 
    Renglones r
      JOIN 
    Licitaciones l ON r.idLicitacion = l.id AND r.alternativo = 0
      JOIN 
    BaseKTC b ON r.codigoTarot = b.cod_tarot
	  LEFT JOIN
	    Compras tc ON r.idRenglon = tc.idRenglon and b.idKairos = tc.idKairos
	  LEFT JOIN 
	  Usuarios us ON tc.idUsuario = us.id 
    `

      if (filters) {
        //console.log("FILTERS: ",filters)
        const consultaConFiltros = consulta + " " + filters + " AND (l.estado = 'EN CURSO' OR l.estado = 'COTIZADO') ORDER BY nroLic"
        //console.log("CONSULTA CON FILTROS: ",consultaConFiltros)
        const result = await sql.query(consultaConFiltros)

        return result.recordset
      }
      const result = await sql.query(consulta + `WHERE l.estado = 'EN CURSO' OR l.estado = 'COTIZADO' ORDER BY nroLic`)
      return result.recordset
    } catch (error) {
      throw new Error(error.message)
    }
  }

  static async getByIDCompra({ idCompra }) {
    const request = new sql.Request();
    request.input('idCompra', sql.Int, idCompra);
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
     
      WHERE comp.idCompra = ${idCompra}
      ORDER BY CAST(reng.renglon AS INT) ASC;`);

      return result.recordset[0]; // Devuelve los resultados de la consulta
    } catch (error) {
      return null
    }
  }

  static async getByIDlicitacion({ idLicitacion }) {
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
      ORDER BY CAST(reng.renglon AS INT) ASC;`);

      return result.recordset; // Devuelve los resultados de la consulta
    } catch (error) {
      return null
    }
  }

  static async getCotizacionesHistoricasByIDlicitacion({ idLicitacion }) {
    const request = new sql.Request();
    request.input('idLicitacion', sql.Int, idLicitacion);
    try {
      // Usa la instancia request en lugar de sql.query
      const result = await request.query(`SELECT ren.idRenglon
		,ren.renglon
	  ,ren.descripcion
	  ,ktc.laboratorio

      ,comp.costoFinal
      ,comp.mantenimiento
      ,comp.observaciones
      
      ,comp.idCompra
	  ,us.nombre
      ,comp.fechora_comp
  FROM Compras as comp
  JOIN Usuarios as us ON us.id = comp.idUsuario
  LEFT JOIN BaseKTC as ktc ON ktc.idKairos = comp.idKairos
LEFT JOIN Renglones ren
ON ren.codigoTarot = comp.codTarot
WHERE ren.idLicitacion = @idLicitacion
ORDER BY CAST(renglon AS INT) ASC
		,fechora_comp DESC
;`);

      return result.recordset; // Devuelve los resultados de la consulta
    } catch (error) {
      return null
    }
  }

  static async getCotizacionesHistoricasByCodTarot({ codTarot }) {
    const request = new sql.Request();
    request.input('codTarot', sql.Int, codTarot);
    try {
      // Usa la instancia request en lugar de sql.query
      const result = await request.query(`SELECT  ktc.droga_presentacion
		,ktc.laboratorio
      ,comp.costoFinal
      ,comp.mantenimiento
      ,comp.observaciones
      
      ,comp.idCompra
	  ,us.nombre
      ,comp.fechora_comp
  FROM Compras as comp
  JOIN Usuarios as us ON us.id = comp.idUsuario
  LEFT JOIN BaseKTC as ktc ON ktc.idKairos = comp.idKairos
  WHERE comp.codTarot = @codTarot
  ORDER BY comp.fechora_comp DESC
  ;`);

      return result.recordset; // Devuelve los resultados de la consulta
    } catch (error) {
      return null
    }
  }

  static async getAllCotizacionesHistoricas() {
    const request = new sql.Request();

    try {
      // Usa la instancia request en lugar de sql.query
      const result = await request.query(`SELECT 
	  ktc.droga_presentacion
	  ,ktc.laboratorio

      ,comp.costoFinal
      ,comp.mantenimiento
      ,comp.observaciones
      
      ,comp.idCompra
	  ,us.nombre
      ,comp.fechora_comp
  FROM Compras as comp
  JOIN Usuarios as us ON us.id = comp.idUsuario
  LEFT JOIN BaseKTC as ktc ON ktc.idKairos = comp.idKairos
  ORDER BY fechora_comp DESC`);

      return result.recordset; // Devuelve los resultados de la consulta
    } catch (error) {
      return null
    }
  }

  static async getRenglonesNoAsociados(){
    const request = new sql.Request();

    try {
      // Usa la instancia request en lugar de sql.query
      const result = await request.query(`SELECT 
    l.id as idLicitacion,
	  l.cliente,
	  l.fecha,
    l.nroLic,
	l.estado,
    r.idRenglon,
    r.renglon,
	  r.cantidad,
	  r.descripcion,
	  r.codigoTarot,
	  r.descripcionTarot
      FROM 
    Renglones r
      JOIN 
    Licitaciones l ON r.idLicitacion = l.id AND r.alternativo = 0
      LEFT JOIN 
    BaseKTC b ON b.cod_tarot = r.codigoTarot
	  WHERE (l.estado = 'EN CURSO' OR l.estado = 'COTIZADO') AND b.idKairos is null
	  ORDER BY nroLic, CAST(r.renglon AS INT);
`);

      return result.recordset; // Devuelve los resultados de la consulta
    } catch (error) {
      return null
    }
  }

  static async crearCompra({ input }) {
    const { idRenglon, idLicitacion, idKairos, costoFinal, mantenimiento, observaciones, codTarot, idUsuario, fechora_comp } = input
    const request = new sql.Request();

    try {
      // Insertar un nuevo renglón en TalicomRenglones
      request.input('idRenglon', sql.Int, idRenglon); // renglon es de tipo varchar
      request.input('idLicitacion', sql.Int, idLicitacion); // idLicitacion es de tipo int
      request.input('idKairos', sql.Int, idKairos)
      request.input('costoFinal', sql.VarChar, costoFinal)
      request.input('mantenimiento', sql.VarChar, mantenimiento); // cantidad es de tipo varchar
      request.input('observaciones', sql.VarChar, observaciones); // descripcion es de tipo varchar
      request.input('codTarot', sql.VarChar, codTarot); // descripcion es de tipo varchar
      request.input('idUsuario', sql.VarChar, idUsuario); // descripcion es de tipo varchar
      request.input('fechora_comp', sql.VarChar, fechora_comp); // descripcion es de tipo varchar

      // tc.idUsuario

      // Realizamos la inserción en TalicomRenglones
      await request.query(`
            INSERT INTO ${tableName} 
            (idRenglon, idLicitacion, idKairos, costoFinal, mantenimiento, observaciones, codTarot, idUsuario, fechora_comp) 
            VALUES (@idRenglon, @idLicitacion, @idKairos, @costoFinal, @mantenimiento, @observaciones, @codTarot, @idUsuario, @fechora_comp)
        `);

      // Recuperar el renglón recién insertado (sin necesidad de pasar el idLicitacion, ya que es un dato proporcionado)
      const resultNuevo = await request.query(`
            SELECT TOP 1 * FROM ${tableName} ORDER BY idLicitacion DESC
        `);

      return resultNuevo.recordset[0]; // Devuelve el nuevo registro con id generado automáticamente

    } catch (e) {
      throw new Error('Error creating Compras record: ' + e.message);
    }
  }

  static async eliminarCompra({ idCompra }) {
    const request = new sql.Request();
    request.input('idCompra', sql.Int, idCompra);

    try {
      const resultExistente = await request.query(`
        SELECT * FROM ${tableName} WHERE idCompra = @idCompra
    `);

      if (resultExistente.recordset.length === 0) {
        return null
      }

      // Eliminar la licitación
      await request.query(`
            DELETE FROM ${tableName} WHERE idCompra = @idCompra
        `);

      return { message: 'Compra eliminada con éxito' };

    } catch (e) {
      throw new Error('Error al eliminar compra: ' + e.message);
    }
  }

  static async modificarCompra({ idCompra, input }) {
    const { idLicitacion, idKairos, renglon, costoFinal, mantenimiento, observaciones, codTarot, idUsuario, fechora_comp } = input;

    // Verificar si la licitación existe
    const request = new sql.Request();
    request.input('idCompra', sql.Int, idCompra);

    const resultExistente = await request.query(`
        SELECT * FROM ${tableName} WHERE idCompra = @idCompra
    `);

    if (resultExistente.recordset.length === 0) {
      throw new Error('Compra no encontrada');
    }

    try {
      // Actualizar solo los campos proporcionados
      if (idLicitacion) request.input('idLicitacion', sql.VarChar, idLicitacion);
      if (idKairos) request.input('idKairos', sql.VarChar, idKairos);
      if (renglon) request.input('renglon', sql.VarChar, renglon);
      if (costoFinal) request.input('costoFinal', sql.VarChar, costoFinal);
      if (mantenimiento) request.input('mantenimiento', sql.VarChar, mantenimiento);
      if (observaciones) request.input('observaciones', sql.VarChar, observaciones);
      if (codTarot) request.input('codTarot', sql.VarChar, codTarot);
      if (idUsuario) request.input('idUsuario', sql.VarChar, idUsuario);
      if (fechora_comp) request.input('fechora_comp', sql.VarChar, fechora_comp);


      // 
      // Crear la consulta de actualización
      let updateQuery = `
            UPDATE ${tableName} SET
        `;

      // Generar la parte dinámica de la consulta según los campos que se proporcionaron
      const setClauses = [];
      if (idLicitacion) setClauses.push("idLicitacion = @idLicitacion");
      if (idKairos) setClauses.push("idKairos = @idKairos");
      if (renglon) setClauses.push("renglon = @renglon");
      if (costoFinal) setClauses.push("costoFinal = @costoFinal");
      if (mantenimiento) setClauses.push("mantenimiento = @mantenimiento");
      if (observaciones) setClauses.push("observaciones = @observaciones");
      if (codTarot) setClauses.push("codTarot = @codTarot");
      if (idUsuario) setClauses.push("idUsuario = @idUsuario");
      if (fechora_comp) setClauses.push("fechora_comp = @fechora_comp");

      updateQuery += setClauses.join(", ") + " WHERE idCompra = @idCompra";

      // Ejecutar la consulta de actualización
      await request.query(updateQuery);

      // Recuperar la licitación actualizada
      const resultActualizado = await request.query(`
            SELECT * FROM ${tableName} WHERE idCompra = @idCompra
        `);

      return resultActualizado.recordset[0]; // Devuelve el registro actualizado

    } catch (e) {
      throw new Error('Error al actualizar la compra: ' + e.message);
    }
  }

  static async buscarUsuario({ idUsuario }) {
    const request = new sql.Request();
    request.input('idUsuario', sql.Int, idUsuario);
    try {
      // Usa la instancia request en lugar de sql.query
      const result = await request.query(`SELECT * FROM Usuarios where id = @idUsuario`);

      return result.recordset[0]; // Devuelve los resultados de la consulta
    } catch (error) {
      return null
    }
  }

  static async buscarRenglon({ idRenglon }) {
    const request = new sql.Request();
    request.input('idRenglon', sql.Int, idRenglon);
    try {
      // Usa la instancia request en lugar de sql.query
      const result = await request.query(`SELECT * FROM Renglones where idRenglon = @idRenglon`);

      return result.recordset[0]; // Devuelve los resultados de la consulta
    } catch (error) {
      return null
    }
  }

  static async buscarLicitacion({ idLicitacion }) {
    const request = new sql.Request();
    request.input('idLicitacion', sql.Int, idLicitacion);
    try {
      // Usa la instancia request en lugar de sql.query
      const result = await request.query(`SELECT * FROM Licitaciones where id = @idLicitacion`);

      return result.recordset[0]; // Devuelve los resultados de la consulta
    } catch (error) {
      return null
    }
  }

  static async buscarKairos({ idKairos }) {
    const request = new sql.Request();
    request.input('idKairos', sql.Int, idKairos);
    try {
      // Usa la instancia request en lugar de sql.query
      const result = await request.query(`SELECT * FROM BaseKTC where idKairos = @idKairos`);

      return result.recordset[0]; // Devuelve los resultados de la consulta
    } catch (error) {
      return null
    }
  }

}
