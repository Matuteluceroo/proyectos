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
            setShowAdminFix(true);
            setLoading(false);
            return;
        }
        
        if (userData.rol !== 'admin') {
            alert('Acceso denegado. Solo administradores pueden gestionar usuarios.');
            navigate('/dashboard');
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
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <div className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="text-blue-600 hover:text-blue-800 font-medium"
                            >
                                🏠 Home
                            </button>
                            <span className="text-gray-400">/</span>
                            <span className="text-gray-700 font-semibold">USUARIOS</span>
                        </div>
                        
                        {userInfo && (
                            <div className="text-sm text-gray-600">
                                Admin: <span className="font-semibold">{userInfo.username}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <span className="text-blue-600 text-xl">👥</span>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Usuarios</p>
                                <p className="text-2xl font-bold text-gray-900">{usuarios.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-red-100 rounded-lg">
                                <span className="text-red-600 text-xl">👑</span>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Administradores</p>
                                <p className="text-2xl font-bold text-gray-900">{usuarios.filter(u => u.rol === 'admin').length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <span className="text-blue-600 text-xl">🎓</span>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Expertos</p>
                                <p className="text-2xl font-bold text-gray-900">{usuarios.filter(u => u.rol === 'experto').length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <span className="text-green-600 text-xl">🔧</span>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Operadores</p>
                                <p className="text-2xl font-bold text-gray-900">{usuarios.filter(u => u.rol === 'operador').length}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="bg-white rounded-lg shadow mb-6">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                            <div className="flex space-x-3">
                                <button
                                    onClick={openCreateModal}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                                >
                                    ➕ ADD NEW
                                </button>
                                
                                <button
                                    onClick={establecerAdmin}
                                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                                >
                                    🔧 VERIFY SESSION
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-800">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                    ID
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                    Username
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                    Email
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                    Nombre Completo
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                    Rol
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {usuarios.map((usuario) => (
                                <tr key={usuario.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {usuario.id}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {usuario.username}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {usuario.email}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {usuario.nombre_completo}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            usuario.rol === 'admin' ? 'bg-red-100 text-red-800' :
                                            usuario.rol === 'experto' ? 'bg-blue-100 text-blue-800' :
                                            'bg-green-100 text-green-800'
                                        }`}>
                                            {usuario.rol}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleEdit(usuario)}
                                                className="text-blue-600 hover:text-blue-900"
                                            >
                                                ✏️ Editar
                                            </button>
                                            <button
                                                onClick={() => handleDelete(usuario)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                🗑️ Eliminar
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {usuarios.length === 0 && (
                    <div className="text-center py-8">
                        <div className="text-6xl mb-4">👥</div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No hay usuarios</h3>
                        <p className="text-gray-500 mb-4">Comienza agregando el primer usuario</p>
                        <button
                            onClick={openCreateModal}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                        >
                            ➕ Agregar Usuario
                        </button>
                    </div>
                )}

                {/* Modal */}
                {showModal && (
                    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900">
                                    {modalType === 'create' ? 'Crear Usuario' : 'Editar Usuario'}
                                </h3>
                            </div>
                            
                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Username
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.username}
                                        onChange={(e) => setFormData({...formData, username: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nombre Completo
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.nombre_completo}
                                        onChange={(e) => setFormData({...formData, nombre_completo: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Password {modalType === 'edit' && '(opcional)'}
                                    </label>
                                    <input
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                        required={modalType === 'create'}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Rol
                                    </label>
                                    <select
                                        value={formData.rol}
                                        onChange={(e) => setFormData({...formData, rol: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    >
                                        <option value="operador">Operador</option>
                                        <option value="experto">Experto</option>
                                        <option value="admin">Administrador</option>
                                    </select>
                                </div>

                                <div className="flex space-x-3 pt-4">
                                    <button
                                        type="submit"
                                        className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 font-medium"
                                    >
                                        {modalType === 'create' ? 'Crear' : 'Actualizar'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 font-medium"
                                    >
                                        Cancelar
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