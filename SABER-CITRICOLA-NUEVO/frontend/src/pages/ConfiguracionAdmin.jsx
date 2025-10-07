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
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 25%, #fed7aa 50%, #fdba74 75%, #fb923c 100%)'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>
        {/* 🍊 Header Profesional con Estilo Cítrico */}
        <div style={{
          background: 'linear-gradient(135deg, #ea580c 0%, #dc2626 50%, #b91c1c 100%)',
          borderRadius: '20px',
          boxShadow: '0 8px 32px rgba(234, 88, 12, 0.3)',
          marginBottom: '32px',
          padding: '32px',
          borderLeft: '6px solid #f97316'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              <button
                onClick={() => navigate('/dashboard-admin')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '16px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '12px',
                  padding: '12px 20px',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                ← Volver
              </button>
              <div>
                <h1 style={{
                  fontSize: '32px',
                  fontWeight: 'bold',
                  color: 'white',
                  textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
                  margin: '0 0 8px 0'
                }}>
                  ⚙️ Configuración del Sistema
                </h1>
                <p style={{
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontSize: '16px',
                  margin: 0
                }}>
                  Administra la configuración general del sistema
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button
                onClick={crearBackup}
                disabled={loading}
                style={{
                  padding: '14px 24px',
                  background: loading ? 'rgba(255, 255, 255, 0.3)' : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                  color: 'white',
                  borderRadius: '12px',
                  fontWeight: 'bold',
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)'
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 8px 25px rgba(59, 130, 246, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 15px rgba(59, 130, 246, 0.3)';
                  }
                }}
              >
                💾 Crear Backup
              </button>
              <button
                onClick={guardarConfiguracion}
                disabled={loading}
                style={{
                  padding: '14px 24px',
                  background: loading ? 'rgba(255, 255, 255, 0.3)' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  borderRadius: '12px',
                  fontWeight: 'bold',
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)'
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 8px 25px rgba(16, 185, 129, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 15px rgba(16, 185, 129, 0.3)';
                  }
                }}
              >
                {loading ? '⏳ Guardando...' : '💾 Guardar Cambios'}
              </button>
            </div>
          </div>
        </div>

        {/* 📢 Mensaje de Estado Mejorado */}
        {mensaje && (
          <div style={{
            marginBottom: '32px',
            padding: '16px 24px',
            borderRadius: '16px',
            fontSize: '14px',
            fontWeight: 'bold',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
            background: mensaje.tipo === 'error' 
              ? 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)' 
              : 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
            border: `2px solid ${mensaje.tipo === 'error' ? '#fca5a5' : '#bbf7d0'}`,
            color: mensaje.tipo === 'error' ? '#991b1b' : '#166534'
          }}>
            {mensaje.texto}
          </div>
        )}

        <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
          {/* 🎛️ Sidebar de Navegación Mejorado */}
          <div style={{ width: '280px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '16px 20px',
                  borderRadius: '16px',
                  transition: 'all 0.3s ease',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  border: 'none',
                  cursor: 'pointer',
                  background: activeTab === tab.id
                    ? 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)'
                    : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                  color: activeTab === tab.id ? 'white' : '#374151',
                  boxShadow: activeTab === tab.id 
                    ? '0 8px 25px rgba(249, 115, 22, 0.3)' 
                    : '0 2px 8px rgba(0, 0, 0, 0.1)',
                  transform: activeTab === tab.id ? 'translateX(4px)' : 'translateX(0)',
                  borderLeft: activeTab === tab.id ? '4px solid #dc2626' : '4px solid transparent'
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== tab.id) {
                    e.target.style.background = 'linear-gradient(135deg, #ffedd5 0%, #fed7aa 100%)';
                    e.target.style.transform = 'translateX(2px)';
                    e.target.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.15)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== tab.id) {
                    e.target.style.background = 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)';
                    e.target.style.transform = 'translateX(0)';
                    e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                  }
                }}
              >
                <span style={{ fontSize: '20px' }}>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* 📋 Panel de Contenido Principal */}
          <div style={{
            flex: 1,
            background: 'linear-gradient(135deg, #1a202c, #2d3748)',
            borderRadius: '20px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
            padding: '32px',
            borderLeft: '6px solid #f97316',
            minHeight: '600px',
            border: '1px solid #4a5568'
          }}>
            {/* ⚙️ Tab: General */}
            {activeTab === 'general' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                <h2 style={{
                  fontSize: '28px',
                  fontWeight: 'bold',
                  color: '#f7fafc',
                  marginBottom: '16px',
                  textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)'
                }}>⚙️ Configuración General</h2>
                
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
                  gap: '24px',
                  background: 'linear-gradient(135deg, #2d3748, #4a5568)',
                  padding: '30px',
                  borderRadius: '20px',
                  border: '1px solid #4a5568',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      color: '#f7fafc',
                      marginBottom: '8px'
                    }}>
                      🏷️ Nombre del Sistema
                    </label>
                    <input
                      type="text"
                      value={configuracion.general.nombreSistema}
                      onChange={(e) => handleConfigChange('general', 'nombreSistema', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '2px solid #4a5568',
                        borderRadius: '12px',
                        fontSize: '14px',
                        transition: 'all 0.3s ease',
                        background: '#1a202c',
                        color: '#e2e8f0'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#f97316';
                        e.target.style.boxShadow = '0 0 0 3px rgba(249, 115, 22, 0.2)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#4a5568';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      color: '#f7fafc',
                      marginBottom: '8px'
                    }}>
                      🔢 Versión
                    </label>
                    <input
                      type="text"
                      value={configuracion.general.version}
                      onChange={(e) => handleConfigChange('general', 'version', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '2px solid #4a5568',
                        borderRadius: '12px',
                        fontSize: '14px',
                        transition: 'all 0.3s ease',
                        background: '#1a202c',
                        color: '#e2e8f0'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#f97316';
                        e.target.style.boxShadow = '0 0 0 3px rgba(249, 115, 22, 0.2)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#4a5568';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>

                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      color: '#f7fafc',
                      marginBottom: '8px'
                    }}>
                      📝 Descripción del Sistema
                    </label>
                    <textarea
                      value={configuracion.general.descripcionSistema}
                      onChange={(e) => handleConfigChange('general', 'descripcionSistema', e.target.value)}
                      rows="3"
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '2px solid #4a5568',
                        borderRadius: '12px',
                        fontSize: '14px',
                        transition: 'all 0.3s ease',
                        background: '#1a202c',
                        color: '#e2e8f0',
                        resize: 'vertical'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#f97316';
                        e.target.style.boxShadow = '0 0 0 3px rgba(249, 115, 22, 0.2)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#4a5568';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      color: '#f7fafc',
                      marginBottom: '8px'
                    }}>
                      🌐 Idioma
                    </label>
                    <select
                      value={configuracion.general.idioma}
                      onChange={(e) => handleConfigChange('general', 'idioma', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '2px solid #4a5568',
                        borderRadius: '12px',
                        fontSize: '14px',
                        transition: 'all 0.3s ease',
                        background: '#1a202c',
                        color: '#e2e8f0',
                        cursor: 'pointer'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#f97316';
                        e.target.style.boxShadow = '0 0 0 3px rgba(249, 115, 22, 0.2)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#4a5568';
                        e.target.style.boxShadow = 'none';
                      }}
                    >
                      <option value="es">Español</option>
                      <option value="en">English</option>
                      <option value="pt">Português</option>
                    </select>
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      color: '#f7fafc',
                      marginBottom: '8px'
                    }}>
                      🕐 Zona Horaria
                    </label>
                    <select
                      value={configuracion.general.timezone}
                      onChange={(e) => handleConfigChange('general', 'timezone', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '2px solid #4a5568',
                        borderRadius: '12px',
                        fontSize: '14px',
                        transition: 'all 0.3s ease',
                        background: '#1a202c',
                        color: '#e2e8f0',
                        cursor: 'pointer'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#f97316';
                        e.target.style.boxShadow = '0 0 0 3px rgba(249, 115, 22, 0.2)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#4a5568';
                        e.target.style.boxShadow = 'none';
                      }}
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

            {/* 🔒 Tab: Seguridad */}
            {activeTab === 'seguridad' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                <h2 style={{
                  fontSize: '28px',
                  fontWeight: 'bold',
                  color: '#f7fafc',
                  marginBottom: '16px',
                  textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)'
                }}>🔒 Configuración de Seguridad</h2>
                
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
                  gap: '24px',
                  background: 'linear-gradient(135deg, #2d3748, #4a5568)',
                  padding: '30px',
                  borderRadius: '20px',
                  border: '1px solid #4a5568',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      color: '#f7fafc',
                      marginBottom: '8px'
                    }}>
                      ⏱️ Tiempo de sesión (minutos)
                    </label>
                    <input
                      type="number"
                      value={configuracion.seguridad.sessionTimeout}
                      onChange={(e) => handleConfigChange('seguridad', 'sessionTimeout', parseInt(e.target.value))}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '2px solid #4a5568',
                        borderRadius: '12px',
                        fontSize: '14px',
                        transition: 'all 0.3s ease',
                        background: '#1a202c',
                        color: '#e2e8f0'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#f97316';
                        e.target.style.boxShadow = '0 0 0 3px rgba(249, 115, 22, 0.2)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#4a5568';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      color: '#f7fafc',
                      marginBottom: '8px'
                    }}>
                      🔐 Longitud mínima de contraseña
                    </label>
                    <input
                      type="number"
                      value={configuracion.seguridad.passwordMinLength}
                      onChange={(e) => handleConfigChange('seguridad', 'passwordMinLength', parseInt(e.target.value))}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '2px solid #4a5568',
                        borderRadius: '12px',
                        fontSize: '14px',
                        transition: 'all 0.3s ease',
                        background: '#1a202c',
                        color: '#e2e8f0'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#f97316';
                        e.target.style.boxShadow = '0 0 0 3px rgba(249, 115, 22, 0.2)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#4a5568';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      color: '#f7fafc',
                      marginBottom: '8px'
                    }}>
                      🚫 Intentos de login máximos
                    </label>
                    <input
                      type="number"
                      value={configuracion.seguridad.loginAttempts}
                      onChange={(e) => handleConfigChange('seguridad', 'loginAttempts', parseInt(e.target.value))}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '2px solid #4a5568',
                        borderRadius: '12px',
                        fontSize: '14px',
                        transition: 'all 0.3s ease',
                        background: '#1a202c',
                        color: '#e2e8f0'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#f97316';
                        e.target.style.boxShadow = '0 0 0 3px rgba(249, 115, 22, 0.2)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#4a5568';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', gridColumn: '1 / -1' }}>
                    <input
                      type="checkbox"
                      id="requirePasswordChange"
                      checked={configuracion.seguridad.requirePasswordChange}
                      onChange={(e) => handleConfigChange('seguridad', 'requirePasswordChange', e.target.checked)}
                      style={{
                        width: '18px',
                        height: '18px',
                        accentColor: '#f97316',
                        cursor: 'pointer'
                      }}
                    />
                    <label htmlFor="requirePasswordChange" style={{
                      fontSize: '14px',
                      color: '#f7fafc',
                      fontWeight: '500',
                      cursor: 'pointer'
                    }}>
                      🔄 Requerir cambio de contraseña periódico
                    </label>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', gridColumn: '1 / -1' }}>
                    <input
                      type="checkbox"
                      id="enableTwoFactor"
                      checked={configuracion.seguridad.enableTwoFactor}
                      onChange={(e) => handleConfigChange('seguridad', 'enableTwoFactor', e.target.checked)}
                      style={{
                        width: '18px',
                        height: '18px',
                        accentColor: '#f97316',
                        cursor: 'pointer'
                      }}
                    />
                    <label htmlFor="enableTwoFactor" style={{
                      fontSize: '14px',
                      color: '#f7fafc',
                      fontWeight: '500',
                      cursor: 'pointer'
                    }}>
                      🛡️ Habilitar autenticación de dos factores
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* 👥 Tab: Usuarios */}
            {activeTab === 'usuario' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                <h2 style={{
                  fontSize: '28px',
                  fontWeight: 'bold',
                  color: '#f7fafc',
                  marginBottom: '16px',
                  textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)'
                }}>👥 Configuración de Usuarios</h2>
                
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
                  gap: '24px',
                  background: 'linear-gradient(135deg, #2d3748, #4a5568)',
                  padding: '30px',
                  borderRadius: '20px',
                  border: '1px solid #4a5568',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      color: '#f7fafc',
                      marginBottom: '8px'
                    }}>
                      📁 Tamaño máximo de archivo (MB)
                    </label>
                    <input
                      type="number"
                      value={configuracion.usuario.maxFileSize}
                      onChange={(e) => handleConfigChange('usuario', 'maxFileSize', parseInt(e.target.value))}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '2px solid #4a5568',
                        borderRadius: '12px',
                        fontSize: '14px',
                        transition: 'all 0.3s ease',
                        background: '#1a202c',
                        color: '#e2e8f0'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#f97316';
                        e.target.style.boxShadow = '0 0 0 3px rgba(249, 115, 22, 0.2)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#4a5568';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      color: '#f7fafc',
                      marginBottom: '8px'
                    }}>
                      🎭 Rol por defecto
                    </label>
                    <select
                      value={configuracion.usuario.defaultUserRole}
                      onChange={(e) => handleConfigChange('usuario', 'defaultUserRole', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '2px solid #4a5568',
                        borderRadius: '12px',
                        fontSize: '14px',
                        transition: 'all 0.3s ease',
                        background: '#1a202c',
                        color: '#e2e8f0',
                        cursor: 'pointer'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#f97316';
                        e.target.style.boxShadow = '0 0 0 3px rgba(249, 115, 22, 0.2)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#4a5568';
                        e.target.style.boxShadow = 'none';
                      }}
                    >
                      <option value="operador">Operador</option>
                      <option value="experto">Experto</option>
                    </select>
                  </div>

                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      color: '#f7fafc',
                      marginBottom: '8px'
                    }}>
                      📄 Tipos de archivo permitidos
                    </label>
                    <input
                      type="text"
                      value={configuracion.usuario.allowedFileTypes}
                      onChange={(e) => handleConfigChange('usuario', 'allowedFileTypes', e.target.value)}
                      placeholder=".pdf,.doc,.docx,.txt,.jpg,.png"
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '2px solid #4a5568',
                        borderRadius: '12px',
                        fontSize: '14px',
                        transition: 'all 0.3s ease',
                        background: '#1a202c',
                        color: '#e2e8f0'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#f97316';
                        e.target.style.boxShadow = '0 0 0 3px rgba(249, 115, 22, 0.2)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#4a5568';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', gridColumn: '1 / -1' }}>
                    <input
                      type="checkbox"
                      id="autoApproveUsers"
                      checked={configuracion.usuario.autoApproveUsers}
                      onChange={(e) => handleConfigChange('usuario', 'autoApproveUsers', e.target.checked)}
                      style={{
                        width: '18px',
                        height: '18px',
                        accentColor: '#f97316',
                        cursor: 'pointer'
                      }}
                    />
                    <label htmlFor="autoApproveUsers" style={{
                      fontSize: '14px',
                      color: '#f7fafc',
                      fontWeight: '500',
                      cursor: 'pointer'
                    }}>
                      ✅ Aprobar usuarios automáticamente
                    </label>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', gridColumn: '1 / -1' }}>
                    <input
                      type="checkbox"
                      id="enableUserRegistration"
                      checked={configuracion.usuario.enableUserRegistration}
                      onChange={(e) => handleConfigChange('usuario', 'enableUserRegistration', e.target.checked)}
                      style={{
                        width: '18px',
                        height: '18px',
                        accentColor: '#f97316',
                        cursor: 'pointer'
                      }}
                    />
                    <label htmlFor="enableUserRegistration" style={{
                      fontSize: '14px',
                      color: '#f7fafc',
                      fontWeight: '500',
                      cursor: 'pointer'
                    }}>
                      👥 Permitir registro de usuarios
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* 🖥️ Tab: Sistema */}
            {activeTab === 'sistema' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                <h2 style={{
                  fontSize: '28px',
                  fontWeight: 'bold',
                  color: '#f7fafc',
                  marginBottom: '16px',
                  textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)'
                }}>🖥️ Configuración del Sistema</h2>
                
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
                  gap: '24px',
                  background: 'linear-gradient(135deg, #2d3748, #4a5568)',
                  padding: '30px',
                  borderRadius: '20px',
                  border: '1px solid #4a5568',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      color: '#f7fafc',
                      marginBottom: '8px'
                    }}>
                      💾 Intervalo de backup (horas)
                    </label>
                    <input
                      type="number"
                      value={configuracion.sistema.backupInterval}
                      onChange={(e) => handleConfigChange('sistema', 'backupInterval', parseInt(e.target.value))}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '2px solid #4a5568',
                        borderRadius: '12px',
                        fontSize: '14px',
                        transition: 'all 0.3s ease',
                        background: '#1a202c',
                        color: '#e2e8f0'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#f97316';
                        e.target.style.boxShadow = '0 0 0 3px rgba(249, 115, 22, 0.2)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#4a5568';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      color: '#f7fafc',
                      marginBottom: '8px'
                    }}>
                      📊 Nivel de log
                    </label>
                    <select
                      value={configuracion.sistema.logLevel}
                      onChange={(e) => handleConfigChange('sistema', 'logLevel', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '2px solid #4a5568',
                        borderRadius: '12px',
                        fontSize: '14px',
                        transition: 'all 0.3s ease',
                        background: '#1a202c',
                        color: '#e2e8f0',
                        cursor: 'pointer'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#f97316';
                        e.target.style.boxShadow = '0 0 0 3px rgba(249, 115, 22, 0.2)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#4a5568';
                        e.target.style.boxShadow = 'none';
                      }}
                    >
                      <option value="error">Error</option>
                      <option value="warn">Warning</option>
                      <option value="info">Info</option>
                      <option value="debug">Debug</option>
                    </select>
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      color: '#f7fafc',
                      marginBottom: '8px'
                    }}>
                      📏 Tamaño máximo de log (MB)
                    </label>
                    <input
                      type="number"
                      value={configuracion.sistema.maxLogFileSize}
                      onChange={(e) => handleConfigChange('sistema', 'maxLogFileSize', parseInt(e.target.value))}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '2px solid #4a5568',
                        borderRadius: '12px',
                        fontSize: '14px',
                        transition: 'all 0.3s ease',
                        background: '#1a202c',
                        color: '#e2e8f0'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#f97316';
                        e.target.style.boxShadow = '0 0 0 3px rgba(249, 115, 22, 0.2)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#4a5568';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      color: '#f7fafc',
                      marginBottom: '8px'
                    }}>
                      🗑️ Limpieza automática (días)
                    </label>
                    <input
                      type="number"
                      value={configuracion.sistema.autoCleanupDays}
                      onChange={(e) => handleConfigChange('sistema', 'autoCleanupDays', parseInt(e.target.value))}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '2px solid #4a5568',
                        borderRadius: '12px',
                        fontSize: '14px',
                        transition: 'all 0.3s ease',
                        background: '#1a202c',
                        color: '#e2e8f0'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#f97316';
                        e.target.style.boxShadow = '0 0 0 3px rgba(249, 115, 22, 0.2)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#4a5568';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', gridColumn: '1 / -1' }}>
                    <input
                      type="checkbox"
                      id="enableDebugMode"
                      checked={configuracion.sistema.enableDebugMode}
                      onChange={(e) => handleConfigChange('sistema', 'enableDebugMode', e.target.checked)}
                      style={{
                        width: '18px',
                        height: '18px',
                        accentColor: '#f97316',
                        cursor: 'pointer'
                      }}
                    />
                    <label htmlFor="enableDebugMode" style={{
                      fontSize: '14px',
                      color: '#f7fafc',
                      fontWeight: '500',
                      cursor: 'pointer'
                    }}>
                      🐛 Habilitar modo debug
                    </label>
                  </div>
                </div>

                {/* 🔧 Sección de Acciones del Sistema */}
                <div style={{
                  background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
                  borderRadius: '16px',
                  padding: '24px',
                  border: '2px solid #fca5a5'
                }}>
                  <h3 style={{
                    fontSize: '20px',
                    fontWeight: 'bold',
                    color: '#991b1b',
                    marginBottom: '16px'
                  }}>🔧 Acciones del Sistema</h3>
                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    <button
                      onClick={reiniciarServidor}
                      disabled={loading}
                      style={{
                        padding: '14px 24px',
                        background: loading ? 'rgba(239, 68, 68, 0.5)' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                        color: 'white',
                        borderRadius: '12px',
                        fontWeight: 'bold',
                        border: 'none',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)'
                      }}
                      onMouseEnter={(e) => {
                        if (!loading) {
                          e.target.style.transform = 'translateY(-2px)';
                          e.target.style.boxShadow = '0 8px 25px rgba(239, 68, 68, 0.4)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!loading) {
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.boxShadow = '0 4px 15px rgba(239, 68, 68, 0.3)';
                        }
                      }}
                    >
                      🔄 Reiniciar Servidor
                    </button>
                    <button
                      onClick={cargarLogs}
                      disabled={loading}
                      style={{
                        padding: '14px 24px',
                        background: loading ? 'rgba(59, 130, 246, 0.5)' : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                        color: 'white',
                        borderRadius: '12px',
                        fontWeight: 'bold',
                        border: 'none',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)'
                      }}
                      onMouseEnter={(e) => {
                        if (!loading) {
                          e.target.style.transform = 'translateY(-2px)';
                          e.target.style.boxShadow = '0 8px 25px rgba(59, 130, 246, 0.4)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!loading) {
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.boxShadow = '0 4px 15px rgba(59, 130, 246, 0.3)';
                        }
                      }}
                    >
                      📄 Recargar Logs
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 📋 Tab: Logs */}
            {activeTab === 'logs' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                  <h2 style={{
                    fontSize: '28px',
                    fontWeight: 'bold',
                    color: '#fdfeffff',
                    textShadow: '1px 1px 2px rgba(240, 237, 237, 0.1)'
                  }}>📋 Logs del Sistema</h2>
                  <button
                    onClick={cargarLogs}
                    disabled={loading}
                    style={{
                      padding: '14px 24px',
                      background: loading ? 'rgba(59, 130, 246, 0.5)' : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                      color: 'white',
                      borderRadius: '12px',
                      fontWeight: 'bold',
                      border: 'none',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                      if (!loading) {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 8px 25px rgba(59, 130, 246, 0.4)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!loading) {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 4px 15px rgba(59, 130, 246, 0.3)';
                      }
                    }}
                  >
                    🔄 Actualizar
                  </button>
                </div>
                
                <div style={{
                  background: 'linear-gradient(135deg, #111827 0%, #1f2937 100%)',
                  color: '#10b981',
                  padding: '24px',
                  borderRadius: '16px',
                  fontFamily: 'monospace',
                  fontSize: '14px',
                  maxHeight: '500px',
                  overflowY: 'auto',
                  border: '2px solid #374151',
                  boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)'
                }}>
                  {logs.length > 0 ? (
                    logs.map((log, index) => (
                      <div key={index} style={{ 
                        marginBottom: '8px',
                        padding: '8px',
                        background: 'rgba(0, 0, 0, 0.2)',
                        borderRadius: '6px',
                        borderLeft: `4px solid ${
                          log.level === 'error' ? '#ef4444' :
                          log.level === 'warn' ? '#f59e0b' :
                          log.level === 'info' ? '#3b82f6' :
                          '#10b981'
                        }`
                      }}>
                        <span style={{ color: '#6b7280', fontSize: '12px' }}>[{log.timestamp}]</span>{' '}
                        <span style={{
                          color: log.level === 'error' ? '#fca5a5' :
                                 log.level === 'warn' ? '#fbbf24' :
                                 log.level === 'info' ? '#93c5fd' :
                                 '#86efac',
                          fontWeight: 'bold',
                          textTransform: 'uppercase',
                          fontSize: '12px'
                        }}>
                          {log.level}
                        </span>{' '}
                        <span style={{ color: '#e5e7eb' }}>{log.message}</span>
                      </div>
                    ))
                  ) : (
                    <div style={{
                      textAlign: 'center',
                      padding: '64px 32px',
                      color: '#6b7280',
                      fontSize: '16px'
                    }}>
                      <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
                      <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>No hay logs disponibles</div>
                      <div style={{ fontSize: '14px' }}>Los logs del sistema aparecerán aquí</div>
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