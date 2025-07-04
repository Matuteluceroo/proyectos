import { sql } from '../connection.js'
const tableName = 'Renglones'

export class RenglonModel {
  static async getAll() {
    const result = await sql.query(`SELECT * FROM ${tableName}`); // Cambia según tu esquema

    return result.recordset; // Devuelve los usuarios
  }

  static async getByIDRenglon({ idRenglon }) {
    const request = new sql.Request()
    request.input('idRenglon', sql.Int, idRenglon)

    try {
      const result = await request.query(`SELECT * FROM ${tableName} WHERE idRenglon = @idRenglon`);

      return result.recordset[0]
    } catch (error) {
      throw new Error('Error al obtener la licitación');
    }
  }

  static async getByIDlicitacion({ id }) {
    const request = new sql.Request()
    request.input('id', sql.Int, id)

    try {
      // Usa la instancia request en lugar de sql.query
      const result = await request.query(`SELECT * FROM Renglones WHERE idLicitacion = @id ORDER BY CAST(renglon AS INT) ASC`);

      return result.recordset; // Devuelve los resultados de la consulta
    } catch (error) {
      console.error('Error al obtener la licitación:', error);
      throw new Error('Error al obtener la licitación');
    }
  }

  static async getRenglon({ idLicitacion, nroRenglon, alternativo = 0 }) {
    const request = new sql.Request()
    request.input('idLicitacion', sql.Int, idLicitacion)
    request.input('nroRenglon', sql.VarChar, nroRenglon)
    request.input('alternativo', sql.Int, alternativo)
    try {
      // Usa la instancia request en lugar de sql.query
      const result = await request.query(`SELECT * FROM ${tableName} WHERE idLicitacion = @idLicitacion AND renglon = @nroRenglon AND alternativo = @alternativo`)

      return result.recordset[0] // Devuelve los resultados de la consulta
    } catch (error) {
      throw new Error('Error al obtener la licitación');
    }
  }

  static async getLicitacion({ idLicitacion }) {
    const request = new sql.Request()
    request.input('idLicitacion', sql.Int, idLicitacion)

    try {
      const result = await request.query(`SELECT * FROM Licitaciones WHERE id = @idLicitacion`);

      return result.recordset[0]
    } catch (error) {
      throw new Error('Error al obtener la licitación');
    }
  }

  static async crearRenglonLicitacion({ input }) {
    const { idLicitacion, renglon, cantidad, descripcion, codigoTarot, descripcionTarot } = input
    const request = new sql.Request()

    try {
      request.input('idLicitacion', sql.Int, idLicitacion) // idLicitacion es de tipo int
      request.input('renglon', sql.VarChar, renglon) // renglon es de tipo varchar
      request.input('cantidad', sql.VarChar, cantidad) // cantidad es de tipo varchar
      request.input('descripcion', sql.VarChar, descripcion) // descripcion es de tipo varchar
      request.input('codigoTarot', sql.VarChar, codigoTarot) // codigoTarot es de tipo varchar
      request.input('descripcionTarot', sql.VarChar, descripcionTarot) // descripcionTarot es de tipo varchar
      request.input('alternativo', sql.Int, 0)

      await request.query(`
            INSERT INTO Renglones 
            (idLicitacion, renglon, cantidad, descripcion, codigoTarot, descripcionTarot, alternativo) 
            VALUES (@idLicitacion, @renglon, @cantidad, @descripcion, @codigoTarot, @descripcionTarot, @alternativo)
        `);

      // Recuperar el renglón recién insertado (sin necesidad de pasar el idLicitacion, ya que es un dato proporcionado)
      const resultNuevo = await request.query(`
            SELECT TOP 1 * FROM Renglones ORDER BY idRenglon DESC
        `);

      return resultNuevo.recordset[0]; // Devuelve el nuevo registro con id generado automáticamente

    } catch (e) {
      throw new Error('Error creating Renglones record: ' + e.message);
    }
  }

