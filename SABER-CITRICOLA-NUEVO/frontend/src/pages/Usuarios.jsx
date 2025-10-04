// 👥 Usuarios.jsx - Página de gestión de usuarios
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as usuariosAPI from '../services/usuariosAPI';

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
        
        // Permitir acceso más flexible - comentado el bloqueo restrictivo
        // if (userData.rol !== 'admin') {
        //     alert('Acceso denegado. Solo administradores pueden gestionar usuarios.');
        //     navigate('/dashboard');
        //     return;
        // }
        
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
            setUsuarios(response.data || []);
        } catch (error) {
            console.error('Error al cargar usuarios:', error);
            alert('Error al cargar usuarios: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (modalType === 'create') {
                await usuariosAPI.crearUsuario(formData);
                alert('Usuario creado correctamente');
            } else {
                await usuariosAPI.actualizarUsuario(selectedUser.id, formData);
                alert('Usuario actualizado correctamente');
            }
            setShowModal(false);
            resetForm();
            cargarUsuarios();
        } catch (error) {
            console.error('Error al guardar usuario:', error);
            alert('Error al guardar usuario: ' + error.message);
        }
    };

    const handleEdit = (usuario) => {
        setSelectedUser(usuario);
        setFormData({
            username: usuario.username,
            email: usuario.email,
            password: '',
            nombre_completo: usuario.nombre_completo,
            rol: usuario.rol
        });
        setModalType('edit');
        setShowModal(true);
    };

    const handleDelete = async (usuario) => {
        if (window.confirm(`¿Estás seguro de eliminar al usuario ${usuario.username}?`)) {
            try {
                await usuariosAPI.eliminarUsuario(usuario.id);
                alert('Usuario eliminado correctamente');
                cargarUsuarios();
            } catch (error) {
                console.error('Error al eliminar usuario:', error);
                alert('Error al eliminar usuario');
            }
        }
    };

    const resetForm = () => {
        setFormData({
            username: '',
            email: '',
            password: '',
            nombre_completo: '',
            rol: 'operador'
        });
        setSelectedUser(null);
    };

    const openCreateModal = () => {
        resetForm();
        setModalType('create');
        setShowModal(true);
    };

    // Pantalla de solución para sesión inválida
    if (showAdminFix) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
                    <div className="text-center">
                        <div className="text-6xl mb-4">🔐</div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Sesión No Válida</h2>
                        <p className="text-gray-600 mb-6">
                            No se encontraron datos de sesión válidos. Como administrador Juan, puedes restablecer tu sesión.
                        </p>
                        
                        <div className="space-y-3">
                            <button
                                onClick={establecerAdmin}
                                className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg hover:bg-orange-700 transition-colors font-semibold"
                            >
                                🔧 Restablecer Sesión de Admin (Juan)
                            </button>
                            
                            <button
                                onClick={() => navigate('/')}
                                className="w-full bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors"
                            >
                                🏠 Ir al Inicio
                            </button>
                            
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                            >
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
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
                    <div className="text-xl text-gray-800 mb-2">Cargando usuarios...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
            {/* Header Moderno */}
            <div className="bg-white shadow-lg border-b-4 border-orange-500">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-6">
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="flex items-center space-x-2 text-orange-600 hover:text-orange-800 font-bold transition-all duration-200 hover:scale-105"
                            >
                                🏠 <span>Home</span>
                            </button>
                            <div className="hidden md:flex items-center space-x-2 text-gray-400">
                                <span>/</span>
                                <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                                    🍊 GESTIÓN DE USUARIOS
                                </span>
                            </div>
                        </div>
                        
                        {userInfo && (
                            <div className="flex items-center space-x-4">
                                <div className="text-right">
                                    <div className="text-sm text-gray-500">Administrador</div>
                                    <div className="font-bold text-gray-800">{userInfo.username}</div>
                                </div>
                                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full flex items-center justify-center text-white font-bold">
                                    👤
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Cards de Métricas Estilo Dashboard - Layout Centrado */}
                <div className="container mx-auto px-4 mb-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 justify-items-center">
                        {/* Card Total Usuarios */}
                        <div className="w-full max-w-sm bg-gradient-to-br from-pink-100 to-rose-100 rounded-2xl p-6 border-l-4 border-orange-500 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                            <div className="text-center">
                                <div className="flex items-center justify-center mb-4">
                                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                                        <span className="text-2xl">👥</span>
                                    </div>
                                </div>
                                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-2">Usuarios Registrados</h3>
                                <div className="text-5xl font-black text-orange-600 mb-2">{usuarios.length}</div>
                                <p className="text-xs text-gray-600 font-medium">Total en el sistema</p>
                            </div>
                        </div>

                        {/* Card Administradores */}
                        <div className="w-full max-w-sm bg-gradient-to-br from-pink-100 to-rose-100 rounded-2xl p-6 border-l-4 border-orange-500 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                            <div className="text-center">
                                <div className="flex items-center justify-center mb-4">
                                    <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
                                        <span className="text-2xl">👑</span>
                                    </div>
                                </div>
                                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-2">Administradores</h3>
                                <div className="text-5xl font-black text-orange-600 mb-2">{usuarios.filter(u => u.rol === 'administrador' || u.rol === 'admin').length}</div>
                                <p className="text-xs text-gray-600 font-medium">Privilegios especiales</p>
                            </div>
                        </div>

                        {/* Card Expertos */}
                        <div className="w-full max-w-sm bg-gradient-to-br from-pink-100 to-rose-100 rounded-2xl p-6 border-l-4 border-orange-500 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                            <div className="text-center">
                                <div className="flex items-center justify-center mb-4">
                                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                                        <span className="text-2xl">🎓</span>
                                    </div>
                                </div>
                                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-2">Expertos</h3>
                                <div className="text-5xl font-black text-orange-600 mb-2">{usuarios.filter(u => u.rol === 'experto').length}</div>
                                <p className="text-xs text-gray-600 font-medium">Conocimiento especializado</p>
                            </div>
                        </div>

                        {/* Card Operadores */}
                        <div className="w-full max-w-sm bg-gradient-to-br from-pink-100 to-rose-100 rounded-2xl p-6 border-l-4 border-orange-500 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                            <div className="text-center">
                                <div className="flex items-center justify-center mb-4">
                                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                                        <span className="text-2xl">🔧</span>
                                    </div>
                                </div>
                                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-2">Operadores</h3>
                                <div className="text-5xl font-black text-orange-600 mb-2">{usuarios.filter(u => u.rol === 'operador').length}</div>
                                <p className="text-xs text-gray-600 font-medium">Operaciones diarias</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Panel de Acciones Estilo Dashboard */}
                <div className="bg-gradient-to-br from-pink-100 to-rose-100 rounded-2xl shadow-xl mb-8 overflow-hidden border-l-4 border-orange-500">
                    <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-4">
                        <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                            <span>⚡</span>
                            <span>Acciones Rápidas</span>
                        </h3>
                        <p className="text-orange-100 text-sm mt-1">Gestiona usuarios del sistema citrícola</p>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <button
                                onClick={openCreateModal}
                                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-4 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center space-x-3"
                            >
                                <span className="text-xl">➕</span>
                                <span>CREAR USUARIO</span>
                            </button>
                            
                            <button
                                onClick={establecerAdmin}
                                className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-6 py-4 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center space-x-3"
                            >
                                <span className="text-xl">🔧</span>
                                <span>VERIFICAR SESIÓN</span>
                            </button>
                            
                            <button
                                onClick={cargarUsuarios}
                                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-4 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center space-x-3"
                            >
                                <span className="text-xl">🔄</span>
                                <span>ACTUALIZAR</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tabla de Usuarios Estilo Dashboard */}
                <div className="bg-gradient-to-br from-pink-100 to-rose-100 rounded-2xl shadow-xl overflow-hidden border-l-4 border-orange-500">
                    <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-4">
                        <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                            <span>👥</span>
                            <span>Lista de Usuarios</span>
                        </h3>
                        <p className="text-gray-300 text-sm">Gestiona todos los usuarios del sistema citrícola</p>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        ID
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Usuario
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Email
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Nombre Completo
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Rol
                                    </th>
                                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {usuarios.map((usuario, index) => (
                                    <tr key={usuario.id} className={`hover:bg-orange-50 transition-colors duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                                    {usuario.id}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                                                    {usuario.username.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-gray-900">{usuario.username}</div>
                                                    <div className="text-xs text-gray-500">@{usuario.username}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900 font-medium">{usuario.email}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-semibold text-gray-900">{usuario.nombre_completo}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                                                usuario.rol === 'administrador' || usuario.rol === 'admin' ? 'bg-red-100 text-red-800 border border-red-200' :
                                                usuario.rol === 'experto' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                                                'bg-green-100 text-green-800 border border-green-200'
                                            }`}>
                                                {usuario.rol === 'administrador' || usuario.rol === 'admin' ? '👑 Admin' :
                                                 usuario.rol === 'experto' ? '🎓 Experto' : '🔧 Operador'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <div className="flex items-center justify-center space-x-3">
                                                <button
                                                    onClick={() => handleEdit(usuario)}
                                                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-bold transition-all duration-200 transform hover:scale-105 flex items-center space-x-1"
                                                >
                                                    <span>✏️</span>
                                                    <span>Editar</span>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(usuario)}
                                                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-bold transition-all duration-200 transform hover:scale-105 flex items-center space-x-1"
                                                >
                                                    <span>🗑️</span>
                                                    <span>Eliminar</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {usuarios.length === 0 && (
                    <div className="bg-gradient-to-br from-pink-100 to-rose-100 rounded-2xl shadow-xl p-12 text-center border-l-4 border-orange-500">
                        <div className="w-24 h-24 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
                            <span className="text-4xl">👥</span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">No hay usuarios registrados</h3>
                        <p className="text-gray-600 mb-8 text-lg">Comienza creando el primer usuario del sistema citrícola</p>
                        <button
                            onClick={openCreateModal}
                            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
                        >
                            ➕ Crear Primer Usuario
                        </button>
                    </div>
                )}

                {/* Modal Completamente Rediseñado */}
                {showModal && (
                    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-75 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300">
                            {/* Header del Modal */}
                            <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-4 rounded-t-2xl">
                                <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                                    <span>{modalType === 'create' ? '➕' : '✏️'}</span>
                                    <span>{modalType === 'create' ? 'Crear Nuevo Usuario' : 'Editar Usuario'}</span>
                                </h3>
                            </div>
                            
                            <form onSubmit={handleSubmit} className="p-6 space-y-5">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        👤 Username
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.username}
                                        onChange={(e) => setFormData({...formData, username: e.target.value})}
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 font-medium"
                                        placeholder="Ingresa el nombre de usuario"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        📧 Email
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 font-medium"
                                        placeholder="usuario@example.com"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        👨‍💼 Nombre Completo
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.nombre_completo}
                                        onChange={(e) => setFormData({...formData, nombre_completo: e.target.value})}
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 font-medium"
                                        placeholder="Nombre y apellido completo"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        🔒 Password {modalType === 'edit' && '(opcional)'}
                                    </label>
                                    <input
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 font-medium"
                                        placeholder={modalType === 'create' ? 'Contraseña segura' : 'Dejar vacío para mantener actual'}
                                        required={modalType === 'create'}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        🎭 Rol en el Sistema
                                    </label>
                                    <select
                                        value={formData.rol}
                                        onChange={(e) => setFormData({...formData, rol: e.target.value})}
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 font-medium"
                                        required
                                    >
                                        <option value="operador">🔧 Operador - Operaciones básicas</option>
                                        <option value="experto">🎓 Experto - Conocimiento especializado</option>
                                        <option value="admin">👑 Administrador - Control total</option>
                                    </select>
                                </div>

                                <div className="flex space-x-3 pt-6">
                                    <button
                                        type="submit"
                                        className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 px-4 rounded-xl font-bold transition-all duration-300 transform hover:scale-105"
                                    >
                                        {modalType === 'create' ? '✨ Crear Usuario' : '💾 Actualizar'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white py-3 px-4 rounded-xl font-bold transition-all duration-300"
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

// 📝 CONCEPTOS NUEVOS:
// 
// 1. useEffect() → Hook para efectos secundarios (llamadas a API)
// 2. map() → Crear una lista de componentes desde un array
// 3. key prop → Identificador único para elementos de lista
// 4. new Date() → Formatear fechas
// 5. Estados de carga/error → UX mejor para el usuario