// 👥 Usuarios.jsx - Página de gestión de usuarios con estilo Dashboard Admin
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as usuariosAPI from "../services/usuariosAPI";

// src/pages/Usuarios.jsx
import { useCallback } from "react";

// Íconos pro
import {
  Users,
  Crown,
  GraduationCap,
  Wrench,
  LayoutDashboard,
  Plus,
  LogOut,
  Pencil,
  Trash2,
  User2,
  Mail,
  IdCard,
  ShieldHalf,
} from "lucide-react";
import { Icon } from "../components/Icon"; // ajustá la ruta si es distinta

// Tema visual de esta página (scoped + neutraliza globales)
import "./Usuarios.pro.css";

export default function Usuarios() {
  const navigate = useNavigate();

  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("create");
  const [selectedUser, setSelectedUser] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    nombre_completo: "",
    rol: "operador",
  });

  // Helpers
  const openCreateModal = useCallback(() => {
    setModalType("create");
    setFormData({
      username: "",
      email: "",
      password: "",
      nombre_completo: "",
      rol: "operador",
    });
    setShowModal(true);
  }, []);

  const openEditModal = useCallback((usuario) => {
    setModalType("edit");
    setSelectedUser(usuario);
    setFormData({
      username: usuario.username || "",
      email: usuario.email || "",
      password: "",
      nombre_completo: usuario.nombre_completo || "",
      rol: usuario.rol || "operador",
    });
    setShowModal(true);
  }, []);

  const cargarUsuarios = useCallback(async () => {
    try {
      setLoading(true);
      const resp = await usuariosAPI.obtenerUsuarios();
      setUsuarios(resp.data || []);
    } catch (e) {
      console.error(e);
      setUsuarios([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalType === "create") {
        await usuariosAPI.crearUsuario(formData);
      } else {
        const body = { ...formData };
        if (!body.password) delete body.password;
        await usuariosAPI.actualizarUsuario(selectedUser.id, body);
      }
      setShowModal(false);
      cargarUsuarios();
    } catch (e) {
      console.error(e);
      alert("Error al guardar usuario");
    }
  };

  const eliminarUsuario = async (id) => {
    if (!confirm("¿Eliminar usuario?")) return;
    try {
      await usuariosAPI.eliminarUsuario(id);
      cargarUsuarios();
    } catch {
      alert("Error al eliminar");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userData");
    navigate("/login");
  };

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("userData") || "{}");
    setUserInfo(userData);
    cargarUsuarios();
  }, [cargarUsuarios]);

  // Métricas
  const mTotal = usuarios.length;
  const mAdmins = usuarios.filter((u) =>
    ["admin", "administrador"].includes(u.rol)
  ).length;
  const mExpert = usuarios.filter((u) => u.rol === "experto").length;
  const mOper = usuarios.filter((u) => u.rol === "operador").length;

  return (
    <div className="usuarios-modern">
      <div className="usuarios-page">
        <div className="usuarios-wrap">
          {/* Header */}
          <header className="u-header">
            <div className="u-welcome">
              <h1>
                <Icon as={Users} /> Gestión de Usuarios
              </h1>
              <p>
                Bienvenido,{" "}
                <strong>
                  {userInfo?.nombre_completo ||
                    userInfo?.username ||
                    "Administrador"}
                </strong>
              </p>
              <span className="u-badge">Administrador del Sistema</span>
            </div>

            <div className="u-actions">
              <button className="btn" onClick={() => navigate("/dashboard")}>
                <Icon as={LayoutDashboard} /> Dashboard
              </button>
              <button className="btn" onClick={openCreateModal}>
                <Icon as={Plus} /> Nuevo Usuario
              </button>
              <button className="btn" onClick={handleLogout}>
                <Icon as={LogOut} /> Volver 
              </button>
            </div>
          </header>

          {/* Métricas */}
          <section className="u-metrics">
            <div className="metric">
              <div className="icon-bubble">
                <Icon as={Users} />
              </div>
              <div>
                <p className="num">{loading ? "⏳" : mTotal}</p>
                <p className="lbl">Usuarios Registrados</p>
              </div>
            </div>

            <div className="metric">
              <div className="icon-bubble">
                <Icon as={Crown} />
              </div>
              <div>
                <p className="num">{loading ? "⏳" : mAdmins}</p>
                <p className="lbl">Administradores</p>
              </div>
            </div>

            <div className="metric">
              <div className="icon-bubble">
                <Icon as={GraduationCap} />
              </div>
              <div>
                <p className="num">{loading ? "⏳" : mExpert}</p>
                <p className="lbl">Expertos</p>
              </div>
            </div>

            <div className="metric">
              <div className="icon-bubble">
                <Icon as={Wrench} />
              </div>
              <div>
                <p className="num">{loading ? "⏳" : mOper}</p>
                <p className="lbl">Operadores</p>
              </div>
            </div>
          </section>

          {/* Tabla */}
          <section className="u-table-section">
            <div className="u-table-header">
              <h2>Lista de Usuarios</h2>
              <button className="btn btn-primary" onClick={openCreateModal}>
                <Icon as={Plus} /> Nuevo Usuario
              </button>
            </div>

            <div className="u-table-wrapper">
              {usuarios.length ? (
                <table className="u-table">
                  <thead>
                    <tr>
                      <th>
                        <Icon as={User2} /> Usuario
                      </th>
                      <th>
                        <Icon as={Mail} /> Email
                      </th>
                      <th>
                        <Icon as={IdCard} /> Nombre Completo
                      </th>
                      <th>
                        <Icon as={ShieldHalf} /> Rol
                      </th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usuarios.map((u) => (
                      <tr key={u.id}>
                        <td>{u.username}</td>
                        <td>{u.email}</td>
                        <td>{u.nombre_completo}</td>
                        <td>
                          <span
                            className={
                              "role-chip " +
                              (["admin", "administrador"].includes(u.rol)
                                ? "admin"
                                : u.rol === "experto"
                                ? "expert"
                                : "operator")
                            }
                          >
                            {["admin", "administrador"].includes(u.rol)
                              ? "Admin"
                              : u.rol === "experto"
                              ? "Experto"
                              : "Operador"}
                          </span>
                        </td>
                        <td>
                          <div className="row-actions">
                            <button
                              className="btn"
                              title="Editar"
                              onClick={() => openEditModal(u)}
                            >
                              <Icon as={Pencil} />
                            </button>
                            <button
                              className="btn"
                              title="Eliminar"
                              onClick={() => eliminarUsuario(u.id)}
                            >
                              <Icon as={Trash2} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="empty">
                  <div className="icon-bubble lg">
                    <Icon as={Users} />
                  </div>
                  <h3>No hay usuarios registrados</h3>
                  <p>Comenzá creando el primer usuario del sistema.</p>
                  <button className="btn btn-primary" onClick={openCreateModal}>
                    <Icon as={Plus} /> Crear usuario
                  </button>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="u-modal">
          <div className="u-modal-card">
            <div className="u-modal-head">
              <h3>
                {modalType === "create"
                  ? "Crear nuevo usuario"
                  : "Editar usuario"}
              </h3>
              <button
                className="icon-btn"
                onClick={() => setShowModal(false)}
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>

            <form className="u-form" onSubmit={handleSubmit}>
              <label>
                <span>Usuario</span>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  required
                />
              </label>

              <label>
                <span>Email</span>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
              </label>

              <label>
                <span>Nombre Completo</span>
                <input
                  type="text"
                  value={formData.nombre_completo}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      nombre_completo: e.target.value,
                    })
                  }
                  required
                />
              </label>

              <label>
                <span>Password {modalType === "edit" ? "(opcional)" : ""}</span>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required={modalType === "create"}
                />
              </label>

              <label>
                <span>Rol</span>
                <select
                  value={formData.rol}
                  onChange={(e) =>
                    setFormData({ ...formData, rol: e.target.value })
                  }
                >
                  <option value="operador">Operador</option>
                  <option value="experto">Experto</option>
                  <option value="admin">Administrador</option>
                </select>
              </label>

              <div className="u-modal-actions">
                <button type="submit" className="btn btn-primary">
                  {modalType === "create" ? "Crear" : "Actualizar"}
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={() => setShowModal(false)}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