  static async crearAlternativo({ idLicitacion, renglonAlt }) {
    const { renglon, cantidad, descripcion, codigoTarot, descripcionTarot, laboratorio_elegido, costo_elegido, ANMAT, precio_vta, observaciones, margen, alternativo, nombre_comercial, observaciones_internas } = renglonAlt
    const request = new sql.Request()

    try {
      request.input('idLicitacion', sql.Int, idLicitacion) // idLicitacion es de tipo int
      request.input('renglon', sql.VarChar, renglon) // renglon es de tipo varchar
      request.input('cantidad', sql.VarChar, cantidad) // cantidad es de tipo varchar
      request.input('descripcion', sql.VarChar, descripcion) // descripcion es de tipo varchar
      request.input('codigoTarot', sql.VarChar, codigoTarot) // codigoTarot es de tipo varchar
      request.input('descripcionTarot', sql.VarChar, descripcionTarot) // descripcionTarot es de tipo varchar
      request.input('laboratorio_elegido', sql.VarChar, laboratorio_elegido || "") // codigoTarot es de tipo varchar
      request.input('costo_elegido', sql.VarChar, costo_elegido || "") // codigoTarot es de tipo varchar
      request.input('ANMAT', sql.VarChar, ANMAT || "") // codigoTarot es de tipo varchar
      request.input('precio_vta', sql.VarChar, precio_vta || "") // codigoTarot es de tipo varchar
      request.input('observaciones', sql.VarChar, observaciones || "") // codigoTarot es de tipo varchar
      request.input('margen', sql.VarChar, margen || "") // codigoTarot es de tipo varchar
      request.input('nombre_comercial', sql.VarChar, nombre_comercial || "") // codigoTarot es de tipo varchar
      request.input('alternativo', sql.Int, alternativo)
      request.input('observaciones_internas', sql.VarChar, observaciones_internas || "")


      await request.query(`
            INSERT INTO Renglones 
            (idLicitacion, renglon, cantidad, descripcion, codigoTarot, descripcionTarot, laboratorio_elegido, costo_elegido, ANMAT, precio_vta, observaciones, margen, alternativo, nombre_comercial, observaciones_internas ) 
            VALUES (@idLicitacion, @renglon, @cantidad, @descripcion, @codigoTarot, @descripcionTarot, @laboratorio_elegido, @costo_elegido, @ANMAT, @precio_vta, @observaciones, @margen, @alternativo, @nombre_comercial, @observaciones_internas )
        `);

      // Recuperar el renglón recién insertado (sin necesidad de pasar el idLicitacion, ya que es un dato proporcionado)
      const resultNuevo = await request.query(`
            SELECT TOP 1 * FROM Renglones ORDER BY idRenglon DESC
        `);

      return resultNuevo.recordset[0]; // Devuelve el nuevo registro con id generado automáticamente

    } catch (e) {
      throw new Error('Error creating Renglones record: ' + e.message);
    }
  }

  /* static async modificarRenglon({ idRenglon, input }) {
    const { renglon, cantidad, descripcion, codigoTarot, laboratorio_elegido, costo_elegido, ANMAT, precio_vta, observaciones, margen, alternativo, nombre_comercial, observaciones_internas } = input
    const request = new sql.Request()

    try {
      // Actualizar solo los campos proporcionados
      request.input('idRenglon', sql.Int, idRenglon);
      if (renglon) request.input('renglon', sql.VarChar, renglon);
      if (cantidad) request.input('cantidad', sql.VarChar, cantidad);
      if (descripcion) request.input('descripcion', sql.VarChar, descripcion);
      if (codigoTarot) request.input('codigoTarot', sql.VarChar, codigoTarot);
      if (laboratorio_elegido) request.input('laboratorio_elegido', sql.VarChar, laboratorio_elegido);
      if (costo_elegido) request.input('costo_elegido', sql.VarChar, costo_elegido);
      if (ANMAT) request.input('ANMAT', sql.VarChar, ANMAT);
      if (precio_vta) request.input('precio_vta', sql.VarChar, precio_vta);
      if (observaciones) request.input('observaciones', sql.VarChar, observaciones);
      if (margen) request.input('margen', sql.VarChar, margen);
      if (alternativo) request.input('alternativo', sql.Int, alternativo);
      if (nombre_comercial) request.input('nombre_comercial', sql.VarChar, nombre_comercial);
      if (observaciones_internas) request.input('observaciones_internas', sql.VarChar, observaciones_internas);


      // Crear la consulta de actualización
      let updateQuery = `
                UPDATE ${tableName} SET
            `;

      // Generar la parte dinámica de la consulta según los campos que se proporcionaron
      const setClauses = [];
      if (renglon) setClauses.push("renglon = @renglon");
      if (cantidad) setClauses.push("cantidad = @cantidad");
      if (descripcion) setClauses.push("descripcion = @descripcion");
      if (codigoTarot) setClauses.push("codigoTarot = @codigoTarot");
      if (laboratorio_elegido) setClauses.push("laboratorio_elegido = @laboratorio_elegido");
      if (costo_elegido) setClauses.push("costo_elegido = @costo_elegido");
      if (ANMAT) setClauses.push("ANMAT = @ANMAT");
      if (precio_vta) setClauses.push("precio_vta = @precio_vta");
      if (observaciones) setClauses.push("observaciones = @observaciones");
      if (margen) setClauses.push("margen = @margen");
      if (alternativo) setClauses.push("alternativo = @alternativo");
      if (nombre_comercial) setClauses.push("nombre_comercial = @nombre_comercial");
      if (observaciones_internas) setClauses.push("observaciones_internas = @observaciones_internas");


      updateQuery += setClauses.join(", ") + " WHERE idRenglon = @idRenglon";

      // Ejecutar la consulta de actualización
      await request.query(updateQuery);

      // Recuperar la licitación actualizada
      const resultActualizado = await request.query(`
                SELECT * FROM ${tableName} WHERE idRenglon = @idRenglon
            `);

      return resultActualizado.recordset[0]; // Devuelve el registro actualizado
    } catch (e) {
      throw new Error('Error al actualizar la licitación: ' + e.message);
    }
  } */

