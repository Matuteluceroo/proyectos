// models/user.js
import { sql } from '../connection.js'
const tableName = 'ProdsTarot'
const tableNameEquiva = 'EquivalenciasTarot'

export class TarotModel {
  static async getAll({ listaCodigos }) {
    //console.log(listaCodigos)
    if (listaCodigos.length === 0) return []
    const listaSQL = `('${listaCodigos.map(codigo => codigo.toString()).join("', '")}')`;

    const result = await sql.query(`SELECT DISTINCT codTarot, descripcionTarot FROM ${tableName} WHERE codTarot IN ${listaSQL};`);
    //console.log(result.recordset)
    return result.recordset;
  }

  static async getByCodTarot({ id }) {
    const request = new sql.Request();
    request.input('id', sql.Int, id);

    try {
      // Usa la instancia request en lugar de sql.query
      const result = await request.query(`SELECT DISTINCT descripcionTarot FROM ${tableName} WHERE codTarot = @id`);

      if (result.recordset[0] === undefined) {
        return ''
      }

      return result.recordset[0]['descripcionTarot']; // Devuelve los resultados de la consulta
    } catch (error) {
      console.error('Error al obtener la licitación:', error);
      throw new Error('Error al obtener la licitación');
    }
  }

  static async getListaCodigos() {
    const result = await sql.query(`SELECT DISTINCT codTarot, descripcionTarot
  FROM ProdsTarot ORDER BY descripcionTarot ASC;`)

    return result.recordset
  }

  static async buscarEquivalencias({ busqueda }) {
    const request = new sql.Request();
    request.input('busqueda', sql.VarChar(100), `%${busqueda}%`);

    try {

      const result = await request.query(`
            SELECT * FROM ${tableNameEquiva}
            WHERE articuloOriginal LIKE @busqueda
               OR codTarot LIKE @busqueda
               OR codEquivalenciasTarot LIKE @busqueda
        `);

      return result.recordset;
    } catch (error) {
      console.error('Error en la búsqueda:', error);
      throw new Error('Error al buscar equivalencias');
    }
  }

  static async getCodigoMasFrecuente({ busqueda }) {
    const request = new sql.Request();
    request.input('busqueda', sql.VarChar(100), `%${busqueda}%`);

    try {
      const result = await request.query(`
            SELECT TOP 1 codTarot, COUNT(*) as frecuencia
            FROM ${tableNameEquiva}
            WHERE articuloOriginal LIKE @busqueda
               OR codTarot LIKE @busqueda
               OR codEquivalenciasTarot LIKE @busqueda
            GROUP BY codTarot
            ORDER BY frecuencia DESC
        `);

      if (result.recordset.length === 0) {
        return null;
      }

      return result.recordset[0].codTarot;
    } catch (error) {
      console.error('Error al obtener código frecuente:', error);
      throw new Error('Error al obtener código frecuente');
    }
  }

}
