import { sql } from '../connection.js'

export class LogisticaModel {

    static async crearHojaRuta({ input }) {
        const { redireccion, fecha_parte, fecha_entrega, descripcion_lote, id_conductor, nombre_transp, estado_entrega, observaciones, deposito } = input

        try {
            const request = new sql.Request()
            request.input("REDIRECCION", sql.Int, redireccion)
            request.input("FECHA_PARTE", sql.Date, fecha_parte)
            request.input("FECHA_ENTREGA", sql.Date, fecha_entrega)
            request.input("DESCRIPCION_LOTE", sql.NVarChar, descripcion_lote)
            request.input("id_conductor", sql.NVarChar, id_conductor)
            request.input("NOMBRE_TRANSP", sql.NVarChar, nombre_transp)
            request.input("ESTADO_ENTREGA", sql.NVarChar, estado_entrega)
            request.input("OBSERVACIONES", sql.NVarChar, observaciones || "")
            request.input("DEPOSITO", sql.NVarChar, deposito)


            const result = await request.query(`
            INSERT INTO PARTE_ENTREGA (
              FECHA_PARTE, FECHA_ENTREGA, DESCRIPCION_LOTE, REDIRECCION,
              id_conductor, NOMBRE_TRANSP, ESTADO_ENTREGA, OBSERVACIONES, DEPOSITO
            )
            OUTPUT INSERTED.NRO_HOJA_RUTA
            VALUES (
              @FECHA_PARTE, @FECHA_ENTREGA, @DESCRIPCION_LOTE, @REDIRECCION,
              @id_conductor, @NOMBRE_TRANSP, @ESTADO_ENTREGA, @OBSERVACIONES, @DEPOSITO
            )
          `)

            return result.recordset[0].NRO_HOJA_RUTA
        } catch (err) {
            console.log("ERROR: ", err.message)
            throw new Error("Error al crear la hoja de ruta")
        }
    }

    static async agregarRemitosAHoja({ nroHoja, remitos }) {
        try {
            for (const nro of remitos) {
                const request = new sql.Request()
                request.input("NRO_HOJA_RUTA", sql.Int, nroHoja)
                request.input("NRO_REMITO", sql.NVarChar, nro)
                await request.query(`
            INSERT INTO REMITO_PARTE (NRO_HOJA_RUTA, NRO_REMITO, ESTADO_REMITO)
            VALUES (@NRO_HOJA_RUTA, @NRO_REMITO, 'PENDIENTE')
            `)
            }
        } catch (err) {
            throw new Error("Error al guardar remitos asociados")
        }
    }

    static async obtenerPartesEntrega(deposito) {

        const request = new sql.Request()
        request.input("DEPOSITO", sql.NVarChar, deposito)

        const result = await request.query
            (`
            SELECT [NRO_HOJA_RUTA]
                ,[FECHA_PARTE]
                ,[FECHA_ENTREGA]
                ,[DESCRIPCION_LOTE]
                ,[id_conductor]
                ,[NOMBRE_TRANSP]
                ,[ESTADO_ENTREGA]
                ,[OBSERVACIONES]
                ,[DEPOSITO]
                FROM [PARTE_ENTREGA]
                WHERE DEPOSITO = @DEPOSITO
                ORDER BY 
                [FECHA_PARTE] DESC;
        `)

        return result.recordset
    }

    static async obtenerPartesEntregaByNro({ nro_hoja_ruta }) {
        const request = new sql.Request();
        request.input('nro_hoja_ruta', sql.Int, nro_hoja_ruta);

        try {
            // Verificar si la licitación existe
            const result = await request.query(`SELECT [NRO_HOJA_RUTA]
      ,[FECHA_PARTE]
      ,[FECHA_ENTREGA]
      ,[DESCRIPCION_LOTE]
      ,[id_conductor]
      ,[NOMBRE_TRANSP]
      ,[ESTADO_ENTREGA]
      ,[OBSERVACIONES]
      ,[DEPOSITO]
    FROM [PARTE_ENTREGA]
     WHERE nro_hoja_ruta = @nro_hoja_ruta`);
            return result.recordset

        } catch (e) {
            throw new Error('Error deleting parte: ' + e.message);
        }
    }

    static async obtenerConductores() {
        const result = await sql.query(`SELECT [id_conductor]
      ,[Descripcion]
      ,[Tipo]
  FROM [Conductores]

  ORDER BY id_conductor ASC
          `)

        return result.recordset
    }

    static async obtenerEstadoRemito() {
        const result = await sql.query(`SELECT 
            lr.fechaEnvio,
            lr.nroComprobante,
            lr.razonSocial,
            lr.codCliente,
            rp.ESTADO_REMITO AS estado,
            rp.NRO_SEGUIMIENTO AS nroSeguimiento,
            rp.OBSERVACIONES AS observaciones
        FROM Lista_Remitos lr
        INNER JOIN REMITO_PARTE rp ON lr.nroComprobante = rp.NRO_REMITO
        ORDER BY lr.fechaEnvio DESC;

          `)

        return result.recordset
    }

    static async obtenerRemitos() {
        const result = await sql.query(`SELECT [fechaEnvio]
      ,[nroComprobante]
      ,[codCliente]
      ,[razonSocial]
  FROM [Lista_Remitos]
  ORDER BY fechaEnvio DESC
          `)

        return result.recordset
    }

