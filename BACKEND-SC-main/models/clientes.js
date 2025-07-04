// models/user.js
import { sql } from '../connection.js'
const tableName = 'Cliente_Provincia'

export class ClienteModel {
  static async getAll() {
    const result = await sql.query(`SELECT * FROM ${tableName} ORDER BY ID_ZONA ASC`); // Cambia según tu esquema
    if (result.recordset.length === 0) return []

    return result.recordset; // Devuelve los usuarios
  }

  static async getByCodCliente({ cod }) {
    const request = new sql.Request();

    request.input('cod', sql.VarChar, cod);

    try {
      // Usa la instancia request en lugar de sql.query
      const result = await request.query(`SELECT * FROM ${tableName} WHERE COD_CLIENT = @cod ORDER BY RAZON_SOCI ASC`);

      return result.recordset[0] // Devuelve los resultados de la consulta
    } catch (error) {
      //return null
      throw new Error('Error al obtener la licitación');
    }
  }

  static async getByIDZona({ idZona }) {
    const request = new sql.Request();
    request.input('idZona', sql.VarChar, idZona);

    try {
      if (idZona === 'TODO') {
        const result = await request.query(`SELECT DISTINCT * FROM Cliente_Provincia 
          ORDER BY RAZON_SOCI ASC`);

        return result.recordset;
      }
      const result = await request.query(`SELECT DISTINCT * FROM Cliente_Provincia 
        WHERE REGION = @idZona ORDER BY RAZON_SOCI ASC`);

      return result.recordset; // Devuelve los resultados de la consulta
    } catch (error) {
      //return null
      throw new Error('Error al obtener la licitación');
    }
  }

  static async getByProvincia({ provincia }) {
    const request = new sql.Request();

    request.input('provincia', sql.VarChar, provincia);

    try {
      // Usa la instancia request en lugar de sql.query
      const result = await request.query(`SELECT * FROM ${tableName} WHERE NOMBRE_PRO = @provincia ORDER BY RAZON_SOCI ASC`);

      //console.log("RESULT: ",result)

      return result.recordset; // Devuelve los resultados de la consulta
    } catch (error) {
      //return null
      throw new Error('Error al obtener la licitación');
    }
  }

}
