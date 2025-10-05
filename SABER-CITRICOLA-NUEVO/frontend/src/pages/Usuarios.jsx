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
            setUsuarios(response.data || []);
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
            console.log('🚀 Enviando datos del formulario:', formData);
            
            if (modalType === 'create') {
                const response = await usuariosAPI.crearUsuario(formData);
                console.log('✅ Respuesta del servidor:', response);
                alert('✅ Usuario creado exitosamente');
            } else {
                const updateData = { ...formData };
                if (!updateData.password) {
                    delete updateData.password;
                }
                const response = await usuariosAPI.actualizarUsuario(selectedUser.id, updateData);
                console.log('✅ Respuesta del servidor:', response);
                alert('✅ Usuario actualizado exitosamente');
            }
            setShowModal(false);
            cargarUsuarios();
        } catch (error) {
            console.error('❌ Error completo:', error);
            console.error('❌ Mensaje del error:', error.message);
            console.error('❌ Response del error:', error.response);
            
            // Mostrar error más específico
            let errorMessage = 'Error desconocido';
            if (error.response && error.response.data && error.response.data.mensaje) {
                errorMessage = error.response.data.mensaje;
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            alert(`❌ Error al guardar usuario: ${errorMessage}`);
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
        <div className="dashboard-page" style={{ background: 'linear-gradient(135deg, #ff9800, #ffeb3b)', minHeight: '100vh', padding: '20px', margin: '0' }}>
            <div className="admin-dashboard" style={{ background: 'white', borderRadius: '20px', padding: '30px', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)', width: '100%', maxWidth: 'none', margin: '0' }}>
                {/* 📋 Header del Administrador */}
                <div className="dashboard-header" style={{ background: 'linear-gradient(135deg, #e53e3e, #ff6b6b)', color: 'white', padding: '25px', borderRadius: '15px', marginBottom: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div className="user-welcome">
                        <h1>👥 Gestión de Usuarios</h1>
                        <p>Bienvenido, <strong>{userInfo?.nombre_completo || userInfo?.username}</strong></p>
                        <span className="role-badge admin" style={{ background: 'rgba(255, 255, 255, 0.2)', color: 'white', padding: '8px 16px', borderRadius: '20px', fontSize: '0.9em', marginTop: '10px', display: 'inline-block' }}>Administrador del Sistema</span>
                    </div>
                    <div className="header-actions" style={{ display: 'flex', gap: '10px' }}>
                        <button 
                            className="btn-secondary" 
                            onClick={() => navigate('/dashboard')}
                            style={{ background: 'rgba(255,255,255,0.2)', color: 'white', padding: '10px 20px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                            🏠 Dashboard
                        </button>
                        <button 
                            className="btn-primary" 
                            onClick={openCreateModal}
                            style={{ background: 'rgba(255,255,255,0.2)', color: 'white', padding: '10px 20px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                            ➕ Nuevo Usuario
                        </button>
                        <button 
                            className="btn-danger" 
                            onClick={handleLogout}
                            style={{ background: 'rgba(255,255,255,0.2)', color: 'white', padding: '10px 20px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                            🚪 Cerrar Sesión
                        </button>
                    </div>
                </div>

                {/* 📊 Métricas principales del sistema */}
                <div className="metrics-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                    <div className="metric-card admin" style={{ background: 'linear-gradient(135deg, #fef3c7, #fde68a)', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                        <span className="metric-icon" style={{ fontSize: '24px', marginBottom: '10px', display: 'block' }}>👥</span>
                        <div className="metric-info">
                            <p className="metric-number" style={{ fontSize: '24px', fontWeight: 'bold', color: '#e53e3e', margin: '0' }}>
                                {loading ? '⏳' : usuarios.length}
                            </p>
                            <p className="metric-label" style={{ fontSize: '14px', color: '#666', margin: '0' }}>Usuarios Registrados</p>
                        </div>
                    </div>
                    
                    <div className="metric-card admin" style={{ background: 'linear-gradient(135deg, #fef3c7, #fde68a)', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                        <span className="metric-icon" style={{ fontSize: '24px', marginBottom: '10px', display: 'block' }}>👑</span>
                        <div className="metric-info">
                            <p className="metric-number" style={{ fontSize: '24px', fontWeight: 'bold', color: '#e53e3e', margin: '0' }}>
                                {loading ? '⏳' : usuarios.filter(u => u.rol === 'administrador' || u.rol === 'admin').length}
                            </p>
                            <p className="metric-label" style={{ fontSize: '14px', color: '#666', margin: '0' }}>Administradores</p>
                        </div>
                    </div>
                    
                    <div className="metric-card admin" style={{ background: 'linear-gradient(135deg, #fef3c7, #fde68a)', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                        <span className="metric-icon" style={{ fontSize: '24px', marginBottom: '10px', display: 'block' }}>🎓</span>
                        <div className="metric-info">
                            <p className="metric-number" style={{ fontSize: '24px', fontWeight: 'bold', color: '#e53e3e', margin: '0' }}>
                                {loading ? '⏳' : usuarios.filter(u => u.rol === 'experto').length}
                            </p>
                            <p className="metric-label" style={{ fontSize: '14px', color: '#666', margin: '0' }}>Expertos</p>
                        </div>
                    </div>
                    
                    <div className="metric-card admin" style={{ background: 'linear-gradient(135deg, #fef3c7, #fde68a)', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                        <span className="metric-icon" style={{ fontSize: '24px', marginBottom: '10px', display: 'block' }}>🔧</span>
                        <div className="metric-info">
                            <p className="metric-number" style={{ fontSize: '24px', fontWeight: 'bold', color: '#e53e3e', margin: '0' }}>
                                {loading ? '⏳' : usuarios.filter(u => u.rol === 'operador').length}
                            </p>
                            <p className="metric-label" style={{ fontSize: '14px', color: '#666', margin: '0' }}>Operadores</p>
                        </div>
                    </div>
                </div>

                {/* 📝 Tabla de Usuarios */}
                <div className="dashboard-section" style={{ marginBottom: '30px' }}>
                    <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', padding: '20px', background: 'linear-gradient(135deg, #e53e3e, #ff6b6b)', borderRadius: '15px' }}>
                        <h2 style={{ color: 'white', margin: '0' }}>📋 Lista de Usuarios</h2>
                        <div className="section-actions">
                            <button 
                                className="btn-primary"
                                onClick={openCreateModal}
                                style={{ background: 'rgba(255,255,255,0.2)', color: 'white', padding: '10px 20px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                            >
                                ➕ Nuevo Usuario
                            </button>
                        </div>
                    </div>

                    <div className="table-container" style={{ background: 'white', borderRadius: '10px', padding: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', overflowX: 'auto' }}>
                        {usuarios.length > 0 ? (
                            <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                                <thead>
                                    <tr style={{ background: '#f8f9fa' }}>
                                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e9ecef', fontWeight: 'bold' }}>👤 Usuario</th>
                                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e9ecef', fontWeight: 'bold' }}>📧 Email</th>
                                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e9ecef', fontWeight: 'bold' }}>👨‍💼 Nombre Completo</th>
                                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e9ecef', fontWeight: 'bold' }}>🎭 Rol</th>
                                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e9ecef', fontWeight: 'bold' }}>⚡ Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {usuarios.map((usuario) => (
                                        <tr key={usuario.id} style={{ borderBottom: '1px solid #e9ecef' }}>
                                            <td style={{ padding: '12px' }}>{usuario.username}</td>
                                            <td style={{ padding: '12px' }}>{usuario.email}</td>
                                            <td style={{ padding: '12px' }}>{usuario.nombre_completo}</td>
                                            <td style={{ padding: '12px' }}>
                                                <span className={`role-badge ${usuario.rol || 'operador'}`} style={{ 
                                                    background: usuario.rol === 'admin' || usuario.rol === 'administrador' ? '#e53e3e' : 
                                                               usuario.rol === 'experto' ? '#3182ce' : '#38a169',
                                                    color: 'white',
                                                    padding: '4px 12px',
                                                    borderRadius: '20px',
                                                    fontSize: '12px',
                                                    fontWeight: 'bold'
                                                }}>
                                                    {usuario.rol === 'admin' || usuario.rol === 'administrador' ? '👑 Admin' :
                                                     usuario.rol === 'experto' ? '🎓 Experto' :
                                                     '🔧 Operador'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '12px' }}>
                                                <div className="action-buttons" style={{ display: 'flex', gap: '8px' }}>
                                                    <button
                                                        onClick={() => openEditModal(usuario)}
                                                        className="btn-edit"
                                                        title="Editar usuario"
                                                        style={{ background: '#ffa500', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}
                                                    >
                                                        ✏️
                                                    </button>
                                                    <button
                                                        onClick={() => eliminarUsuario(usuario.id)}
                                                        className="btn-delete"
                                                        title="Eliminar usuario"
                                                        style={{ background: '#dc3545', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}
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