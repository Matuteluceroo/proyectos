// models/user.js
import { sql } from '../connection.js'
const tableName = 'BaseKTC'

export class KTCModel {
    static async getAll() {
        const result = await sql.query(`SELECT * FROM ${tableName};`);
        return result.recordset;
    }

    static async getByIdKairos({ idKairos }) {
        const request = new sql.Request();
        request.input('idKairos', sql.Int, idKairos);

        try {
            // Usa la instancia request en lugar de sql.query
            const result = await request.query(`SELECT * FROM ${tableName} WHERE idKairos = @idKairos`);

            return result.recordset[0]; // Devuelve los resultados de la consulta
        } catch (error) {
            throw new Error('Error al obtener la licitación');
        }
    }

    static async getByCodTarot({ codTarot }) {
        const request = new sql.Request();
        request.input('codTarot', sql.VarChar, codTarot);

        try {
            // Usa la instancia request en lugar de sql.query
            const result = await request.query(`SELECT * FROM ${tableName} WHERE cod_tarot = @codTarot`);
            return result.recordset; // Devuelve los resultados de la consulta
        } catch (error) {
            throw new Error('Error al obtener Kairos');
        }
    }

    static async getByCodTango({ codTango }) {
        const request = new sql.Request();
        const codTangoToSearch = `%${codTango}%`;
        request.input('codTango', sql.VarChar, codTangoToSearch);

        try {
            // Usa la instancia request en lugar de sql.query
            const result = await request.query(`SELECT * FROM ${tableName} WHERE codTango LIKE @codTango`);
            return result.recordset; // Devuelve los resultados de la consulta
        } catch (error) {
            throw new Error('Error al obtener Kairos');
        }
    }

    static async getByCodAnmat({ codAnmat }) {
        const request = new sql.Request();
        request.input('codAnmat', sql.VarChar, codAnmat);

        try {
            // Usa la instancia request en lugar de sql.query
            const result = await request.query(`SELECT * FROM ${tableName} WHERE ANMAT = @codAnmat`);

            return result.recordset; // Devuelve los resultados de la consulta
        } catch (error) {
            throw new Error('Error al obtener la licitación');
        }
    }

    /* static async getByCodKairos({ codKairos }) {
        const request = new sql.Request();
        request.input('codKairos', sql.VarChar, codKairos);

        try {
            // Usa la instancia request en lugar de sql.query
            const result = await request.query(`SELECT * FROM ${tableName} WHERE cod_kairos = @codKairos`);

            return result.recordset; // Devuelve los resultados de la consulta
        } catch (error) {
            throw new Error('Error al obtener la licitación');
        }
    } */

    static async getByCodKairos({ codKairos }) {
        const request = new sql.Request();
        request.input('codKairos', sql.VarChar, codKairos);

        try {
            // Usa la instancia request en lugar de sql.query
            const result = await request.query(`SELECT * FROM ${tableName} WHERE cod_kairos = @codKairos`);

            return result.recordset; // Devuelve los resultados de la consulta
        } catch (error) {
            throw new Error('Error al obtener la licitación');
        }
    }

    static async getByLaboratorio({ laboratorio }) {
        const request = new sql.Request();

        // Correcta forma de agregar los comodines para LIKE
        const labToSearch = `%${laboratorio}%`;

        request.input('laboratorio', sql.VarChar, labToSearch);

        try {
            const result = await request.query(
                `SELECT * FROM ${tableName} WHERE laboratorio COLLATE Modern_Spanish_CI_AS LIKE @laboratorio`
            );

            return result.recordset; // Devuelve los resultados de la consulta
        } catch (error) {
            throw new Error('Error al obtener la licitación');
        }
    }

    static async getByDroga({ droga_presentacion }) {
        const request = new sql.Request();

        // Correcta forma de agregar los comodines para LIKE
        const labToSearch = `%${droga_presentacion}%`;

        request.input('droga_presentacion', sql.VarChar, labToSearch);

        try {
            const result = await request.query(
                `SELECT * FROM ${tableName} WHERE droga_presentacion COLLATE Modern_Spanish_CI_AS LIKE @droga_presentacion`
            );

            return result.recordset; // Devuelve los resultados de la consulta
        } catch (error) {
            throw new Error('Error al obtener la licitación');
        }
    }