  static async modificarRenglon({ idRenglon, input }) {
    const request = new sql.Request();

    try {
      request.input('idRenglon', sql.Int, idRenglon);

      const fieldMap = {
        renglon: sql.VarChar,
        cantidad: sql.VarChar,
        descripcion: sql.VarChar,
        codigoTarot: sql.VarChar,
        descripcionTarot: sql.VarChar,
        laboratorio_elegido: sql.VarChar,
        costo_elegido: sql.VarChar,
        ANMAT: sql.VarChar,
        precio_vta: sql.VarChar,
        observaciones: sql.VarChar,
        margen: sql.VarChar,
        alternativo: sql.Int,
        nombre_comercial: sql.VarChar,
        observaciones_internas: sql.VarChar,
      };

      const setClauses = [];

      for (const [key, sqlType] of Object.entries(fieldMap)) {
        if (Object.prototype.hasOwnProperty.call(input, key)) {
          request.input(key, sqlType, input[key]);
          setClauses.push(`${key} = @${key}`);
        }
      }

      if (setClauses.length === 0) {
        throw new Error('No se proporcionaron campos para actualizar.');
      }

      const updateQuery = `
          UPDATE ${tableName}
          SET ${setClauses.join(', ')}
          WHERE idRenglon = @idRenglon
        `;

      await request.query(updateQuery);

      const resultActualizado = await request.query(`
          SELECT * FROM ${tableName} WHERE idRenglon = @idRenglon
        `);

      return resultActualizado.recordset[0];
    } catch (e) {
      throw new Error('Error al actualizar la licitación: ' + e.message);
    }
  }


  static async create({ input }) {
    const { idLicitacion, renglon, cantidad, descripcion, codigoTarot, descripcionTarot } = input
    const request = new sql.Request()

    try {
      // Insertar un nuevo renglón en TalicomRenglones
      request.input('idLicitacion', sql.Int, idLicitacion); // idLicitacion es de tipo int
      request.input('renglon', sql.VarChar, renglon); // renglon es de tipo varchar
      request.input('cantidad', sql.VarChar, cantidad); // cantidad es de tipo varchar
      request.input('descripcion', sql.VarChar, descripcion); // descripcion es de tipo varchar
      request.input('codigoTarot', sql.VarChar, codigoTarot); // codigoTarot es de tipo varchar
      request.input('descripcionTarot', sql.VarChar, descripcionTarot); // descripcionTarot es de tipo varchar
      request.input('preganado', sql.Int, 0)
      request.input('alternativo', sql.Int, 0)
      request.input('nombre_comercial', sql.VarChar, "")
      // Realizamos la inserción en TalicomRenglones
      await request.query(`
            INSERT INTO Renglones 
            (idLicitacion, renglon, cantidad, descripcion, codigoTarot, descripcionTarot, preganado, alternativo, nombre_comercial) 
            VALUES (@idLicitacion, @renglon, @cantidad, @descripcion, @codigoTarot, @descripcionTarot, @preganado, @alternativo, @nombre_comercial)
        `);

      // Recuperar el renglón recién insertado (sin necesidad de pasar el idLicitacion, ya que es un dato proporcionado)
      const resultNuevo = await request.query(`
            SELECT TOP 1 * FROM Renglones ORDER BY idLicitacion DESC
        `);

      return resultNuevo.recordset[0]; // Devuelve el nuevo registro con id generado automáticamente

    } catch (e) {
      throw new Error('Error creating Renglones record: ' + e.message);
    }
  }

