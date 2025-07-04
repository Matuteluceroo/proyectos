// models/user.js
import { sql } from '../connection.js'
const tableName = 'Stock_deposito'

export class StockModel {
    // ESTÁ MAL, NO TRAE TODO EL STOCK, SOLO LOS QUE MATCHEAN
    static async getAll() {
        const result = await sql.query(`SELECT 
    l.id as idLicitacion,
    r.idRenglon,
    r.renglon,
	  r.cantidad,
	  r.descripcion,
	  r.codigoTarot,
	  prt.codTango,
	  st.cod_deposito,
	  st.descripcion,
	  st.descripcion_deposito,
	  st.fecha_vencimiento,
	  st.saldo_control_stock
      FROM 
    Renglones r
      JOIN 
    Licitaciones l ON r.idLicitacion = l.id AND r.alternativo = 0
	  JOIN
	ProdsTarot prt ON prt.codTarot = r.codigoTarot
	  JOIN 
	Stock_deposito st ON st.cod_articulo = prt.codTango`);
        //console.log(result.recordset)
        return result.recordset;
    }

    static async getByIdLicitacion({ idLicitacion }) {
        const request = new sql.Request();
        request.input('idLicitacion', sql.Int, idLicitacion);

        try {
            // Usa la instancia request en lugar de sql.query
            const result = await request.query(`
                SELECT 
                    l.id as idLicitacion,
                    r.idRenglon,
                    r.renglon,
                    r.cantidad,
                    r.descripcion,
					ktc.laboratorio,
					ktc.nombre_comercial,
					ktc.ANMAT,
                    r.codigoTarot,
                    RTRIM(prt.codTango) AS codTango,  
                    st.cod_deposito,
                    st.descripcion AS descripcion_stock,
                    st.descripcion_deposito,
                    st.fecha_vencimiento,
                    st.saldo_control_stock
                FROM 
                    Renglones r
                JOIN 
                    Licitaciones l ON r.idLicitacion = l.id AND r.alternativo = 0
                JOIN
                    ProdsTarot prt ON prt.codTarot = r.codigoTarot
                JOIN 
                    Stock_deposito st ON st.cod_articulo = RTRIM(prt.codTango)
				LEFT JOIN 
					BaseKTC ktc ON ktc.codTango = st.cod_articulo
                WHERE 
                    idLicitacion = @idLicitacion
            `);

            return result.recordset;

        } catch (error) {
            console.error('Error al obtener la licitación:', error);
            throw new Error('Error al obtener Stock');
        }
    }

}
