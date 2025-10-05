// 👥 Usuarios.jsx - Página de gestión de usuarios con estilo Dashboard Admin
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as usuariosAPI from '../services/usuariosAPI';
import '../App.css';

const Usuarios = () => {
    const navigate = useNavigate();
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('create');
    const [selectedUser, setSelectedUser] = useState(null);
    const [userInfo, setUserInfo] = useState(null);
    const [showAdminFix, setShowAdminFix] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        nombre_completo: '',
        rol: 'operador'
    });

    // Verificar si el usuario es admin
    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        setUserInfo(userData);
        
        if (!userData.rol) {
            // Auto-asignar rol de admin si no existe
            establecerAdmin();
            return;
        }
        
        cargarUsuarios();
    }, [navigate]);

    // Función de emergencia para establecer admin
    const establecerAdmin = () => {
        const adminData = {
            id: 1,
            username: 'Juan',
            email: 'juan@admin.com',
            nombre_completo: 'Juan Administrador',
            rol: 'admin'
        };
        
        localStorage.setItem('userData', JSON.stringify(adminData));
        setUserInfo(adminData);
        setShowAdminFix(false);
        cargarUsuarios();
    };

    const cargarUsuarios = async () => {
        try {
            setLoading(true);
            const response = await usuariosAPI.obtenerUsuarios();
            console.log('👥 Usuarios cargados:', response);
            setUsuarios(response || []);
        } catch (error) {
            console.error('❌ Error al cargar usuarios:', error);
            setUsuarios([]);
        } finally {
            setLoading(false);
        }
    };

    const openCreateModal = () => {
        setModalType('create');
        setFormData({
            username: '',
            email: '',
            password: '',
            nombre_completo: '',
            rol: 'operador'
        });
        setShowModal(true);
    };

    const openEditModal = (usuario) => {
        setModalType('edit');
        setSelectedUser(usuario);
        setFormData({
            username: usuario.username || '',
            email: usuario.email || '',
            password: '',
            nombre_completo: usuario.nombre_completo || '',
            rol: usuario.rol || 'operador'
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (modalType === 'create') {
                await usuariosAPI.crearUsuario(formData);
                alert('✅ Usuario creado exitosamente');
            } else {
                const updateData = { ...formData };
                if (!updateData.password) {
                    delete updateData.password;
                }
                await usuariosAPI.actualizarUsuario(selectedUser.id, updateData);
                alert('✅ Usuario actualizado exitosamente');
            }
            setShowModal(false);
            cargarUsuarios();
        } catch (error) {
            console.error('❌ Error:', error);
            alert('❌ Error al guardar usuario');
        }
    };

    const eliminarUsuario = async (id) => {
        if (!confirm('¿Estás seguro de eliminar este usuario?')) return;
        
        try {
            await usuariosAPI.eliminarUsuario(id);
            alert('✅ Usuario eliminado exitosamente');
            cargarUsuarios();
        } catch (error) {
            console.error('❌ Error al eliminar:', error);
            alert('❌ Error al eliminar usuario');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('userData');
        navigate('/login');
    };

    // Pantalla de emergencia para administradores
    if (showAdminFix || (!userInfo?.rol && !loading)) {
        return (
            <div className="dashboard-page">
                <div className="admin-dashboard">
                    <div className="dashboard-header">
                        <div className="user-welcome">
                            <h1>🔧 Configuración de Administrador</h1>
                            <p>Necesitamos configurar tu sesión de administrador</p>
                        </div>
                    </div>
                    
                    <div className="dashboard-section">
                        <div className="section-header">
                            <h2>⚠️ Sesión sin rol definido</h2>
                        </div>
                        <div className="action-buttons">
                            <button className="btn-primary" onClick={establecerAdmin}>
                                🔧 Restablecer Sesión de Admin (Juan)
                            </button>
                            <button className="btn-secondary" onClick={() => navigate('/')}>
                                🏠 Ir al Inicio
                            </button>
                            <button className="btn-secondary" onClick={() => navigate('/dashboard')}>
                                📊 Ir al Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="dashboard-page">
                <div className="admin-dashboard">
                    <div className="dashboard-header">
                        <div className="user-welcome">
                            <h1>⏳ Cargando usuarios...</h1>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-page">
            <div className="admin-dashboard">
                {/* 📋 Header del Administrador */}
                <div className="dashboard-header">
                    <div className="user-welcome">
                        <h1>👥 Gestión de Usuarios</h1>
                        <p>Bienvenido, <strong>{userInfo?.nombre_completo || userInfo?.username}</strong></p>
                        <span className="role-badge admin">Administrador del Sistema</span>
                    </div>
                    <div className="header-actions">
                        <button 
                            className="btn-secondary" 
                            onClick={() => navigate('/dashboard')}
                        >
                            🏠 Dashboard
                        </button>
                        <button 
                            className="btn-primary" 
                            onClick={openCreateModal}
                        >
                            ➕ Nuevo Usuario
                        </button>
                        <button className="btn-danger" onClick={handleLogout}>
                            🚪 Cerrar Sesión
                        </button>
                    </div>
                </div>

                {/* 📊 Métricas principales del sistema */}
                <div className="metrics-row">
                    <div className="metric-card admin">
                        <span className="metric-icon">👥</span>
                        <div className="metric-info">
                            <p className="metric-number">
                                {loading ? '⏳' : usuarios.length}
                            </p>
                            <p className="metric-label">Usuarios Registrados</p>
                        </div>
                    </div>
                    
                    <div className="metric-card admin">
                        <span className="metric-icon">👑</span>
                        <div className="metric-info">
                            <p className="metric-number">
                                {loading ? '⏳' : usuarios.filter(u => u.rol === 'administrador' || u.rol === 'admin').length}
                            </p>
                            <p className="metric-label">Administradores</p>
                        </div>
                    </div>
                    
                    <div className="metric-card admin">
                        <span className="metric-icon">🎓</span>
                        <div className="metric-info">
                            <p className="metric-number">
                                {loading ? '⏳' : usuarios.filter(u => u.rol === 'experto').length}
                            </p>
                            <p className="metric-label">Expertos</p>
                        </div>
                    </div>
                    
                    <div className="metric-card admin">
                        <span className="metric-icon">🔧</span>
                        <div className="metric-info">
                            <p className="metric-number">
                                {loading ? '⏳' : usuarios.filter(u => u.rol === 'operador').length}
                            </p>
                            <p className="metric-label">Operadores</p>
                        </div>
                    </div>
                </div>

                {/* 📝 Tabla de Usuarios */}
                <div className="dashboard-section">
                    <div className="section-header">
                        <h2>📋 Lista de Usuarios</h2>
                        <div className="section-actions">
                            <button 
                                className="btn-primary"
                                onClick={openCreateModal}
                            >
                                ➕ Nuevo Usuario
                            </button>
                        </div>
                    </div>

                    <div className="table-container">
                        {usuarios.length > 0 ? (
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>👤 Usuario</th>
                                        <th>📧 Email</th>
                                        <th>👨‍💼 Nombre Completo</th>
                                        <th>🎭 Rol</th>
                                        <th>⚡ Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {usuarios.map((usuario) => (
                                        <tr key={usuario.id}>
                                            <td>{usuario.username}</td>
                                            <td>{usuario.email}</td>
                                            <td>{usuario.nombre_completo}</td>
                                            <td>
                                                <span className={`role-badge ${usuario.rol || 'operador'}`}>
                                                    {usuario.rol === 'admin' || usuario.rol === 'administrador' ? '👑 Admin' :
                                                     usuario.rol === 'experto' ? '🎓 Experto' :
                                                     '🔧 Operador'}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="action-buttons">
                                                    <button
                                                        onClick={() => openEditModal(usuario)}
                                                        className="btn-edit"
                                                        title="Editar usuario"
                                                    >
                                                        ✏️
                                                    </button>
                                                    <button
                                                        onClick={() => eliminarUsuario(usuario.id)}
                                                        className="btn-delete"
                                                        title="Eliminar usuario"
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="empty-state">
                                <div className="empty-icon">👥</div>
                                <h3>No hay usuarios registrados</h3>
                                <p>Comienza creando el primer usuario del sistema citrícola</p>
                                <button
                                    onClick={openCreateModal}
                                    className="btn-primary"
                                >
                                    ➕ Crear Primer Usuario
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Modal para Crear/Editar Usuario */}
                {showModal && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h3>
                                    {modalType === 'create' ? '➕ Crear Nuevo Usuario' : '✏️ Editar Usuario'}
                                </h3>
                                <button 
                                    className="modal-close"
                                    onClick={() => setShowModal(false)}
                                >
                                    ❌
                                </button>
                            </div>
                            
                            <form onSubmit={handleSubmit} className="modal-form">
                                <div className="form-group">
                                    <label>👤 Username</label>
                                    <input
                                        type="text"
                                        value={formData.username}
                                        onChange={(e) => setFormData({...formData, username: e.target.value})}
                                        placeholder="Ingresa el nombre de usuario"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>📧 Email</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                        placeholder="usuario@example.com"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>👨‍💼 Nombre Completo</label>
                                    <input
                                        type="text"
                                        value={formData.nombre_completo}
                                        onChange={(e) => setFormData({...formData, nombre_completo: e.target.value})}
                                        placeholder="Nombre y apellido completo"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>🔒 Password {modalType === 'edit' && '(opcional)'}</label>
                                    <input
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                                        placeholder={modalType === 'create' ? 'Contraseña segura' : 'Dejar vacío para mantener actual'}
                                        required={modalType === 'create'}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>🎭 Rol en el Sistema</label>
                                    <select
                                        value={formData.rol}
                                        onChange={(e) => setFormData({...formData, rol: e.target.value})}
                                        required
                                    >
                                        <option value="operador">🔧 Operador - Operaciones básicas</option>
                                        <option value="experto">🎓 Experto - Conocimiento especializado</option>
                                        <option value="admin">👑 Administrador - Control total</option>
                                    </select>
                                </div>

                                <div className="modal-actions">
                                    <button type="submit" className="btn-primary">
                                        {modalType === 'create' ? '✨ Crear Usuario' : '💾 Actualizar'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="btn-secondary"
                                    >
                                        ❌ Cancelar
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Usuarios;