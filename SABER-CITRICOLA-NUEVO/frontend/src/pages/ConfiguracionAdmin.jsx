// ⚙️ ConfiguracionAdmin.jsx - Página de configuración del administrador
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  obtenerConfiguracionSistema, 
  actualizarConfiguracionSistema,
  reiniciarSistema,
  crearBackupSistema,
  obtenerLogsRecientes
} from '../services/configuracionAPI';

const ConfiguracionAdmin = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [configuracion, setConfiguracion] = useState({
    general: {
      nombreSistema: 'Saber Citrícola',
      descripcionSistema: 'Sistema de Gestión del Conocimiento Citrícola',
      version: '2.0.0',
      idioma: 'es',
      timezone: 'America/Argentina/Buenos_Aires'
    },
    seguridad: {
      sessionTimeout: 30,
      passwordMinLength: 6,
      loginAttempts: 3,
      requirePasswordChange: false,
      enableTwoFactor: false
    },
    usuario: {
      maxFileSize: 10,
      allowedFileTypes: '.pdf,.doc,.docx,.txt,.jpg,.png,.mp4,.avi',
      defaultUserRole: 'operador',
      autoApproveUsers: false,
      enableUserRegistration: true
    },
    sistema: {
      backupInterval: 24,
      logLevel: 'info',
      enableDebugMode: false,
      maxLogFileSize: 100,
      autoCleanupDays: 30
    }
  });

  const [logs, setLogs] = useState([]);

  useEffect(() => {
    cargarConfiguracion();
    cargarLogs();
  }, []);

  const cargarConfiguracion = async () => {
    try {
      setLoading(true);
      const config = await obtenerConfiguracionSistema();
      if (config) {
        setConfiguracion(prev => ({
          ...prev,
          ...config
        }));
      }
    } catch (error) {
      console.error('Error al cargar configuración:', error);
      mostrarMensaje('Error al cargar la configuración', 'error');
    } finally {
      setLoading(false);
    }
  };

  const cargarLogs = async () => {
    try {
      const logsData = await obtenerLogsRecientes(50);
      setLogs(logsData);
    } catch (error) {
      console.error('Error al cargar logs:', error);
    }
  };

  const mostrarMensaje = (texto, tipo = 'success') => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje(null), 5000);
  };

  const handleConfigChange = (seccion, campo, valor) => {
    setConfiguracion(prev => ({
      ...prev,
      [seccion]: {
        ...prev[seccion],
        [campo]: valor
      }
    }));
  };

  const guardarConfiguracion = async () => {
    try {
      setLoading(true);
      await actualizarConfiguracionSistema(configuracion);
      mostrarMensaje('Configuración guardada exitosamente');
    } catch (error) {
      console.error('Error al guardar configuración:', error);
      mostrarMensaje('Error al guardar la configuración', 'error');
    } finally {
      setLoading(false);
    }
  };

  const crearBackup = async () => {
    try {
      setLoading(true);
      const backup = await crearBackupSistema();
      mostrarMensaje(`Backup creado exitosamente: ${backup.filename}`);
    } catch (error) {
      console.error('Error al crear backup:', error);
      mostrarMensaje('Error al crear el backup', 'error');
    } finally {
      setLoading(false);
    }
  };

  const reiniciarServidor = async () => {
    if (!window.confirm('¿Estás seguro de que quieres reiniciar el servidor? Esto desconectará a todos los usuarios.')) {
      return;
    }

    try {
      setLoading(true);
      await reiniciarSistema();
      mostrarMensaje('Servidor reiniciado exitosamente');
    } catch (error) {
      console.error('Error al reiniciar servidor:', error);
      mostrarMensaje('Error al reiniciar el servidor', 'error');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: '⚙️' },
    { id: 'seguridad', label: 'Seguridad', icon: '🔒' },
    { id: 'usuario', label: 'Usuarios', icon: '👥' },
    { id: 'sistema', label: 'Sistema', icon: '🖥️' },
    { id: 'logs', label: 'Logs', icon: '📋' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg mb-6 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/admin')}
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                ← Volver
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                  ⚙️ Configuración del Sistema
                </h1>
                <p className="text-gray-600 mt-1">
                  Administra la configuración general del sistema
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={crearBackup}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                💾 Crear Backup
              </button>
              <button
                onClick={guardarConfiguracion}
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {loading ? '⏳ Guardando...' : '💾 Guardar Cambios'}
              </button>
            </div>
          </div>
        </div>

        {/* Mensaje de estado */}
        {mensaje && (
          <div className={`mb-6 p-4 rounded-lg ${
            mensaje.tipo === 'error' 
              ? 'bg-red-100 border border-red-300 text-red-700' 
              : 'bg-green-100 border border-green-300 text-green-700'
          }`}>
            {mensaje.texto}
          </div>
        )}

        <div className="flex gap-6">
          {/* Sidebar con tabs */}
          <div className="w-64 space-y-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-orange-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-orange-50'
                }`}
              >
                <span className="text-xl">{tab.icon}</span>
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Contenido principal */}
          <div className="flex-1 bg-white rounded-xl shadow-lg p-6">
            {/* Tab: General */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">⚙️ Configuración General</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre del Sistema
                    </label>
                    <input
                      type="text"
                      value={configuracion.general.nombreSistema}
                      onChange={(e) => handleConfigChange('general', 'nombreSistema', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Versión
                    </label>
                    <input
                      type="text"
                      value={configuracion.general.version}
                      onChange={(e) => handleConfigChange('general', 'version', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descripción del Sistema
                    </label>
                    <textarea
                      value={configuracion.general.descripcionSistema}
                      onChange={(e) => handleConfigChange('general', 'descripcionSistema', e.target.value)}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Idioma
                    </label>
                    <select
                      value={configuracion.general.idioma}
                      onChange={(e) => handleConfigChange('general', 'idioma', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    >
                      <option value="es">Español</option>
                      <option value="en">English</option>
                      <option value="pt">Português</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Zona Horaria
                    </label>
                    <select
                      value={configuracion.general.timezone}
                      onChange={(e) => handleConfigChange('general', 'timezone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    >
                      <option value="America/Argentina/Buenos_Aires">Buenos Aires</option>
                      <option value="America/Montevideo">Montevideo</option>
                      <option value="America/Sao_Paulo">São Paulo</option>
                      <option value="UTC">UTC</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Seguridad */}
            {activeTab === 'seguridad' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">🔒 Configuración de Seguridad</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tiempo de sesión (minutos)
                    </label>
                    <input
                      type="number"
                      value={configuracion.seguridad.sessionTimeout}
                      onChange={(e) => handleConfigChange('seguridad', 'sessionTimeout', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Longitud mínima de contraseña
                    </label>
                    <input
                      type="number"
                      value={configuracion.seguridad.passwordMinLength}
                      onChange={(e) => handleConfigChange('seguridad', 'passwordMinLength', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Intentos de login máximos
                    </label>
                    <input
                      type="number"
                      value={configuracion.seguridad.loginAttempts}
                      onChange={(e) => handleConfigChange('seguridad', 'loginAttempts', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="requirePasswordChange"
                      checked={configuracion.seguridad.requirePasswordChange}
                      onChange={(e) => handleConfigChange('seguridad', 'requirePasswordChange', e.target.checked)}
                      className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                    />
                    <label htmlFor="requirePasswordChange" className="ml-2 block text-sm text-gray-900">
                      Requerir cambio de contraseña periódico
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="enableTwoFactor"
                      checked={configuracion.seguridad.enableTwoFactor}
                      onChange={(e) => handleConfigChange('seguridad', 'enableTwoFactor', e.target.checked)}
                      className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                    />
                    <label htmlFor="enableTwoFactor" className="ml-2 block text-sm text-gray-900">
                      Habilitar autenticación de dos factores
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Usuarios */}
            {activeTab === 'usuario' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">👥 Configuración de Usuarios</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tamaño máximo de archivo (MB)
                    </label>
                    <input
                      type="number"
                      value={configuracion.usuario.maxFileSize}
                      onChange={(e) => handleConfigChange('usuario', 'maxFileSize', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rol por defecto
                    </label>
                    <select
                      value={configuracion.usuario.defaultUserRole}
                      onChange={(e) => handleConfigChange('usuario', 'defaultUserRole', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    >
                      <option value="operador">Operador</option>
                      <option value="experto">Experto</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipos de archivo permitidos
                    </label>
                    <input
                      type="text"
                      value={configuracion.usuario.allowedFileTypes}
                      onChange={(e) => handleConfigChange('usuario', 'allowedFileTypes', e.target.value)}
                      placeholder=".pdf,.doc,.docx,.txt,.jpg,.png"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="autoApproveUsers"
                      checked={configuracion.usuario.autoApproveUsers}
                      onChange={(e) => handleConfigChange('usuario', 'autoApproveUsers', e.target.checked)}
                      className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                    />
                    <label htmlFor="autoApproveUsers" className="ml-2 block text-sm text-gray-900">
                      Aprobar usuarios automáticamente
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="enableUserRegistration"
                      checked={configuracion.usuario.enableUserRegistration}
                      onChange={(e) => handleConfigChange('usuario', 'enableUserRegistration', e.target.checked)}
                      className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                    />
                    <label htmlFor="enableUserRegistration" className="ml-2 block text-sm text-gray-900">
                      Permitir registro de usuarios
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Sistema */}
            {activeTab === 'sistema' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">🖥️ Configuración del Sistema</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Intervalo de backup (horas)
                    </label>
                    <input
                      type="number"
                      value={configuracion.sistema.backupInterval}
                      onChange={(e) => handleConfigChange('sistema', 'backupInterval', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nivel de log
                    </label>
                    <select
                      value={configuracion.sistema.logLevel}
                      onChange={(e) => handleConfigChange('sistema', 'logLevel', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    >
                      <option value="error">Error</option>
                      <option value="warn">Warning</option>
                      <option value="info">Info</option>
                      <option value="debug">Debug</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tamaño máximo de log (MB)
                    </label>
                    <input
                      type="number"
                      value={configuracion.sistema.maxLogFileSize}
                      onChange={(e) => handleConfigChange('sistema', 'maxLogFileSize', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Limpieza automática (días)
                    </label>
                    <input
                      type="number"
                      value={configuracion.sistema.autoCleanupDays}
                      onChange={(e) => handleConfigChange('sistema', 'autoCleanupDays', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="enableDebugMode"
                      checked={configuracion.sistema.enableDebugMode}
                      onChange={(e) => handleConfigChange('sistema', 'enableDebugMode', e.target.checked)}
                      className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                    />
                    <label htmlFor="enableDebugMode" className="ml-2 block text-sm text-gray-900">
                      Habilitar modo debug
                    </label>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">🔧 Acciones del Sistema</h3>
                  <div className="flex space-x-4">
                    <button
                      onClick={reiniciarServidor}
                      disabled={loading}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                    >
                      🔄 Reiniciar Servidor
                    </button>
                    <button
                      onClick={cargarLogs}
                      disabled={loading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                      📄 Recargar Logs
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Logs */}
            {activeTab === 'logs' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-800">📋 Logs del Sistema</h2>
                  <button
                    onClick={cargarLogs}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    🔄 Actualizar
                  </button>
                </div>
                
                <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
                  {logs.length > 0 ? (
                    logs.map((log, index) => (
                      <div key={index} className="mb-1">
                        <span className="text-gray-500">[{log.timestamp}]</span>{' '}
                        <span className={`${
                          log.level === 'error' ? 'text-red-400' :
                          log.level === 'warn' ? 'text-yellow-400' :
                          log.level === 'info' ? 'text-blue-400' :
                          'text-green-400'
                        }`}>
                          {log.level.toUpperCase()}
                        </span>{' '}
                        {log.message}
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-500 text-center py-8">
                      No hay logs disponibles
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfiguracionAdmin;