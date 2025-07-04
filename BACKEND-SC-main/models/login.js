import { sql } from '../connection.js'
const tableName = 'Usuarios'

export class LoginModel {
  static async getByAccess({ userName }) {
 
    const result = await sql.query(`SELECT * FROM ${tableName} WHERE userName = '${userName}';`)
    
 
    return result.recordset
  }

  static async getRolesUsuario({idUsuario}){
    const request = new sql.Request();
    request.input('idUsuario', sql.Int, idUsuario);
    
    const result = await request.query(`
        SELECT rol FROM Usuario_Rol WHERE idUsuario = @idUsuario ORDER BY rol
    `);
    
    return result.recordset
  }
}
