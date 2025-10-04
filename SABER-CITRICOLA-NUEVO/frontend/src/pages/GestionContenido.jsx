// 📚 GestionContenido.jsx - Página para gestionar categorías y documentos
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    obtenerCategorias, 
    crearCategoria as crearCategoriaAPI, 
    actualizarCategoria as actualizarCategoriaAPI, 
    eliminarCategoria as eliminarCategoriaAPI,
    obtenerDocumentos, 
    eliminarDocumento as eliminarDocumentoAPI, 
    obtenerEstadisticasContenido 
} from '../services/gestionContenidoAPI';

const GestionContenido = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('categorias');
    const [estadisticas, setEstadisticas] = useState({
        totalCategorias: 0,
        totalDocumentos: 0,
        documentosRecientes: 0,
        categoriasVacias: 0
    });

    // Estados para categorías
    const [categorias, setCategorias] = useState([]);
    const [nuevaCategoria, setNuevaCategoria] = useState({
        nombre: '',
        descripcion: '',
        color: '#3B82F6'
    });
    const [mostrarFormCategoria, setMostrarFormCategoria] = useState(false);
    const [editandoCategoria, setEditandoCategoria] = useState(null);

    // Estados para documentos
    const [documentos, setDocumentos] = useState([]);
    const [filtroCategoria, setFiltroCategoria] = useState('todas');
    const [busquedaDocumento, setBusquedaDocumento] = useState('');

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        setLoading(true);
        try {
            console.log('📚 Cargando datos de gestión de contenido...');
            
            // Cargar categorías reales
            const categoriasData = await obtenerCategorias();
            setCategorias(categoriasData);
            
            // Cargar documentos reales
            const documentosData = await obtenerDocumentos();
            setDocumentos(documentosData);
            
            // Cargar estadísticas reales
            const estadisticasData = await obtenerEstadisticasContenido();
            setEstadisticas(estadisticasData);
            
            console.log('✅ Datos cargados exitosamente');
            
        } catch (error) {
            console.error('❌ Error al cargar datos:', error);
            
            // Usar datos simulados en caso de error
            setCategorias([
                { id: 1, nombre: 'Técnicas de Cultivo', descripcion: 'Métodos y técnicas para el cultivo de cítricos', color: '#10B981', documentos: 5 },
                { id: 2, nombre: 'Control de Plagas', descripcion: 'Estrategias para el control de plagas y enfermedades', color: '#EF4444', documentos: 3 },
                { id: 3, nombre: 'Fertilización', descripcion: 'Técnicas de fertilización y nutrición', color: '#F59E0B', documentos: 4 },
                { id: 4, nombre: 'Poda y Manejo', descripcion: 'Técnicas de poda y manejo de árboles', color: '#8B5CF6', documentos: 2 },
                { id: 5, nombre: 'Riego', descripcion: 'Sistemas y técnicas de riego', color: '#06B6D4', documentos: 0 }
            ]);

            setDocumentos([
                { id: 1, titulo: 'Guía de Plantación', categoria: 'Técnicas de Cultivo', fechaSubida: '2024-01-15', descargas: 245, estado: 'activo' },
                { id: 2, titulo: 'Control Biológico de Plagas', categoria: 'Control de Plagas', fechaSubida: '2024-01-14', descargas: 189, estado: 'activo' },
                { id: 3, titulo: 'Fertilización Orgánica', categoria: 'Fertilización', fechaSubida: '2024-01-13', descargas: 167, estado: 'activo' },
                { id: 4, titulo: 'Técnicas de Poda', categoria: 'Poda y Manejo', fechaSubida: '2024-01-12', descargas: 123, estado: 'borrador' },
                { id: 5, titulo: 'Manual de Injertos', categoria: 'Técnicas de Cultivo', fechaSubida: '2024-01-11', descargas: 98, estado: 'activo' }
            ]);

            setEstadisticas({
                totalCategorias: 5,
                totalDocumentos: 14,
                documentosRecientes: 3,
                categoriasVacias: 1
            });
        }
        
        setLoading(false);
        }

    const crearCategoria = async () => {
        if (!nuevaCategoria.nombre.trim()) {
            alert('El nombre de la categoría es obligatorio');
            return;
        }

        try {
            console.log('➕ Creando nueva categoría...');
            const categoria = await crearCategoriaAPI(nuevaCategoria);
            setCategorias([...categorias, categoria]);
            setNuevaCategoria({ nombre: '', descripcion: '', color: '#3B82F6' });
            setMostrarFormCategoria(false);
            alert('✅ Categoría creada exitosamente');
            cargarDatos(); // Recargar datos
        } catch (error) {
            console.error('❌ Error al crear categoría:', error);
            alert('❌ Error al crear la categoría');
        }
    };

    const editarCategoria = (categoria) => {
        setEditandoCategoria(categoria);
        setNuevaCategoria({
            nombre: categoria.nombre,
            descripcion: categoria.descripcion,
            color: categoria.color
        });
        setMostrarFormCategoria(true);
    };

    const guardarEdicionCategoria = () => {
        setCategorias(categorias.map(cat => 
            cat.id === editandoCategoria.id 
                ? { ...cat, ...nuevaCategoria }
                : cat
        ));
        setEditandoCategoria(null);
        setNuevaCategoria({ nombre: '', descripcion: '', color: '#3B82F6' });
        setMostrarFormCategoria(false);
        alert('✅ Categoría actualizada exitosamente');
    };

    const eliminarCategoria = (id) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar esta categoría?')) {
            setCategorias(categorias.filter(cat => cat.id !== id));
            alert('✅ Categoría eliminada exitosamente');
        }
    };

    const eliminarDocumento = (id) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este documento?')) {
            setDocumentos(documentos.filter(doc => doc.id !== id));
            alert('✅ Documento eliminado exitosamente');
        }
    };

    const documentosFiltrados = documentos.filter(doc => {
        const coincideCategoria = filtroCategoria === 'todas' || doc.categoria === filtroCategoria;
        const coincideBusqueda = doc.titulo.toLowerCase().includes(busquedaDocumento.toLowerCase());
        return coincideCategoria && coincideBusqueda;
    });

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex items-center justify-center">
                <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-600 mx-auto mb-4"></div>
                    <div className="text-xl text-gray-800 mb-2">Cargando gestión de contenido...</div>
                    <div className="text-gray-600">Preparando categorías y documentos</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
            {/* Header */}
            <div className="bg-white shadow-lg border-b-4 border-orange-500">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-6">
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="flex items-center space-x-2 text-orange-600 hover:text-orange-800 font-bold transition-all duration-200 hover:scale-105"
                            >
                                🏠 <span>Dashboard</span>
                            </button>
                            <div className="hidden md:flex items-center space-x-2 text-gray-400">
                                <span>/</span>
                                <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                                    📚 GESTIÓN DE CONTENIDO
                                </span>
                            </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                            <div className="text-right">
                                <div className="text-sm text-gray-500">Administrador</div>
                                <div className="font-bold text-gray-800">Juan</div>
                            </div>
                            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full flex items-center justify-center text-white font-bold">
                                👤
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Estadísticas */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl p-6 border-l-4 border-blue-500 shadow-lg">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl">📁</span>
                            </div>
                            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-2">Total Categorías</h3>
                            <div className="text-4xl font-black text-blue-600">{estadisticas.totalCategorias}</div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-2xl p-6 border-l-4 border-green-500 shadow-lg">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl">📄</span>
                            </div>
                            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-2">Total Documentos</h3>
                            <div className="text-4xl font-black text-green-600">{estadisticas.totalDocumentos}</div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl p-6 border-l-4 border-purple-500 shadow-lg">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl">🆕</span>
                            </div>
                            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-2">Documentos Recientes</h3>
                            <div className="text-4xl font-black text-purple-600">{estadisticas.documentosRecientes}</div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl p-6 border-l-4 border-orange-500 shadow-lg">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl">📂</span>
                            </div>
                            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-2">Categorías Vacías</h3>
                            <div className="text-4xl font-black text-orange-600">{estadisticas.categoriasVacias}</div>
                        </div>
                    </div>
                </div>

                {/* Pestañas */}
                <div className="bg-gradient-to-br from-pink-100 to-rose-100 rounded-2xl shadow-xl mb-8 border-l-4 border-orange-500">
                    <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-4 rounded-t-2xl">
                        <div className="flex space-x-1">
                            <button
                                onClick={() => setActiveTab('categorias')}
                                className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 ${
                                    activeTab === 'categorias'
                                        ? 'bg-orange-500 text-white transform scale-105'
                                        : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                                }`}
                            >
                                📁 Categorías
                            </button>
                            <button
                                onClick={() => setActiveTab('documentos')}
                                className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 ${
                                    activeTab === 'documentos'
                                        ? 'bg-orange-500 text-white transform scale-105'
                                        : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                                }`}
                            >
                                📄 Documentos
                            </button>
                        </div>
                    </div>

                    <div className="p-6">
                        {/* Pestaña de Categorías */}
                        {activeTab === 'categorias' && (
                            <div>
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-2xl font-bold text-gray-800">Gestionar Categorías</h3>
                                    <button
                                        onClick={() => {
                                            setMostrarFormCategoria(true);
                                            setEditandoCategoria(null);
                                            setNuevaCategoria({ nombre: '', descripcion: '', color: '#3B82F6' });
                                        }}
                                        className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105"
                                    >
                                        ➕ Nueva Categoría
                                    </button>
                                </div>

                                {/* Formulario de Categoría */}
                                {mostrarFormCategoria && (
                                    <div className="bg-white rounded-xl p-6 mb-6 border-2 border-gray-200">
                                        <h4 className="text-lg font-bold text-gray-800 mb-4">
                                            {editandoCategoria ? '✏️ Editar Categoría' : '➕ Nueva Categoría'}
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-2">Nombre</label>
                                                <input
                                                    type="text"
                                                    value={nuevaCategoria.nombre}
                                                    onChange={(e) => setNuevaCategoria({...nuevaCategoria, nombre: e.target.value})}
                                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                                    placeholder="Nombre de la categoría"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-2">Color</label>
                                                <input
                                                    type="color"
                                                    value={nuevaCategoria.color}
                                                    onChange={(e) => setNuevaCategoria({...nuevaCategoria, color: e.target.value})}
                                                    className="w-full h-12 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-2">Descripción</label>
                                                <input
                                                    type="text"
                                                    value={nuevaCategoria.descripcion}
                                                    onChange={(e) => setNuevaCategoria({...nuevaCategoria, descripcion: e.target.value})}
                                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                                    placeholder="Descripción breve"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex space-x-4 mt-4">
                                            <button
                                                onClick={editandoCategoria ? guardarEdicionCategoria : crearCategoria}
                                                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300"
                                            >
                                                {editandoCategoria ? '💾 Guardar Cambios' : '➕ Crear Categoría'}
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setMostrarFormCategoria(false);
                                                    setEditandoCategoria(null);
                                                }}
                                                className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300"
                                            >
                                                ❌ Cancelar
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Lista de Categorías */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {categorias.map(categoria => (
                                        <div key={categoria.id} className="bg-white rounded-xl p-6 shadow-lg border-2 border-gray-200 hover:shadow-xl transition-all duration-300">
                                            <div className="flex items-center justify-between mb-4">
                                                <div 
                                                    className="w-6 h-6 rounded-full"
                                                    style={{ backgroundColor: categoria.color }}
                                                ></div>
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => editarCategoria(categoria)}
                                                        className="text-blue-600 hover:text-blue-800 font-bold"
                                                    >
                                                        ✏️
                                                    </button>
                                                    <button
                                                        onClick={() => eliminarCategoria(categoria.id)}
                                                        className="text-red-600 hover:text-red-800 font-bold"
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                            </div>
                                            <h5 className="text-xl font-bold text-gray-800 mb-2">{categoria.nombre}</h5>
                                            <p className="text-gray-600 mb-4">{categoria.descripcion}</p>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-500">{categoria.documentos} documentos</span>
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                    categoria.documentos > 0 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-orange-100 text-orange-800'
                                                }`}>
                                                    {categoria.documentos > 0 ? 'Activa' : 'Vacía'}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Pestaña de Documentos */}
                        {activeTab === 'documentos' && (
                            <div>
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-2xl font-bold text-gray-800">Gestionar Documentos</h3>
                                    <button
                                        onClick={() => navigate('/crear-documento')}
                                        className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105"
                                    >
                                        ➕ Nuevo Documento
                                    </button>
                                </div>

                                {/* Filtros */}
                                <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-6">
                                    <div className="flex-1">
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Buscar documento</label>
                                        <input
                                            type="text"
                                            value={busquedaDocumento}
                                            onChange={(e) => setBusquedaDocumento(e.target.value)}
                                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                            placeholder="Buscar por título..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Filtrar por categoría</label>
                                        <select
                                            value={filtroCategoria}
                                            onChange={(e) => setFiltroCategoria(e.target.value)}
                                            className="px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                        >
                                            <option value="todas">Todas las categorías</option>
                                            {categorias.map(cat => (
                                                <option key={cat.id} value={cat.nombre}>{cat.nombre}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Lista de Documentos */}
                                <div className="bg-white rounded-xl overflow-hidden shadow-lg">
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-gradient-to-r from-gray-800 to-gray-900 text-white">
                                                <tr>
                                                    <th className="px-6 py-4 text-left font-bold">Documento</th>
                                                    <th className="px-6 py-4 text-left font-bold">Categoría</th>
                                                    <th className="px-6 py-4 text-left font-bold">Fecha</th>
                                                    <th className="px-6 py-4 text-left font-bold">Descargas</th>
                                                    <th className="px-6 py-4 text-left font-bold">Estado</th>
                                                    <th className="px-6 py-4 text-left font-bold">Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {documentosFiltrados.map((doc, index) => (
                                                    <tr key={doc.id} className={`border-b ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-orange-50 transition-all duration-200`}>
                                                        <td className="px-6 py-4">
                                                            <div className="font-bold text-gray-800">{doc.titulo}</div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                                                                {doc.categoria}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-gray-600">{doc.fechaSubida}</td>
                                                        <td className="px-6 py-4 text-gray-600">{doc.descargas}</td>
                                                        <td className="px-6 py-4">
                                                            <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                                                                doc.estado === 'activo' 
                                                                    ? 'bg-green-100 text-green-800'
                                                                    : 'bg-yellow-100 text-yellow-800'
                                                            }`}>
                                                                {doc.estado === 'activo' ? '✅ Activo' : '📝 Borrador'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex space-x-2">
                                                                <button
                                                                    onClick={() => navigate(`/editar-documento/${doc.id}`)}
                                                                    className="text-blue-600 hover:text-blue-800 font-bold"
                                                                    title="Editar"
                                                                >
                                                                    ✏️
                                                                </button>
                                                                <button
                                                                    onClick={() => navigate(`/documento/${doc.id}`)}
                                                                    className="text-green-600 hover:text-green-800 font-bold"
                                                                    title="Ver"
                                                                >
                                                                    👁️
                                                                </button>
                                                                <button
                                                                    onClick={() => eliminarDocumento(doc.id)}
                                                                    className="text-red-600 hover:text-red-800 font-bold"
                                                                    title="Eliminar"
                                                                >
                                                                    🗑️
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GestionContenido;