    static async agregarProductoKairos({ input }) {
        const { laboratorio, nombre_comercial, droga_presentacion, ANMAT, cod_tarot, cod_kairos, codTango } = input
        const request = new sql.Request();
        console.log(laboratorio, nombre_comercial, droga_presentacion, ANMAT, cod_tarot, cod_kairos, codTango)
        try {
            // Insertar un nuevo renglón en TalicomRenglones
            request.input('laboratorio', sql.VarChar, laboratorio)
            request.input('nombre_comercial', sql.VarChar, nombre_comercial || "")
            request.input('droga_presentacion', sql.VarChar, droga_presentacion || "")
            request.input('ANMAT', sql.VarChar, ANMAT || "")
            request.input('cod_tarot', sql.VarChar, cod_tarot || "")
            request.input('cod_kairos', sql.VarChar, cod_kairos || "")
            request.input('codTango', sql.VarChar, codTango || "")

            // Realizamos la inserción en TalicomRenglones
            await request.query(`
                INSERT INTO ${tableName} 
                (laboratorio, nombre_comercial, droga_presentacion, ANMAT, cod_tarot, cod_kairos, codTango) 
                VALUES (@laboratorio, @nombre_comercial, @droga_presentacion, @ANMAT, @cod_tarot, @cod_kairos, @codTango)
            `)

            // Recuperar el renglón recién insertado (sin necesidad de pasar el idLicitacion, ya que es un dato proporcionado)
            const resultNuevo = await request.query(`
                SELECT TOP 1 * FROM ${tableName} ORDER BY idKairos DESC
            `)

            return resultNuevo.recordset[0]; // Devuelve el nuevo registro con id generado automáticamente

        } catch (e) {
            console.log("ERROR: ", e)
            throw new Error('Error creating Compras record: ' + e.message);
        }
    }

    static async modificarProductoKairos({ idKairos, input }) {
        const { laboratorio, nombre_comercial, droga_presentacion, ANMAT, cod_tarot, cod_kairos, codTango } = input

        // Verificar si la licitación existe
        const request = new sql.Request()
        request.input('idKairos', sql.Int, idKairos)

        const resultExistente = await request.query(`
            SELECT * FROM ${tableName} WHERE idKairos = @idKairos
        `)

        if (resultExistente.recordset.length === 0) {
            throw new Error('Compra no encontrada')
        }
        try {
            // Actualizar solo los campos proporcionados
            if (laboratorio) request.input('laboratorio', sql.VarChar, laboratorio)
            if (nombre_comercial) request.input('nombre_comercial', sql.VarChar, nombre_comercial)
            if (droga_presentacion) request.input('droga_presentacion', sql.VarChar, droga_presentacion)
            if (ANMAT) request.input('ANMAT', sql.VarChar, ANMAT)
            if (cod_tarot) request.input('cod_tarot', sql.VarChar, cod_tarot)
            if (cod_kairos) request.input('cod_kairos', sql.VarChar, cod_kairos)
            if (codTango) request.input('codTango', sql.VarChar, codTango)

            // Crear la consulta de actualización
            let updateQuery = `
                UPDATE ${tableName} SET
            `;

            // Generar la parte dinámica de la consulta según los campos que se proporcionaron
            const setClauses = []
            if (laboratorio) setClauses.push("laboratorio = @laboratorio")
            if (nombre_comercial) setClauses.push("nombre_comercial = @nombre_comercial")
            if (droga_presentacion) setClauses.push("droga_presentacion = @droga_presentacion")
            if (ANMAT) setClauses.push("ANMAT = @ANMAT")
            if (cod_tarot) setClauses.push("cod_tarot = @cod_tarot")
            if (cod_kairos) setClauses.push("cod_kairos = @cod_kairos")
            if (codTango) setClauses.push("codTango = @codTango")

            updateQuery += setClauses.join(", ") + " WHERE idKairos = @idKairos"

            // Ejecutar la consulta de actualización
            await request.query(updateQuery);

            // Recuperar la licitación actualizada
            const resultActualizado = await request.query(`
                SELECT * FROM ${tableName} WHERE idKairos = @idKairos
            `);

            return resultActualizado.recordset[0]; // Devuelve el registro actualizado

        } catch (e) {
            throw new Error('Error al actualizar el producto de Kairos: ' + e.message);
        }
    }

    static async eliminarProductoKairos({ idKairos }) {
        const request = new sql.Request();
        request.input('idKairos', sql.Int, idKairos);

        try {
            const resultExistente = await request.query(`
            SELECT * FROM ${tableName} WHERE idKairos = @idKairos
        `);

            if (resultExistente.recordset.length === 0) {
                return null
            }

            // Eliminar la licitación
            await request.query(`
                DELETE FROM ${tableName} WHERE idKairos = @idKairos
            `);

            return { message: 'Producto Kairos eliminado con éxito' };

        } catch (e) {
            throw new Error('Error al eliminar producto Kairos: ' + e.message);
        }
    }

}
