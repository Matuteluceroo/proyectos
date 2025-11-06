// 🔧 DashboardAdmin.jsx - Panel del Administrador con notificaciones
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../hooks/useNotification";
import NotificacionesPanel from "../components/NotificacionesPanel/NotificacionesPanel";
import { obtenerMetricasGenerales } from "../services/metricasAPI";
import "./DashboardAdmin.css";
import {
  Users,
  FileText,
  Folders,
  Package, // métricas
  Bell,
  LogOut, // acciones encabezado
  Settings,
  BarChart3,
  Database,
  ShieldCheck,
  Wrench, // acciones
  UserCog,
  GraduationCap,
  UserSquare, // roles
  ActivitySquare, // actividad
} from "lucide-react";
import { Icon } from "../components/Icon"; // ajustá ruta si la pusiste en otro lado

const DashboardAdmin = () => {
  const { user, logout, API_URL } = useAuth();
  const { showSuccess, showError, showInfo } = useNotification();
  const navigate = useNavigate();
  const [metricas, setMetricas] = useState({
    usuarios: 0,
    documentos: 0,
    categorias: 0,
    capacitaciones: 0,
    usuariosPorRol: { administradores: 0, expertos: 0, operadores: 0 },
    actividadReciente: [],
  });
  const [loading, setLoading] = useState(true);
  const [backendConnected, setBackendConnected] = useState(true);

  // 📊 Cargar métricas del sistema
  const cargarMetricas = async () => {
    try {
      setLoading(true);
      console.log("🔄 Cargando métricas del sistema...");
      
      const data = await obtenerMetricasGenerales();
      console.log("📊 Datos de métricas recibidos:", data);

      if (data.metricas) {
        setMetricas(data.metricas);
        setBackendConnected(true);
        showSuccess?.("Métricas actualizadas", {
          message: "Datos del sistema cargados correctamente",
        });
      } else {
        console.warn("⚠️ Estructura de métricas inesperada:", data);
        setBackendConnected(false);
        showError?.("Error al cargar métricas", {
          message: data.error || "No se pudieron obtener las estadísticas",
        });
      }
    } catch (error) {
      console.error("❌ Error al cargar métricas:", error);
      setBackendConnected(false);
      showError?.("Error de conexión", {
        message: error.message || "No se pudo conectar con el servidor",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarMetricas();
    // Mostrar notificación de bienvenida
    showInfo(
      `Bienvenido panel de administración, ${
        user?.nombre_completo || user?.username
      }`,
      {
        message: "Tienes acceso completo al sistema",
      }
    );
  }, []);

  const handleLogout = () => {
    showSuccess("Sesión cerrada correctamente");
    logout();
    navigate("/login");
  };

  const handleTestNotifications = () => {
    showSuccess("¡Notificación de éxito!", {
      message: "Esta es una notificación de prueba exitosa",
    });

    setTimeout(() => {
      showError("Notificación de error", {
        message: "Esta es una notificación de error de prueba",
      });
    }, 1000);

    setTimeout(() => {
      showInfo("Notificación informativa", {
        message: "Esta es una notificación informativa de prueba",
      });
    }, 2000);
  };

  return (
    <div className="dashboard-modern">
      <div className="dashboard-page">
        <div className="admin-dashboard">
          {/* 📋 Header del Administrador */}
          <div className="dashboard-header">
            <div className="user-welcome">
              <h1>Panel de Administración</h1>
              <p>
                Bienvenido,{" "}
                <strong>{user?.nombre_completo || user?.username}</strong>
              </p>
              <span className="role-badge admin">
                Administrador del Sistema
              </span>
              {!backendConnected && (
                <div className="connection-warning">
                  ⚠️ Backend desconectado - Algunas funciones pueden no estar
                  disponibles
                </div>
              )}
            </div>

            <div className="header-actions">
              <button
                className="btn"
                title="Notificaciones"
                onClick={handleTestNotifications}
              >
                <Icon as={Bell} />
              </button>
              <button
                className="btn btn-danger"
                title="Cerrar sesión"
                onClick={handleLogout}
              >
                <Icon as={LogOut} />
              </button>
            </div>
          </div>

          {/* 📊 Métricas principales del sistema */}
          <div className="metrics-row">
            <div className="metric-card admin">
              <div className="icon-bubble">
                <Icon as={Users} />
              </div>
              <div className="metric-info">
                <p className="metric-number">
                  {loading ? "⏳" : metricas.usuarios}
                </p>
                <p className="metric-label">Usuarios Registrados</p>
              </div>
            </div>

            <div className="metric-card admin">
              <div className="icon-bubble">
                <Icon as={FileText} />
              </div>
              <div className="metric-info">
                <p className="metric-number">
                  {loading ? "⏳" : metricas.documentos}
                </p>
                <p className="metric-label">Documentos Totales</p>
              </div>
            </div>

            <div className="metric-card admin">
              <div className="icon-bubble">
                <Icon as={Folders} />
              </div>
              <div className="metric-info">
                <p className="metric-number">
                  {loading ? "⏳" : metricas.categorias}
                </p>
                <p className="metric-label">Categorías Activas</p>
              </div>
            </div>

            <div className="metric-card admin">
              <div className="icon-bubble">
                <Icon as={GraduationCap} />
              </div>
              <div className="metric-info">
                <p className="metric-number">
                  {loading ? "⏳" : metricas.capacitaciones}
                </p>
                <p className="metric-label">Capacitaciones</p>
              </div>
            </div>
          </div>

          {/* 📈 Métricas adicionales por rol */}
          {!loading && metricas.usuariosPorRol && (
            <div className="role-metrics">
              <h3>Distribución de Usuarios por Rol</h3>
              <div className="role-stats">
                <div className="role-stat" data-variant="admin">
                  <div className="icon-bubble">
                    <Icon as={UserCog} />
                  </div>
                  <div className="role-info">
                    <p className="role-count">
                      {metricas.usuariosPorRol.administradores}
                    </p>
                    <p className="role-name">Administradores</p>
                  </div>
                </div>

                <div className="role-stat" data-variant="expert">
                  <div className="icon-bubble">
                    <Icon as={GraduationCap} />
                  </div>
                  <div className="role-info">
                    <p className="role-count">
                      {metricas.usuariosPorRol.expertos}
                    </p>
                    <p className="role-name">Expertos</p>
                  </div>
                </div>

                <div className="role-stat" data-variant="operator">
                  <div className="icon-bubble">
                    <Icon as={UserSquare} />
                  </div>
                  <div className="role-info">
                    <p className="role-count">
                      {metricas.usuariosPorRol.operadores}
                    </p>
                    <p className="role-name">Operadores</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 🎯 Acciones de administración */}
          <div className="admin-actions">
            <h3>Administración del Sistema</h3>
            <div className="action-grid">
              <button
                className="action-card primary"
                onClick={() => {
                  showInfo("Navegando a gestión de usuarios");
                  navigate("/usuarios");
                }}
              >
                <div className="icon-bubble">
                  <Icon as={Users} />
                </div>
                <span className="action-title">Gestionar Usuarios</span>
                <span className="action-desc">
                  Crear, editar y administrar usuarios
                </span>
              </button>

              <button
                className="action-card primary"
                onClick={() => {
                  showInfo("Navegando a gestión de contenido");
                  navigate("/gestionar-contenido");
                }}
              >
                <div className="icon-bubble">
                  <Icon as={Database} />
                </div>
                <span className="action-title">Gestionar Contenido</span>
                <span className="action-desc">
                  Administrar categorías y documentos
                </span>
              </button>

              <button
                className="action-card"
                onClick={() => {
                  showInfo("Navegando a configuración del sistema");
                  navigate("/configuracion");
                }}
              >
                <div className="icon-bubble">
                  <Icon as={Settings} />
                </div>
                <span className="action-title">Configuración</span>
                <span className="action-desc">
                  Ajustes generales del sistema
                </span>
              </button>

              <button
                className="action-card primary"
                onClick={() => {
                  showInfo("Navegando a reportes del sistema");
                  navigate("/reportes");
                }}
              >
                <div className="icon-bubble">
                  <Icon as={BarChart3} />
                </div>
                <span className="action-title">Reportes</span>
                <span className="action-desc">Estadísticas y análisis</span>
              </button>
            </div>
          </div>

          {/* 🔍 Actividad reciente del sistema */}
          {/* 🔍 Actividad reciente del sistema */}
          <div className="system-activity">
            <div className="toolbar">
              <h3>Actividad Reciente del Sistema</h3>
              <button
                className="btn-small btn-secondary"
                onClick={cargarMetricas}
                disabled={loading}
              >
                <Icon as={ActivitySquare} />{" "}
                {loading ? "Actualizando..." : "Actualizar"}
              </button>
            </div>

            <div className="activity-feed">
              {loading ? (
                <div className="activity-item">
                  <div className="activity-icon">
                    <Icon as={ActivitySquare} />
                  </div>
                  <div className="activity-content">
                    <p>Cargando actividad reciente...</p>
                  </div>
                </div>
              ) : metricas.actividadReciente?.length ? (
                metricas.actividadReciente.map((actividad, index) => (
                  <div key={index} className="activity-item">
                    <div className="activity-icon">
                      <Icon as={ActivitySquare} />
                    </div>
                    <div className="activity-content">
                      <p>{actividad.descripcion}</p>
                      <span className="activity-time">
                        {new Date(actividad.fecha).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="activity-item">
                  <div className="activity-icon">
                    <Icon as={ActivitySquare} />
                  </div>
                  <div className="activity-content">
                    <p>No hay actividad reciente registrada</p>
                    <span className="activity-time">
                      Sistema recién inicializado
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
          {/* fin */}
        </div>
      </div>
    </div>
  );
};

export default DashboardAdmin;
