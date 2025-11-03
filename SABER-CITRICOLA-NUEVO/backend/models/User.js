/**
 * 👥 USER.JS - Modelo de usuarios
 * =================================
 * Este módulo contiene toda la lógica relacionada con usuarios:
 * - Autenticación
 * - CRUD completo
 * - Validaciones
 */

import db from '../config/database.js';
import bcrypt from 'bcrypt';

// ============================================================================
// CLASE USERMODEL - Métodos estáticos para operaciones de usuarios
// ============================================================================

export class UserModel {
  
  /**
   * 🔐 Autenticar usuario con username y password
   * @param {string} username - Nombre de usuario
   * @param {string} password - Contraseña sin hashear
   * @param {Function} callback - Callback (err, usuario)
   */
  static obtenerUsuarioConRol(username, password, callback) {
    // Primero obtenemos el usuario con su contraseña hasheada
    const sql = "SELECT id, username, email, nombre_completo, rol, password FROM usuarios WHERE username = ?";
    
    db.get(sql, [username], (err, usuario) => {
      if (err) {
        return callback(err, null);
      }
      
      if (!usuario) {
        return callback(null, null); // Usuario no encontrado
      }
      
      // Verificar contraseña hasheada
      bcrypt.compare(password, usuario.password, (bcryptErr, esValida) => {
        if (bcryptErr) {
          return callback(bcryptErr, null);
        }
        
        if (esValida) {
          // Contraseña correcta - devolver usuario sin la contraseña
          const { password: _, ...usuarioSinPassword } = usuario;
          callback(null, usuarioSinPassword);
        } else {
          // Contraseña incorrecta
          callback(null, null);
        }
      });
    });
  }
  
  /**
   * 📋 Obtener todos los usuarios (solo para administradores)
   * @param {Function} callback - Callback (err, usuarios)
   */
  static obtenerTodosUsuarios(callback) {
    const sql = "SELECT id, username, email, nombre_completo, rol, activo, created_at FROM usuarios ORDER BY created_at DESC";
    db.all(sql, [], callback);
  }
  
  /**
   * 🔍 Obtener usuario por ID
   * @param {number} id - ID del usuario
   * @param {Function} callback - Callback (err, usuario)
   */
  static obtenerUsuarioPorId(id, callback) {
    const sql = "SELECT * FROM usuarios WHERE id = ?";
    
    db.get(sql, [id], (err, row) => {
      if (err) {
        console.error('❌ Error al obtener usuario por ID:', err);
        callback(err, null);
      } else {
        callback(null, row || null);
      }
    });
  }
  
  /**
   * ➕ Crear nuevo usuario con contraseña hasheada
   * @param {Object} datosUsuario - Datos del usuario { username, email, password, nombre_completo, rol }
   * @param {Function} callback - Callback (err, usuarioId)
   */
  static crearUsuario(datosUsuario, callback) {
    const { username, email, password, nombre_completo, rol } = datosUsuario;
    
    console.log('🔄 Creando usuario con datos:', { username, email, nombre_completo, rol });
    
    // Validar que el rol sea válido
    const rolesValidos = ['administrador', 'admin', 'experto', 'operador'];
    const rolFinal = rolesValidos.includes(rol) ? (rol === 'admin' ? 'administrador' : rol) : 'operador';
    
    // Hashear contraseña antes de guardarla
    bcrypt.hash(password, 10, (hashErr, passwordHash) => {
      if (hashErr) {
        console.error('❌ Error al hashear contraseña:', hashErr);
        return callback(hashErr, null);
      }
      
      const sql = `
        INSERT INTO usuarios (username, email, password, nombre_completo, rol, created_at)
        VALUES (?, ?, ?, ?, ?, datetime('now'))
      `;
      
      db.run(sql, [username, email, passwordHash, nombre_completo, rolFinal], function(err) {
        if (err) {
          console.error('❌ Error al crear usuario:', err);
          callback(err, null);
        } else {
          console.log(`✅ Usuario creado con ID: ${this.lastID}`);
          callback(null, this.lastID);
        }
      });
    });
  }
  