  static async eliminarRenglon({ idRenglon }) {
    const request = new sql.Request();
    request.input('idRenglon', sql.Int, idRenglon);

    const resultExistente = await request.query(`
        SELECT * FROM ${tableName} WHERE idRenglon = @idRenglon
    `);

    if (resultExistente.recordset.length === 0) {
      throw new Error('Renglon no encontrado');
    }

    try {
      // Eliminar la licitación
      await request.query(`
            DELETE FROM ${tableName} WHERE idRenglon = @idRenglon
        `);

      return { message: 'Renglón eliminado con éxito' };

    } catch (e) {
      throw new Error('Error al eliminar renglon: ' + e.message);
    }
  }

  static async eliminarRenglonesLicitacion({ idLicitacion }) {
    const request = new sql.Request();
    request.input('idLicitacion', sql.Int, idLicitacion);

    try {
      // Eliminar la licitación
      await request.query(`
            DELETE FROM ${tableName} WHERE idLicitacion = @idLicitacion
        `);

      return { message: 'Renglones de la licitación eliminados con éxito' };

    } catch (e) {
      throw new Error('Error al eliminar renglones: ' + e.message);
    }
  }

  static async update({ input }) {
    const { id, renglon, cantidad, descripcion, codigoTarot, descripcionTarot } = input;
    const request = new sql.Request();

    try {
      // Insertar un nuevo renglón en TalicomRenglones
      request.input('idLicitacion', sql.Int, id); // idLicitacion es de tipo int
      request.input('renglon', sql.VarChar, renglon); // renglon es de tipo varchar
      request.input('cantidad', sql.VarChar, cantidad); // cantidad es de tipo varchar
      request.input('descripcion', sql.VarChar, descripcion); // descripcion es de tipo varchar
      request.input('codigoTarot', sql.VarChar, codigoTarot);
      request.input('descripcionTarot', sql.VarChar, descripcionTarot);

      await request.query(`
              UPDATE Renglones
                SET [renglon] = @renglon
                    ,[cantidad] = @cantidad
                    ,[descripcion] = @descripcion
                    ,[codigoTarot] = @codigoTarot
                    ,[descripcionTarot] = @descripcionTarot
                WHERE idLicitacion = @idLicitacion AND renglon = @renglon;
          `);

      // Recuperar el renglón recién insertado (sin necesidad de pasar el idLicitacion, ya que es un dato proporcionado)
      const resultNuevo = await request.query(`
              SELECT TOP 1 * FROM Renglones ORDER BY idLicitacion DESC
          `);

      return resultNuevo.recordset[0]; // Devuelve el nuevo registro con id generado automáticamente

    } catch (e) {
      throw new Error('Error creating TalicomRenglones record: ' + e.message);
    }
  }

  static async updateCostos({ input }) {
    const { id, renglon, laboratorio_elegido, costo_elegido, ANMAT, precio_vta, observaciones, margen, alternativo, nombre_comercial, observaciones_internas } = input;
    const request = new sql.Request();

    try {
      // Insertar un nuevo renglón en TalicomRenglones
      request.input('idLicitacion', sql.Int, id); // idLicitacion es de tipo int
      request.input('renglon', sql.VarChar, renglon); // renglon es de tipo varchar
      request.input('laboratorio_elegido', sql.VarChar, laboratorio_elegido); // cantidad es de tipo varchar
      request.input('costo_elegido', sql.VarChar, costo_elegido); // descripcion es de tipo varchar
      request.input('anmat', sql.VarChar, ANMAT); // descripcion es de tipo varchar
      request.input('precio_vta', sql.VarChar, precio_vta); // descripcion es de tipo varchar
      request.input('observaciones', sql.VarChar, observaciones)
      request.input('margen', sql.VarChar, margen)
      request.input('nombre_comercial', sql.VarChar, nombre_comercial)
      request.input('alternativo', sql.Int, alternativo)
      request.input('observaciones_internas', sql.VarChar, observaciones_internas)

      await request.query(`
              UPDATE Renglones
                SET [laboratorio_elegido] = @laboratorio_elegido
                    ,[costo_elegido] = @costo_elegido
                    ,[ANMAT] = @anmat
                    ,[precio_vta] = @precio_vta
                    ,[observaciones] = @observaciones
                    ,[margen] = @margen
                    ,[nombre_comercial] = @nombre_comercial
                    ,[alternativo] = @alternativo
                    ,[observaciones_internas] = @observaciones_internas
                WHERE idLicitacion = @idLicitacion AND renglon = @renglon AND alternativo = @alternativo;
          `);

      // Recuperar el renglón recién insertado (sin necesidad de pasar el idLicitacion, ya que es un dato proporcionado)
      const resultNuevo = await request.query(`
              SELECT TOP 1 * FROM Renglones ORDER BY idLicitacion DESC
          `);

      return resultNuevo.recordset[0]; // Devuelve el nuevo registro con id generado automáticamente

    } catch (e) {
      throw new Error('Error creating TalicomRenglones record: ' + e.message);
    }
  }

