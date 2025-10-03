import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const GestionarContenido = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('documentos');
    const [documentos, setDocumentos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('create');
    const [selectedItem, setSelectedItem] = useState(null);
    const [userInfo, setUserInfo] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('todos');
    const [formData, setFormData] = useState({
        titulo: '',
        descripcion: '',
        categoria_id: '',
        contenido: '',
        archivo: null,
        nivel_acceso: 'operador'
    });

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        setUserInfo(userData);
        
        if (userData.rol !== 'admin' && userData.rol !== 'experto') {
            alert('Acceso denegado. Solo administradores y expertos pueden gestionar contenido.');
            navigate('/dashboard');
            return;
        }
        
        cargarDatos();
    }, [navigate]);

    const cargarDatos = async () => {
        try {
            setLoading(true);
            
            // Cargar documentos
            const docsResponse = await fetch('http://localhost:5000/api/documentos', {
                headers: {
                    'Content-Type': 'application/json',
                    'userRole': userInfo?.rol || ''
                }
            });
            const docsData = await docsResponse.json();
            setDocumentos(docsData.data || []);

            // Cargar categorías
            const catsResponse = await fetch('http://localhost:5000/api/categorias');
            const catsData = await catsResponse.json();
            setCategorias(catsData.data || []);
            
        } catch (error) {
            console.error('Error al cargar datos:', error);
            alert('Error al cargar datos');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const formDataToSend = new FormData();
            Object.keys(formData).forEach(key => {
                if (formData[key] !== null) {
                    formDataToSend.append(key, formData[key]);
                }
            });

            const url = modalType === 'create' 
                ? 'http://localhost:5000/api/documentos'
                : `http://localhost:5000/api/documentos/${selectedItem.id}`;
            
            const method = modalType === 'create' ? 'POST' : 'PUT';

            const response = await fetch(url, {
                method,
                headers: {
                    'userRole': userInfo?.rol || ''
                },
                body: formDataToSend
            });

            if (response.ok) {
                alert(modalType === 'create' ? 'Documento creado correctamente' : 'Documento actualizado correctamente');
                setShowModal(false);
                resetForm();
                cargarDatos();
            } else {
                throw new Error('Error en la operación');
            }
        } catch (error) {
            console.error('Error al guardar:', error);
            alert('Error al guardar el documento');
        }
    };

    const handleDelete = async (item) => {
        if (window.confirm(`¿Estás seguro de eliminar "${item.titulo}"?`)) {
            try {
                const response = await fetch(`http://localhost:5000/api/documentos/${item.id}`, {
                    method: 'DELETE',
                    headers: {
                        'userRole': userInfo?.rol || ''
                    }
                });

                if (response.ok) {
                    alert('Documento eliminado correctamente');
                    cargarDatos();
                } else {
                    throw new Error('Error al eliminar');
                }
            } catch (error) {
                console.error('Error al eliminar:', error);
                alert('Error al eliminar el documento');
            }
        }
    };

    const resetForm = () => {
        setFormData({
            titulo: '',
            descripcion: '',
            categoria_id: '',
            contenido: '',
            archivo: null,
            nivel_acceso: 'operador'
        });
        setSelectedItem(null);
    };

    const openCreateModal = () => {
        resetForm();
        setModalType('create');
        setShowModal(true);
    };

    const openEditModal = (item) => {
        setSelectedItem(item);
        setFormData({
            titulo: item.titulo || '',
            descripcion: item.descripcion || '',
            categoria_id: item.categoria_id || '',
            contenido: item.contenido || '',
            archivo: null,
            nivel_acceso: item.nivel_acceso || 'operador'
        });
        setModalType('edit');
        setShowModal(true);
    };

    // Filtrar documentos
    const filteredDocumentos = documentos.filter(doc => {
        const matchesSearch = doc.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             doc.descripcion?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = selectedFilter === 'todos' || doc.categoria_nombre === selectedFilter;
        return matchesSearch && matchesFilter;
    });

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <div className="text-xl text-gray-800">Cargando contenido...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="text-blue-600 hover:text-blue-800 font-medium"
                            >
                                🏠 Home
                            </button>
                            <span className="text-gray-300">/</span>
                            <span className="text-gray-700 font-semibold">GESTIÓN DE CONTENIDO</span>
                        </div>
                        
                        {userInfo && (
                            <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                                    <span className="text-white text-sm font-bold">📄</span>
                                </div>
                                <span className="text-sm text-gray-600">
                                    {userInfo.rol === 'admin' ? 'Admin' : 'Experto'}: <span className="font-semibold">{userInfo.username}</span>
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Métricas de contenido */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                                        <span className="text-white">📄</span>
                                    </div>
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">Total Documentos</dt>
                                        <dd className="text-lg font-medium text-gray-900">{documentos.length}</dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                                        <span className="text-white">📂</span>
                                    </div>
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">Categorías</dt>
                                        <dd className="text-lg font-medium text-gray-900">{categorias.length}</dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="w-8 h-8 bg-orange-500 rounded-md flex items-center justify-center">
                                        <span className="text-white">📎</span>
                                    </div>
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">Con Archivos</dt>
                                        <dd className="text-lg font-medium text-gray-900">
                                            {documentos.filter(d => d.archivo_nombre).length}
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                                        <span className="text-white">👁️</span>
                                    </div>
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">Públicos</dt>
                                        <dd className="text-lg font-medium text-gray-900">
                                            {documentos.filter(d => d.nivel_acceso === 'operador').length}
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Panel de control */}
                <div className="bg-white shadow rounded-lg mb-6">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                            <div className="flex space-x-3">
                                <button
                                    onClick={openCreateModal}
                                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                                >
                                    ➕ NUEVO DOCUMENTO
                                </button>
                                
                                <button
                                    onClick={() => window.location.reload()}
                                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                                >
                                    🔄 REFRESCAR
                                </button>
                            </div>
                            
                            <div className="flex items-center space-x-4">
                                <select
                                    value={selectedFilter}
                                    onChange={(e) => setSelectedFilter(e.target.value)}
                                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="todos">Todas las categorías</option>
                                    {categorias.map(cat => (
                                        <option key={cat.id} value={cat.nombre}>{cat.nombre}</option>
                                    ))}
                                </select>

                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Buscar documentos..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                                        <span className="text-gray-400">🔍</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabla de documentos */}
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-800">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                    Documento
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                    Categoría
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                    Nivel Acceso
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                    Archivo
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                    Fecha
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredDocumentos.map((doc, index) => (
                                <tr key={doc.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">{doc.titulo}</div>
                                            <div className="text-sm text-gray-500">{doc.descripcion?.substring(0, 60)}...</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                            {doc.categoria_nombre || 'Sin categoría'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                            doc.nivel_acceso === 'admin' ? 'bg-red-100 text-red-800' :
                                            doc.nivel_acceso === 'experto' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-green-100 text-green-800'
                                        }`}>
                                            {doc.nivel_acceso?.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {doc.archivo_nombre ? (
                                            <a 
                                                href={`http://localhost:5000/uploads/${doc.archivo_nombre}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:text-blue-900"
                                            >
                                                📎 {doc.archivo_nombre}
                                            </a>
                                        ) : (
                                            <span className="text-gray-400">Sin archivo</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {doc.fecha_creacion ? 
                                            new Date(doc.fecha_creacion).toLocaleDateString('es-ES') : 
                                            'N/A'
                                        }
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex space-x-2">
                                            <button 
                                                onClick={() => openEditModal(doc)}
                                                className="text-blue-600 hover:text-blue-900"
                                            >
                                                ✏️ Editar
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(doc)}
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

                {filteredDocumentos.length === 0 && (
                    <div className="text-center py-8">
                        <div className="text-6xl mb-4">📄</div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No hay documentos</h3>
                        <p className="text-gray-500 mb-4">Comienza agregando el primer documento</p>
                        <button
                            onClick={openCreateModal}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                        >
                            ➕ Agregar Documento
                        </button>
                    </div>
                )}

                {/* Modal */}
                {showModal && (
                    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900">
                                    {modalType === 'create' ? 'Crear Documento' : 'Editar Documento'}
                                </h3>
                            </div>
                            
                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Título
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.titulo}
                                            onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Categoría
                                        </label>
                                        <select
                                            value={formData.categoria_id}
                                            onChange={(e) => setFormData({...formData, categoria_id: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        >
                                            <option value="">Seleccionar categoría</option>
                                            {categorias.map(cat => (
                                                <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Descripción
                                    </label>
                                    <textarea
                                        value={formData.descripcion}
                                        onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Contenido
                                    </label>
                                    <textarea
                                        value={formData.contenido}
                                        onChange={(e) => setFormData({...formData, contenido: e.target.value})}
                                        rows={5}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Archivo (opcional)
                                        </label>
                                        <input
                                            type="file"
                                            onChange={(e) => setFormData({...formData, archivo: e.target.files[0]})}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Nivel de Acceso
                                        </label>
                                        <select
                                            value={formData.nivel_acceso}
                                            onChange={(e) => setFormData({...formData, nivel_acceso: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        >
                                            <option value="operador">Operador</option>
                                            <option value="experto">Experto</option>
                                            <option value="admin">Administrador</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex space-x-3 pt-4">
                                    <button
                                        type="submit"
                                        className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 font-medium"
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

export default GestionarContenido;