  /**
   * ✏️ Actualizar usuario existente
   * @param {number} id - ID del usuario
   * @param {Object} datosActualizacion - Datos a actualizar { username, email, password?, nombre_completo, rol }
   * @param {Function} callback - Callback (err, resultado)
   */
  static actualizarUsuario(id, datosActualizacion, callback) {
    const { username, email, password, nombre_completo, rol } = datosActualizacion;
    
    console.log('🔄 Actualizando usuario con datos:', { id, username, email, nombre_completo, rol });
    
    // Validar que el rol sea válido
    const rolesValidos = ['administrador', 'admin', 'experto', 'operador'];
    const rolFinal = rolesValidos.includes(rol) ? (rol === 'admin' ? 'administrador' : rol) : 'operador';
    
    // Si hay nueva contraseña, hashearla
    if (password) {
      bcrypt.hash(password, 10, (hashErr, passwordHash) => {
        if (hashErr) {
          console.error('❌ Error al hashear contraseña:', hashErr);
          return callback(hashErr, null);
        }
        
        const sql = `
          UPDATE usuarios 
          SET username = ?, email = ?, password = ?, nombre_completo = ?, rol = ?
          WHERE id = ?
        `;
        const params = [username, email, passwordHash, nombre_completo, rolFinal, id];
        
        db.run(sql, params, function(err) {
          if (err) {
            console.error('❌ Error al actualizar usuario:', err);
            callback(err, null);
          } else {
            console.log(`✅ Usuario ${id} actualizado exitosamente`);
            callback(null, { changes: this.changes });
          }
        });
      });
    } else {
      // Actualizar sin cambiar contraseña
      const sql = `
        UPDATE usuarios 
        SET username = ?, email = ?, nombre_completo = ?, rol = ?
        WHERE id = ?
      `;
      const params = [username, email, nombre_completo, rolFinal, id];
      
      db.run(sql, params, function(err) {
        if (err) {
          console.error('❌ Error al actualizar usuario:', err);
          callback(err, null);
        } else {
          console.log(`✅ Usuario ${id} actualizado exitosamente`);
          callback(null, { changes: this.changes });
        }
      });
    }
  }
  
  /**
   * 🗑️ Eliminar usuario
   * @param {number} id - ID del usuario
   * @param {Function} callback - Callback (err, eliminado)
   */
  static eliminarUsuario(id, callback) {
    const sql = 'DELETE FROM usuarios WHERE id = ?';
    
    db.run(sql, [id], function(err) {
      if (err) {
        console.error('❌ Error al eliminar usuario:', err);
        callback(err, null);
      } else {
        console.log(`✅ Usuario eliminado. Filas afectadas: ${this.changes}`);
        callback(null, this.changes > 0);
      }
    });
  }
  
  /**
   * ✅ Verificar si usuario existe (por username o email)
   * @param {string} username - Nombre de usuario
   * @param {string} email - Email
   * @param {Function} callback - Callback (err, existe)
   */
  static verificarUsuarioExiste(username, email, callback) {
    const sql = 'SELECT id FROM usuarios WHERE username = ? OR email = ?';
    
    db.get(sql, [username, email], (err, row) => {
      if (err) {
        console.error('❌ Error al verificar usuario:', err);
        callback(err, null);
      } else {
        callback(null, !!row);
      }
    });
  }
}

// ============================================================================
// EXPORTACIONES DE COMPATIBILIDAD - Funciones individuales
// ============================================================================
// Estas funciones mantienen la compatibilidad con el código existente

export function obtenerUsuarioConRol(username, password, callback) {
  return UserModel.obtenerUsuarioConRol(username, password, callback);
}

export function obtenerTodosUsuarios(callback) {
  return UserModel.obtenerTodosUsuarios(callback);
}

export function obtenerUsuarioPorId(id, callback) {
  return UserModel.obtenerUsuarioPorId(id, callback);
}

export function crearUsuario(datosUsuario, callback) {
  return UserModel.crearUsuario(datosUsuario, callback);
}

export function actualizarUsuario(id, datosActualizacion, callback) {
  return UserModel.actualizarUsuario(id, datosActualizacion, callback);
}

export function eliminarUsuario(id, callback) {
  return UserModel.eliminarUsuario(id, callback);
}

export function verificarUsuarioExiste(username, email, callback) {
  return UserModel.verificarUsuarioExiste(username, email, callback);
}

// ============================================================================
// EXPORTACIÓN POR DEFECTO
// ============================================================================

export default UserModel;

