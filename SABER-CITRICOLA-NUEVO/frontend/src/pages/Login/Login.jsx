// 🔐 Login.jsx - Página de login renovada y atractiva
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useNotification } from "../../hooks/useNotification";
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const { showSuccess, showError } = useNotification();

  // Estado del formulario
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  // Validación
  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = "Usuario es requerido";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Contraseña es requerida";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar cambios
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showError("Por favor, corrige los errores en el formulario");
      return;
    }

    try {
      const result = await login(formData.username, formData.password);

      if (result.success) {
        const userName =
          result.usuario?.nombre_completo ||
          result.usuario?.username ||
          "Usuario";
        showSuccess(`¡Bienvenido ${userName}!`);

        // Redirigir al dashboard
        navigate("/dashboard");
      } else {
        showError(result.message || "Error al iniciar sesión");
      }
    } catch (error) {
      console.error("Error durante el login:", error);
      showError("Error de conexión. Verifica tu conexión a internet.");
    }
  };

  return (
    <div className="login-container">
      {/* Background con patrones decorativos */}
      <div className="login-background">
        <div className="bg-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
          <div className="shape shape-4"></div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="login-content">
        {/* Panel izquierdo - Branding */}
        <div className="login-branding">
          <div className="branding-content">
            <div className="logo-section">
              <div className="logo-circle">
                <img
                  src="/logo.png"
                  alt="Logo de Saber Citrícola"
                  className="logo-icon"
                />
              </div>
              <h1 className="brand-title">Saber Citrícola</h1>
              <p className="brand-subtitle">
                Sistema de Gestión del Conocimiento
              </p>
            </div>

            <div className="feature-highlights">
              <div className="feature-item">
                <div>
                  <h3>Biblioteca Digital</h3>
                  <p>Accede a todo el conocimiento citrícola</p>
                </div>
              </div>
              <div className="feature-item">
                <div>
                  <h3>Búsqueda por Voz</h3>
                  <p>Encuentra información con comandos de voz</p>
                </div>
              </div>
              <div className="feature-item">
                <div>
                  <h3>Reportes Avanzados</h3>
                  <p>Análisis detallados de tu progreso</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Panel derecho - Formulario */}
        <div className="login-form-panel">
          <div className="form-container">
            <div className="form-header">
              <h2>¡Bienvenido de vuelta!</h2>
              <p>Ingresa tus credenciales para continuar</p>
            </div>

            <form onSubmit={handleSubmit} className="login-form">
              <div className="input-group">
                <label htmlFor="username" className="input-label">
                  Usuario
                </label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className={`form-input ${errors.username ? "error" : ""}`}
                    placeholder="Ingresa tu usuario"
                  />
                </div>
                {errors.username && (
                  <span className="error-message">{errors.username}</span>
                )}
              </div>

              <div className="input-group">
                <label htmlFor="password" className="input-label">
                  Contraseña
                </label>
                <div className="input-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`form-input ${errors.password ? "error" : ""}`}
                    placeholder="Ingresa tu contraseña"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
                {errors.password && (
                  <span className="error-message">{errors.password}</span>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="login-button"
              >
                {isLoading ? (
                  <div className="loading-content">
                    <div className="spinner"></div>
                    <span>Iniciando sesión...</span>
                  </div>
                ) : (
                  <div className="button-content">
                    <span>Iniciar Sesión</span>
                    <span className="button-arrow">→</span>
                  </div>
                )}
              </button>
            </form>

            {/* Usuarios de prueba */}
            <div className="demo-users">
              <h3>Usuarios de demostración</h3>
              <div className="demo-grid">
                <button
                  type="button"
                  className="demo-user admin"
                  onClick={() =>
                    setFormData({ username: "admin", password: "123456" })
                  }
                >
                  <div className="demo-info">
                    <span className="demo-role">Administrador</span>
                    <span className="demo-credentials">admin / 123456</span>
                  </div>
                </button>

                <button
                  type="button"
                  className="demo-user expert"
                  onClick={() =>
                    setFormData({ username: "experto1", password: "123456" })
                  }
                >
                  <div className="demo-info">
                    <span className="demo-role">Experto</span>
                    <span className="demo-credentials">experto1 / 123456</span>
                  </div>
                </button>

                <button
                  type="button"
                  className="demo-user operator"
                  onClick={() =>
                    setFormData({ username: "operador1", password: "123456" })
                  }
                >
                  <div className="demo-info">
                    <span className="demo-role">Operador</span>
                    <span className="demo-credentials">operador1 / 123456</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