  static async createAlternativos({ input }) {
    const { idLicitacion, renglon, cantidad, descripcion, codigoTarot, descripcionTarot, laboratorio_elegido, costo_elegido, ANMAT, precio_vta, observaciones, margen, cantidad_ajustada, alternativo, nombre_comercial, observaciones_internas } = input;
    const request = new sql.Request();

    try {
      // Insertar un nuevo renglón en TalicomRenglones
      request.input('idLicitacion', sql.Int, idLicitacion); // idLicitacion es de tipo int
      request.input('renglon', sql.VarChar, renglon); // renglon es de tipo varchar
      request.input('cantidad', sql.VarChar, cantidad); // cantidad es de tipo varchar
      request.input('descripcion', sql.VarChar, descripcion); // descripcion es de tipo varchar
      request.input('codigoTarot', sql.VarChar, codigoTarot)
      request.input('descripcionTarot', sql.VarChar, descripcionTarot)
      request.input('laboratorio_elegido', sql.VarChar, laboratorio_elegido); // cantidad es de tipo varchar
      request.input('costo_elegido', sql.VarChar, costo_elegido); // descripcion es de tipo varchar
      request.input('anmat', sql.VarChar, ANMAT); // descripcion es de tipo varchar
      request.input('precio_vta', sql.VarChar, precio_vta); // descripcion es de tipo varchar
      request.input('preganado', sql.Int, 0)
      request.input('observaciones', sql.VarChar, observaciones)
      request.input('margen', sql.VarChar, margen)
      request.input('alternativo', sql.Int, alternativo)
      request.input('nombre_comercial', sql.VarChar, nombre_comercial)
      request.input('observaciones_internas', sql.VarChar, observaciones_internas)

      //observaciones_internas
      // Realizamos la inserción en TalicomRenglones
      await request.query(`
            INSERT INTO Renglones 
            (idLicitacion, renglon, cantidad, descripcion, codigoTarot, descripcionTarot, laboratorio_elegido, costo_elegido, ANMAT, precio_vta, preganado, observaciones, margen, alternativo, nombre_comercial, observaciones_internas ) 
            VALUES (@idLicitacion, @renglon, @cantidad, @descripcion, @codigoTarot, @descripcionTarot, @laboratorio_elegido, @costo_elegido, @ANMAT, @precio_vta, @preganado, @observaciones, @margen, @alternativo, @nombre_comercial, @observaciones_internas)
        `);

      // Recuperar el renglón recién insertado (sin necesidad de pasar el idLicitacion, ya que es un dato proporcionado)
      const resultNuevo = await request.query(`
            SELECT TOP 1 * FROM Renglones ORDER BY idLicitacion DESC
        `);

      return resultNuevo.recordset[0]; // Devuelve el nuevo registro con id generado automáticamente

    } catch (e) {
      throw new Error('Error creating Renglones record: ' + e.message);
    }
  }


  static async modificarPreganadoRenglon({ idRenglon, input }) {
    const { preganado, mes_estimado_entrega } = input
    const request = new sql.Request()

    try {
      // Actualizar solo los campos proporcionados
      request.input('idRenglon', sql.Int, idRenglon);
      request.input('preganado', sql.Int, preganado);
      request.input('mes_estimado_entrega', sql.VarChar, mes_estimado_entrega);

      // Crear la consulta de actualización
      let updateQuery = `
                UPDATE ${tableName} SET
            `;

      // Generar la parte dinámica de la consulta según los campos que se proporcionaron
      const setClauses = [];
      setClauses.push("preganado = @preganado");
      setClauses.push("mes_estimado_entrega = @mes_estimado_entrega");

      updateQuery += setClauses.join(", ") + " WHERE idRenglon = @idRenglon";

      // Ejecutar la consulta de actualización
      await request.query(updateQuery);


      return "resultActualizado.recordset[0]"; // Devuelve el registro actualizado
    } catch (e) {
      throw new Error('Error al actualizar la licitación: ' + e.message);
    }
  }

}


