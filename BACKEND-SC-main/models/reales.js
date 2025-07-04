import { sql } from '../connection.js'

export class RealesModel {
    static async getAll() {
        const result = await sql.query(`SELECT ren.[idRenglon]
      ,ren.[idLicitacion]
      ,ren.[renglon]
      ,ren.[cantidad]
      ,ren.[descripcion]
      ,ren.[codigoTarot]
      ,ren.[laboratorio_elegido]
      ,ren.[costo_elegido]
      ,ren.[ANMAT]
      ,ren.[precio_vta]
      ,ren.[preganado]
      ,ren.[observaciones]
      ,ren.[margen]
      ,ren.[cantidad_ajustada]
      ,ren.[alternativo]
      ,ren.[nombre_comercial]
      ,ren.[observaciones_internas]
	  ,rea.idReal
	  ,rea.laboratorio_real
	  ,rea.cantidad_real
	  ,rea.costo_real
	  ,rea.precio_real
FROM Renglones ren
LEFT JOIN Reales rea
ON ren.idRenglon = rea.idRenglon
ORDER BY CAST(ren.renglon AS INT) ASC, rea.idReal`);

        return result.recordset;
    }

    static async getByIdLicitacion({ idLicitacion }) {
        const request = new sql.Request();
        request.input('idLicitacion', sql.Int, idLicitacion);

        try {
            // Usa la instancia request en lugar de sql.query
            const result = await request.query(`
               SELECT ren.[idRenglon]
      ,ren.[idLicitacion]
      ,ren.[renglon]
      ,ren.[cantidad]
      ,ren.[descripcion]
      ,ren.[codigoTarot]
      ,ren.[laboratorio_elegido]
      ,ren.[costo_elegido]
      ,ren.[ANMAT]
      ,ren.[precio_vta]
      ,ren.[preganado]
      ,ren.[observaciones]
      ,ren.[margen]
      ,ren.[cantidad_ajustada]
      ,ren.[alternativo]
      ,ren.[nombre_comercial]
      ,ren.[observaciones_internas]
	  ,rea.idReal
	  ,rea.laboratorio_real
	  ,rea.cantidad_real
	  ,rea.costo_real
	  ,rea.precio_real
        FROM Renglones ren
        LEFT JOIN Reales rea
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

    static async getByRenglon({ idRenglon }) {
        const request = new sql.Request();
        request.input('idRenglon', sql.Int, idRenglon);

        try {
            // Usa la instancia request en lugar de sql.query
            const result = await request.query(`
               SELECT ren.[idRenglon]
      ,ren.[idLicitacion]
      ,ren.[renglon]
      ,ren.[cantidad]
      ,ren.[descripcion]
      ,ren.[codigoTarot]
      ,ren.[laboratorio_elegido]
      ,ren.[costo_elegido]
      ,ren.[precio_vta]
      ,ren.[preganado]
	  ,rea.idReal
	  ,rea.laboratorio_real
	  ,rea.cantidad_real
	  ,rea.costo_real
	  ,rea.precio_real
        FROM Renglones ren
        JOIN Reales rea
        ON ren.idRenglon = rea.idRenglon
        WHERE ren.idRenglon = @idRenglon
        ORDER BY CAST(ren.renglon AS INT) ASC, rea.idReal
            `);

            return result.recordset;

        } catch (error) {
            console.error('Error al obtener valores reales:', error);
            throw new Error('Error al obtener valores reales');
        }
    }

    static async agregarNuevoReal({ input }) {
        const { idRenglon, cantidad_real, costo_real, precio_real, laboratorio_real } = input
        const request = new sql.Request()

        try {
            request.input('idRenglon', sql.Int, idRenglon)
            request.input('cantidad_real', sql.VarChar, cantidad_real)
            request.input('costo_real', sql.VarChar, costo_real)
            request.input('precio_real', sql.VarChar, precio_real)
            request.input('laboratorio_real', sql.VarChar, laboratorio_real)

            await request.query(`
            INSERT INTO Reales 
            (idRenglon, cantidad_real, costo_real, precio_real, laboratorio_real) 
            VALUES (@idRenglon, @cantidad_real, @costo_real, @precio_real, @laboratorio_real)
        `);

            const resultNuevo = await request.query(`
            SELECT TOP 1 * FROM Reales ORDER BY idReal DESC
        `);
            return resultNuevo.recordset[0]; // Devuelve el nuevo registro con id generado automáticamente
        } catch (e) {
            throw new Error('Error creating Compras record: ' + e.message);
        }
    }

    static async modificarReal({ idReal,input }) {
        const { idRenglon, cantidad_real, costo_real, precio_real, laboratorio_real } = input;

        console.log(input)

        // Verificar si la licitación existe
        const request = new sql.Request();
        request.input('idReal', sql.Int, idReal);

        const resultExistente = await request.query(`
            SELECT * FROM Reales WHERE idReal = @idReal
        `);

        if (resultExistente.recordset.length === 0) {
            throw new Error('Real no encontrado');
        }

        try {
            // Actualizar solo los campos proporcionados
            if (idRenglon) request.input('idRenglon', sql.Int, idRenglon);
            if (cantidad_real) request.input('cantidad_real', sql.VarChar, cantidad_real);
            if (costo_real) request.input('costo_real', sql.VarChar, costo_real);
            if (precio_real) request.input('precio_real', sql.VarChar, precio_real);
            if (laboratorio_real) request.input('laboratorio_real', sql.VarChar, laboratorio_real);

            // Crear la consulta de actualización
            let updateQuery = `
                UPDATE Reales SET
            `;

            // Generar la parte dinámica de la consulta según los campos que se proporcionaron
            const setClauses = [];
            if (idRenglon) setClauses.push("idRenglon = @idRenglon");
            if (cantidad_real) setClauses.push("cantidad_real = @cantidad_real");
            if (costo_real) setClauses.push("costo_real = @costo_real");
            if (precio_real) setClauses.push("precio_real = @precio_real");
            if (laboratorio_real) setClauses.push("laboratorio_real = @laboratorio_real");

            updateQuery += setClauses.join(", ") + " WHERE idReal = @idReal";

            // Ejecutar la consulta de actualización
            await request.query(updateQuery);

            // Recuperar la licitación actualizada
            const resultActualizado = await request.query(`
            SELECT * FROM Reales WHERE idReal = @idReal
        `);

            return resultActualizado.recordset[0]; // Devuelve el registro actualizado
        } catch (e) {
            console.log("ERROR: ",e.message)
            throw new Error('Error al actualizar la compra: ' + e.message);
        }
    }

    static async eliminarReal({ idReal }) {
        const request = new sql.Request();
        request.input('idReal', sql.Int, idReal);

        try {
            const resultExistente = await request.query(`
                SELECT * FROM Reales WHERE idReal = @idReal
            `);

            if (resultExistente.recordset.length === 0) {
                return null
            }

            // Eliminar la licitación
            await request.query(`
                DELETE FROM Reales WHERE idReal = @idReal
            `);

            return { message: 'Real eliminado con éxito' };
        } catch (e) {
            throw new Error('Error al eliminar Real: ' + e.message);
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

}