    static async obtenerRemitosPendientes() {
        const result = await sql.query(`SELECT TOP (1000)
    R.[fechaEnvio],
    R.[nroComprobante],
    R.[codCliente],
    R.[razonSocial]
FROM 
    [Lista_Remitos] R
WHERE 
    R.[nroComprobante] NOT IN (
        SELECT RP.[NRO_REMITO]
        FROM [REMITO_PARTE] RP
    )
ORDER BY 
    R.[fechaEnvio] DESC;
          `)

        return result.recordset
    }

    static async obtenerRemitosByParte({ nro_parte }) {
        try {

            const request = new sql.Request()
            request.input("nro_parte", sql.VarChar, nro_parte)
            const result = await request.query(`SELECT 
                rem.fechaEnvio,
                rem.nroComprobante,
                rem.codCliente,
                rem.razonSocial,
                r_m.NRO_SEGUIMIENTO,
                r_m.OBSERVACIONES
            FROM Lista_Remitos rem
            JOIN REMITO_PARTE r_m ON r_m.NRO_REMITO = rem.nroComprobante
            WHERE r_m.NRO_HOJA_RUTA = @nro_parte
            ORDER BY rem.fechaEnvio DESC;

      `)
            return result.recordset
        } catch (e) {
            throw new Error("Error al obtener Remitos");
        }
    }

    static async obtenerArticulosByRemito({ nro_remito }) {
        try {
            const request = new sql.Request()
            request.input("nro_remito", sql.VarChar, nro_remito)
            const result = await request.query(`SELECT 
            [Nro. comprobante] AS nroComprobante
            ,[Cód. cliente] AS codCliente
            ,[Razón social] AS razonSocial
            ,[Cód. artículo] AS codArticulo
            ,[Desc. artículo] AS descArticulo
            ,[Cantidad] AS cantidad
        FROM [dbo].[Articulos_Remitos_Extendida]
            WHERE [Nro. comprobante] = @nro_remito
          `)

            return result.recordset
        } catch (error) {
            return error
        }

    }

    static async eliminarParteEntrega({ nro_hoja_ruta }) {
        const request = new sql.Request();
        request.input('nro_hoja_ruta', sql.Int, nro_hoja_ruta);

        try {
            // Verificar si la licitación existe
            const resultExistente = await request.query(`SELECT * FROM PARTE_ENTREGA WHERE nro_hoja_ruta = @nro_hoja_ruta`);

            if (resultExistente.recordset.length === 0) return false;


            // Eliminar la licitación
            await request.query(`DELETE FROM PARTE_ENTREGA WHERE nro_hoja_ruta = @nro_hoja_ruta`);
            await request.query(`DELETE FROM REMITO_PARTE WHERE nro_hoja_ruta = @nro_hoja_ruta`);

            return true; // Devuelve true si se eliminó la licitación

        } catch (e) {
            throw new Error('Error deleting parte: ' + e.message);
        }
    }

    // static async getByRemito({ NRO_REMITO }) {
    //     const request = new sql.Request()
    //     request.input('NRO_REMITO', sql.Int, NRO_REMITO)

    //     try {
    //         const result = await request.query(`SELECT * FROM REMITO_PARTE WHERE NRO_REMITO = @NRO_REMITO`);

    //         return result.recordset[0]
    //     } catch (error) {
    //         throw new Error('Error al obtener Remito');
    //     }
    // }

    static async getByRemito({ NRO_REMITO }) {
        const request = new sql.Request();
        request.input('NRO_REMITO', sql.VarChar, NRO_REMITO);

        try {
            const result = await request.query(`SELECT * FROM REMITO_PARTE WHERE NRO_REMITO = @NRO_REMITO`);
            return result.recordset[0];
        } catch (error) {
            console.error("Error SQL en getByRemito:", error.message);
            throw new Error('Error al obtener Remito');
        }
    }

    static async modificarRemito({ NRO_REMITO, input }) {
        const request = new sql.Request();

        try {
            request.input('NRO_REMITO', sql.VarChar, NRO_REMITO);
            request.input('ESTADO_REMITO', sql.NVarChar, input.ESTADO_REMITO);

            const result = await request.query(`
            UPDATE REMITO_PARTE
            SET ESTADO_REMITO = @ESTADO_REMITO
            WHERE NRO_REMITO = @NRO_REMITO
        `);

            return result.rowsAffected[0] > 0;
        } catch (e) {
            throw new Error('Error al actualizar el remito: ' + e.message);
        }
    }

    static async actualizarNroSeguimiento({ nro_remito, nro_seguimiento }) {
        const request = new sql.Request();
        request.input("NRO_REMITO", sql.VarChar, nro_remito);
        request.input("NRO_SEGUIMIENTO", sql.VarChar, nro_seguimiento);

        try {
            const result = await request.query(`
      UPDATE REMITO_PARTE
      SET NRO_SEGUIMIENTO = @NRO_SEGUIMIENTO
      WHERE NRO_REMITO = @NRO_REMITO
    `);

            return result.rowsAffected[0] > 0;
        } catch (error) {
            throw new Error("Error al actualizar NRO_SEGUIMIENTO: " + error.message);
        }
    }

    static async actualizarObservacion({ nro_remito, observaciones }) {
        const request = new sql.Request();
        request.input("NRO_REMITO", sql.VarChar, nro_remito);
        request.input("OBSERVACIONES", sql.NVarChar, observaciones);

        try {
            const result = await request.query(`
      UPDATE REMITO_PARTE
      SET OBSERVACIONES = @OBSERVACIONES
      WHERE NRO_REMITO = @NRO_REMITO
    `);

            return result.rowsAffected[0] > 0;
        } catch (error) {
            throw new Error("Error al actualizar OBSERVACIONES: " + error.message);
        }
    }


}
