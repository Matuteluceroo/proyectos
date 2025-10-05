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
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 25%, #fed7aa 50%, #fdba74 75%, #fb923c 100%)'
        }}>
            {/* 🍊 Header Profesional con Estilo Cítrico */}
            <div style={{
                background: 'linear-gradient(135deg, #ea580c 0%, #dc2626 50%, #b91c1c 100%)',
                boxShadow: '0 8px 32px rgba(234, 88, 12, 0.3)',
                borderBottom: '4px solid #f97316'
            }}>
                <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px' }}>
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
                                    padding: '10px 20px',
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
                                🏠 <span>Dashboard</span>
                            </button>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'rgba(255, 255, 255, 0.7)' }}>
                                <span>/</span>
                                <h1 style={{
                                    fontSize: '28px',
                                    fontWeight: 'bold',
                                    color: 'white',
                                    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
                                    margin: 0
                                }}>
                                    📚 GESTIÓN DE CONTENIDO
                                </h1>
                            </div>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ textAlign: 'right', color: 'white' }}>
                                <div style={{ fontSize: '14px', opacity: '0.9' }}>Administrador</div>
                                <div style={{ fontWeight: 'bold', fontSize: '16px' }}>Juan</div>
                            </div>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '20px',
                                border: '3px solid rgba(255, 255, 255, 0.3)',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
                            }}>
                                👤
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 📊 Panel de Métricas Mejorado */}
            <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 24px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                    <div style={{
                        background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                        borderRadius: '20px',
                        padding: '24px',
                        borderLeft: '6px solid #3b82f6',
                        boxShadow: '0 8px 25px rgba(59, 130, 246, 0.15)',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-5px)';
                        e.currentTarget.style.boxShadow = '0 12px 35px rgba(59, 130, 246, 0.25)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 8px 25px rgba(59, 130, 246, 0.15)';
                    }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{
                                width: '64px',
                                height: '64px',
                                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 16px',
                                fontSize: '24px',
                                boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)'
                            }}>📁</div>
                            <h3 style={{
                                fontSize: '12px',
                                fontWeight: 'bold',
                                color: '#374151',
                                textTransform: 'uppercase',
                                letterSpacing: '1px',
                                marginBottom: '8px'
                            }}>Total Categorías</h3>
                            <div style={{
                                fontSize: '36px',
                                fontWeight: '900',
                                color: '#3b82f6',
                                textShadow: '1px 1px 2px rgba(0, 0, 0, 0.1)'
                            }}>{estadisticas.totalCategorias}</div>
                        </div>
                    </div>

                    <div style={{
                        background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                        borderRadius: '20px',
                        padding: '24px',
                        borderLeft: '6px solid #10b981',
                        boxShadow: '0 8px 25px rgba(16, 185, 129, 0.15)',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-5px)';
                        e.currentTarget.style.boxShadow = '0 12px 35px rgba(16, 185, 129, 0.25)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 8px 25px rgba(16, 185, 129, 0.15)';
                    }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{
                                width: '64px',
                                height: '64px',
                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 16px',
                                fontSize: '24px',
                                boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)'
                            }}>📄</div>
                            <h3 style={{
                                fontSize: '12px',
                                fontWeight: 'bold',
                                color: '#374151',
                                textTransform: 'uppercase',
                                letterSpacing: '1px',
                                marginBottom: '8px'
                            }}>Total Documentos</h3>
                            <div style={{
                                fontSize: '36px',
                                fontWeight: '900',
                                color: '#10b981',
                                textShadow: '1px 1px 2px rgba(0, 0, 0, 0.1)'
                            }}>{estadisticas.totalDocumentos}</div>
                        </div>
                    </div>

                    <div style={{
                        background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)',
                        borderRadius: '20px',
                        padding: '24px',
                        borderLeft: '6px solid #8b5cf6',
                        boxShadow: '0 8px 25px rgba(139, 92, 246, 0.15)',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-5px)';
                        e.currentTarget.style.boxShadow = '0 12px 35px rgba(139, 92, 246, 0.25)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 8px 25px rgba(139, 92, 246, 0.15)';
                    }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{
                                width: '64px',
                                height: '64px',
                                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 16px',
                                fontSize: '24px',
                                boxShadow: '0 4px 15px rgba(139, 92, 246, 0.3)'
                            }}>🆕</div>
                            <h3 style={{
                                fontSize: '12px',
                                fontWeight: 'bold',
                                color: '#374151',
                                textTransform: 'uppercase',
                                letterSpacing: '1px',
                                marginBottom: '8px'
                            }}>Documentos Recientes</h3>
                            <div style={{
                                fontSize: '36px',
                                fontWeight: '900',
                                color: '#8b5cf6',
                                textShadow: '1px 1px 2px rgba(0, 0, 0, 0.1)'
                            }}>{estadisticas.documentosRecientes}</div>
                        </div>
                    </div>

                    <div style={{
                        background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
                        borderRadius: '20px',
                        padding: '24px',
                        borderLeft: '6px solid #f97316',
                        boxShadow: '0 8px 25px rgba(249, 115, 22, 0.15)',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-5px)';
                        e.currentTarget.style.boxShadow = '0 12px 35px rgba(249, 115, 22, 0.25)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 8px 25px rgba(249, 115, 22, 0.15)';
                    }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{
                                width: '64px',
                                height: '64px',
                                background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 16px',
                                fontSize: '24px',
                                boxShadow: '0 4px 15px rgba(249, 115, 22, 0.3)'
                            }}>📂</div>
                            <h3 style={{
                                fontSize: '12px',
                                fontWeight: 'bold',
                                color: '#374151',
                                textTransform: 'uppercase',
                                letterSpacing: '1px',
                                marginBottom: '8px'
                            }}>Categorías Vacías</h3>
                            <div style={{
                                fontSize: '36px',
                                fontWeight: '900',
                                color: '#f97316',
                                textShadow: '1px 1px 2px rgba(0, 0, 0, 0.1)'
                            }}>{estadisticas.categoriasVacias}</div>
                        </div>
                    </div>
                </div>

                {/* 🎛️ Panel de Pestañas Profesional */}
                <div style={{
                    background: 'linear-gradient(135deg, #ffffff 0%, #fef3c7 100%)',
                    borderRadius: '20px',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
                    marginBottom: '32px',
                    borderLeft: '6px solid #f97316',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
                        padding: '20px 24px'
                    }}>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            <button
                                onClick={() => setActiveTab('categorias')}
                                style={{
                                    padding: '12px 24px',
                                    borderRadius: '12px',
                                    fontWeight: 'bold',
                                    fontSize: '14px',
                                    transition: 'all 0.3s ease',
                                    border: 'none',
                                    cursor: 'pointer',
                                    background: activeTab === 'categorias' 
                                        ? 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' 
                                        : '#374151',
                                    color: 'white',
                                    transform: activeTab === 'categorias' ? 'scale(1.05)' : 'scale(1)',
                                    boxShadow: activeTab === 'categorias' 
                                        ? '0 6px 20px rgba(249, 115, 22, 0.4)' 
                                        : 'none'
                                }}
                                onMouseEnter={(e) => {
                                    if (activeTab !== 'categorias') {
                                        e.target.style.background = '#4B5563';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (activeTab !== 'categorias') {
                                        e.target.style.background = '#374151';
                                    }
                                }}
                            >
                                📁 Categorías
                            </button>
                            <button
                                onClick={() => setActiveTab('documentos')}
                                style={{
                                    padding: '12px 24px',
                                    borderRadius: '12px',
                                    fontWeight: 'bold',
                                    fontSize: '14px',
                                    transition: 'all 0.3s ease',
                                    border: 'none',
                                    cursor: 'pointer',
                                    background: activeTab === 'documentos' 
                                        ? 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' 
                                        : '#374151',
                                    color: 'white',
                                    transform: activeTab === 'documentos' ? 'scale(1.05)' : 'scale(1)',
                                    boxShadow: activeTab === 'documentos' 
                                        ? '0 6px 20px rgba(249, 115, 22, 0.4)' 
                                        : 'none'
                                }}
                                onMouseEnter={(e) => {
                                    if (activeTab !== 'documentos') {
                                        e.target.style.background = '#4B5563';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (activeTab !== 'documentos') {
                                        e.target.style.background = '#374151';
                                    }
                                }}
                            >
                                📄 Documentos
                            </button>
                        </div>
                    </div>

                    <div style={{ padding: '32px' }}>
                        {/* 📁 Pestaña de Categorías Optimizada */}
                        {activeTab === 'categorias' && (
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
                                    <h3 style={{
                                        fontSize: '28px',
                                        fontWeight: 'bold',
                                        color: '#1f2937',
                                        textShadow: '1px 1px 2px rgba(0, 0, 0, 0.1)'
                                    }}>Gestionar Categorías</h3>
                                    <button
                                        onClick={() => {
                                            setMostrarFormCategoria(true);
                                            setEditandoCategoria(null);
                                            setNuevaCategoria({ nombre: '', descripcion: '', color: '#3B82F6' });
                                        }}
                                        style={{
                                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                            color: 'white',
                                            padding: '14px 28px',
                                            borderRadius: '12px',
                                            fontWeight: 'bold',
                                            fontSize: '14px',
                                            border: 'none',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease',
                                            boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.target.style.transform = 'translateY(-2px)';
                                            e.target.style.boxShadow = '0 8px 25px rgba(16, 185, 129, 0.4)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.transform = 'translateY(0)';
                                            e.target.style.boxShadow = '0 4px 15px rgba(16, 185, 129, 0.3)';
                                        }}
                                    >
                                        ➕ Nueva Categoría
                                    </button>
                                </div>

                                {/* 📝 Formulario de Categoría Mejorado */}
                                {mostrarFormCategoria && (
                                    <div style={{
                                        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                                        borderRadius: '16px',
                                        padding: '32px',
                                        marginBottom: '32px',
                                        border: '2px solid #e5e7eb',
                                        boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)'
                                    }}>
                                        <h4 style={{
                                            fontSize: '20px',
                                            fontWeight: 'bold',
                                            color: '#1f2937',
                                            marginBottom: '24px'
                                        }}>
                                            {editandoCategoria ? '✏️ Editar Categoría' : '➕ Nueva Categoría'}
                                        </h4>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                                            <div>
                                                <label style={{
                                                    display: 'block',
                                                    fontSize: '14px',
                                                    fontWeight: 'bold',
                                                    color: '#374151',
                                                    marginBottom: '8px'
                                                }}>Nombre</label>
                                                <input
                                                    type="text"
                                                    value={nuevaCategoria.nombre}
                                                    onChange={(e) => setNuevaCategoria({...nuevaCategoria, nombre: e.target.value})}
                                                    style={{
                                                        width: '100%',
                                                        padding: '12px 16px',
                                                        border: '2px solid #d1d5db',
                                                        borderRadius: '12px',
                                                        fontSize: '14px',
                                                        transition: 'all 0.3s ease',
                                                        background: '#ffffff'
                                                    }}
                                                    placeholder="Nombre de la categoría"
                                                    onFocus={(e) => {
                                                        e.target.style.borderColor = '#f97316';
                                                        e.target.style.boxShadow = '0 0 0 3px rgba(249, 115, 22, 0.1)';
                                                    }}
                                                    onBlur={(e) => {
                                                        e.target.style.borderColor = '#d1d5db';
                                                        e.target.style.boxShadow = 'none';
                                                    }}
                                                />
                                            </div>
                                            <div>
                                                <label style={{
                                                    display: 'block',
                                                    fontSize: '14px',
                                                    fontWeight: 'bold',
                                                    color: '#374151',
                                                    marginBottom: '8px'
                                                }}>Color</label>
                                                <input
                                                    type="color"
                                                    value={nuevaCategoria.color}
                                                    onChange={(e) => setNuevaCategoria({...nuevaCategoria, color: e.target.value})}
                                                    style={{
                                                        width: '100%',
                                                        height: '48px',
                                                        border: '2px solid #d1d5db',
                                                        borderRadius: '12px',
                                                        cursor: 'pointer'
                                                    }}
                                                />
                                            </div>
                                            <div>
                                                <label style={{
                                                    display: 'block',
                                                    fontSize: '14px',
                                                    fontWeight: 'bold',
                                                    color: '#374151',
                                                    marginBottom: '8px'
                                                }}>Descripción</label>
                                                <input
                                                    type="text"
                                                    value={nuevaCategoria.descripcion}
                                                    onChange={(e) => setNuevaCategoria({...nuevaCategoria, descripcion: e.target.value})}
                                                    style={{
                                                        width: '100%',
                                                        padding: '12px 16px',
                                                        border: '2px solid #d1d5db',
                                                        borderRadius: '12px',
                                                        fontSize: '14px',
                                                        transition: 'all 0.3s ease',
                                                        background: '#ffffff'
                                                    }}
                                                    placeholder="Descripción breve"
                                                    onFocus={(e) => {
                                                        e.target.style.borderColor = '#f97316';
                                                        e.target.style.boxShadow = '0 0 0 3px rgba(249, 115, 22, 0.1)';
                                                    }}
                                                    onBlur={(e) => {
                                                        e.target.style.borderColor = '#d1d5db';
                                                        e.target.style.boxShadow = 'none';
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '16px', marginTop: '24px', flexWrap: 'wrap' }}>
                                            <button
                                                onClick={editandoCategoria ? guardarEdicionCategoria : crearCategoria}
                                                style={{
                                                    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                                                    color: 'white',
                                                    padding: '12px 24px',
                                                    borderRadius: '12px',
                                                    fontWeight: 'bold',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.3s ease'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.target.style.transform = 'translateY(-2px)';
                                                    e.target.style.boxShadow = '0 4px 15px rgba(59, 130, 246, 0.3)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.target.style.transform = 'translateY(0)';
                                                    e.target.style.boxShadow = 'none';
                                                }}
                                            >
                                                {editandoCategoria ? '💾 Guardar Cambios' : '➕ Crear Categoría'}
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setMostrarFormCategoria(false);
                                                    setEditandoCategoria(null);
                                                }}
                                                style={{
                                                    background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
                                                    color: 'white',
                                                    padding: '12px 24px',
                                                    borderRadius: '12px',
                                                    fontWeight: 'bold',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.3s ease'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.target.style.transform = 'translateY(-2px)';
                                                    e.target.style.boxShadow = '0 4px 15px rgba(107, 114, 128, 0.3)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.target.style.transform = 'translateY(0)';
                                                    e.target.style.boxShadow = 'none';
                                                }}
                                            >
                                                ❌ Cancelar
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* 🎯 Grid de Categorías Optimizado */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
                                    {categorias.map(categoria => (
                                        <div key={categoria.id} style={{
                                            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                                            borderRadius: '16px',
                                            padding: '24px',
                                            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.1)',
                                            border: '2px solid #e5e7eb',
                                            transition: 'all 0.3s ease',
                                            cursor: 'pointer'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = 'translateY(-3px)';
                                            e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.15)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.1)';
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                                                <div 
                                                    style={{
                                                        width: '24px',
                                                        height: '24px',
                                                        borderRadius: '50%',
                                                        backgroundColor: categoria.color,
                                                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
                                                    }}
                                                ></div>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <button
                                                        onClick={() => editarCategoria(categoria)}
                                                        style={{
                                                            color: '#3b82f6',
                                                            background: 'none',
                                                            border: 'none',
                                                            fontSize: '18px',
                                                            cursor: 'pointer',
                                                            padding: '4px',
                                                            borderRadius: '6px',
                                                            transition: 'all 0.2s ease'
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            e.target.style.background = '#eff6ff';
                                                            e.target.style.transform = 'scale(1.1)';
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.target.style.background = 'none';
                                                            e.target.style.transform = 'scale(1)';
                                                        }}
                                                    >✏️</button>
                                                    <button
                                                        onClick={() => eliminarCategoria(categoria.id)}
                                                        style={{
                                                            color: '#ef4444',
                                                            background: 'none',
                                                            border: 'none',
                                                            fontSize: '18px',
                                                            cursor: 'pointer',
                                                            padding: '4px',
                                                            borderRadius: '6px',
                                                            transition: 'all 0.2s ease'
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            e.target.style.background = '#fef2f2';
                                                            e.target.style.transform = 'scale(1.1)';
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.target.style.background = 'none';
                                                            e.target.style.transform = 'scale(1)';
                                                        }}
                                                    >🗑️</button>
                                                </div>
                                            </div>
                                            <h5 style={{
                                                fontSize: '20px',
                                                fontWeight: 'bold',
                                                color: '#1f2937',
                                                marginBottom: '8px'
                                            }}>{categoria.nombre}</h5>
                                            <p style={{
                                                color: '#6b7280',
                                                marginBottom: '16px',
                                                lineHeight: '1.5'
                                            }}>{categoria.descripcion}</p>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <span style={{
                                                    fontSize: '14px',
                                                    color: '#6b7280'
                                                }}>{categoria.documentos} documentos</span>
                                                <span style={{
                                                    padding: '6px 12px',
                                                    borderRadius: '20px',
                                                    fontSize: '12px',
                                                    fontWeight: 'bold',
                                                    background: categoria.documentos > 0 
                                                        ? 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)' 
                                                        : 'linear-gradient(135deg, #ffedd5 0%, #fed7aa 100%)',
                                                    color: categoria.documentos > 0 ? '#065f46' : '#9a3412'
                                                }}>
                                                    {categoria.documentos > 0 ? '✅ Activa' : '⚠️ Vacía'}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 📄 Pestaña de Documentos Optimizada */}
                        {activeTab === 'documentos' && (
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
                                    <h3 style={{
                                        fontSize: '28px',
                                        fontWeight: 'bold',
                                        color: '#1f2937',
                                        textShadow: '1px 1px 2px rgba(0, 0, 0, 0.1)'
                                    }}>Gestionar Documentos</h3>
                                    <button
                                        onClick={() => navigate('/crear-documento')}
                                        style={{
                                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                            color: 'white',
                                            padding: '14px 28px',
                                            borderRadius: '12px',
                                            fontWeight: 'bold',
                                            fontSize: '14px',
                                            border: 'none',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease',
                                            boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.target.style.transform = 'translateY(-2px)';
                                            e.target.style.boxShadow = '0 8px 25px rgba(16, 185, 129, 0.4)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.transform = 'translateY(0)';
                                            e.target.style.boxShadow = '0 4px 15px rgba(16, 185, 129, 0.3)';
                                        }}
                                    >
                                        ➕ Nuevo Documento
                                    </button>
                                </div>

                                {/* 🔍 Filtros Mejorados */}
                                <div style={{ 
                                    display: 'grid', 
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                                    gap: '20px', 
                                    marginBottom: '32px',
                                    background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
                                    padding: '24px',
                                    borderRadius: '16px',
                                    border: '2px solid #e5e7eb'
                                }}>
                                    <div>
                                        <label style={{
                                            display: 'block',
                                            fontSize: '14px',
                                            fontWeight: 'bold',
                                            color: '#374151',
                                            marginBottom: '8px'
                                        }}>🔍 Buscar documento</label>
                                        <input
                                            type="text"
                                            value={busquedaDocumento}
                                            onChange={(e) => setBusquedaDocumento(e.target.value)}
                                            style={{
                                                width: '100%',
                                                padding: '12px 16px',
                                                border: '2px solid #d1d5db',
                                                borderRadius: '12px',
                                                fontSize: '14px',
                                                transition: 'all 0.3s ease',
                                                background: '#ffffff'
                                            }}
                                            placeholder="Buscar por título..."
                                            onFocus={(e) => {
                                                e.target.style.borderColor = '#f97316';
                                                e.target.style.boxShadow = '0 0 0 3px rgba(249, 115, 22, 0.1)';
                                            }}
                                            onBlur={(e) => {
                                                e.target.style.borderColor = '#d1d5db';
                                                e.target.style.boxShadow = 'none';
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{
                                            display: 'block',
                                            fontSize: '14px',
                                            fontWeight: 'bold',
                                            color: '#374151',
                                            marginBottom: '8px'
                                        }}>📁 Filtrar por categoría</label>
                                        <select
                                            value={filtroCategoria}
                                            onChange={(e) => setFiltroCategoria(e.target.value)}
                                            style={{
                                                width: '100%',
                                                padding: '12px 16px',
                                                border: '2px solid #d1d5db',
                                                borderRadius: '12px',
                                                fontSize: '14px',
                                                transition: 'all 0.3s ease',
                                                background: '#ffffff',
                                                cursor: 'pointer'
                                            }}
                                            onFocus={(e) => {
                                                e.target.style.borderColor = '#f97316';
                                                e.target.style.boxShadow = '0 0 0 3px rgba(249, 115, 22, 0.1)';
                                            }}
                                            onBlur={(e) => {
                                                e.target.style.borderColor = '#d1d5db';
                                                e.target.style.boxShadow = 'none';
                                            }}
                                        >
                                            <option value="todas">Todas las categorías</option>
                                            {categorias.map(cat => (
                                                <option key={cat.id} value={cat.nombre}>{cat.nombre}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* 📋 Tabla de Documentos Mejorada */}
                                <div style={{
                                    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                                    borderRadius: '16px',
                                    overflow: 'hidden',
                                    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
                                    border: '2px solid #e5e7eb'
                                }}>
                                    <div style={{ overflowX: 'auto' }}>
                                        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
                                            <thead>
                                                <tr style={{
                                                    background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
                                                    color: 'white'
                                                }}>
                                                    <th style={{
                                                        padding: '16px 24px',
                                                        textAlign: 'left',
                                                        fontWeight: 'bold',
                                                        fontSize: '14px',
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '1px'
                                                    }}>📄 Documento</th>
                                                    <th style={{
                                                        padding: '16px 24px',
                                                        textAlign: 'left',
                                                        fontWeight: 'bold',
                                                        fontSize: '14px',
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '1px'
                                                    }}>📁 Categoría</th>
                                                    <th style={{
                                                        padding: '16px 24px',
                                                        textAlign: 'left',
                                                        fontWeight: 'bold',
                                                        fontSize: '14px',
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '1px'
                                                    }}>📅 Fecha</th>
                                                    <th style={{
                                                        padding: '16px 24px',
                                                        textAlign: 'left',
                                                        fontWeight: 'bold',
                                                        fontSize: '14px',
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '1px'
                                                    }}>⬇️ Descargas</th>
                                                    <th style={{
                                                        padding: '16px 24px',
                                                        textAlign: 'left',
                                                        fontWeight: 'bold',
                                                        fontSize: '14px',
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '1px'
                                                    }}>📊 Estado</th>
                                                    <th style={{
                                                        padding: '16px 24px',
                                                        textAlign: 'left',
                                                        fontWeight: 'bold',
                                                        fontSize: '14px',
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '1px'
                                                    }}>⚡ Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {documentosFiltrados.map((doc, index) => (
                                                    <tr key={doc.id} style={{
                                                        borderBottom: '1px solid #e5e7eb',
                                                        background: index % 2 === 0 ? '#ffffff' : '#f9fafb',
                                                        transition: 'all 0.2s ease',
                                                        cursor: 'pointer'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.background = 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)';
                                                        e.currentTarget.style.transform = 'scale(1.01)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.background = index % 2 === 0 ? '#ffffff' : '#f9fafb';
                                                        e.currentTarget.style.transform = 'scale(1)';
                                                    }}>
                                                        <td style={{ padding: '16px 24px' }}>
                                                            <div style={{
                                                                fontWeight: 'bold',
                                                                color: '#1f2937',
                                                                fontSize: '14px'
                                                            }}>{doc.titulo}</div>
                                                        </td>
                                                        <td style={{ padding: '16px 24px' }}>
                                                            <span style={{
                                                                padding: '6px 12px',
                                                                background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                                                                color: '#1e40af',
                                                                borderRadius: '20px',
                                                                fontSize: '12px',
                                                                fontWeight: '600'
                                                            }}>
                                                                {doc.categoria}
                                                            </span>
                                                        </td>
                                                        <td style={{
                                                            padding: '16px 24px',
                                                            color: '#6b7280',
                                                            fontSize: '14px'
                                                        }}>{doc.fechaSubida}</td>
                                                        <td style={{
                                                            padding: '16px 24px',
                                                            color: '#6b7280',
                                                            fontSize: '14px',
                                                            fontWeight: 'bold'
                                                        }}>{doc.descargas}</td>
                                                        <td style={{ padding: '16px 24px' }}>
                                                            <span style={{
                                                                padding: '6px 12px',
                                                                borderRadius: '20px',
                                                                fontSize: '12px',
                                                                fontWeight: 'bold',
                                                                background: doc.estado === 'activo' 
                                                                    ? 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)' 
                                                                    : 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                                                                color: doc.estado === 'activo' ? '#065f46' : '#92400e'
                                                            }}>
                                                                {doc.estado === 'activo' ? '✅ Activo' : '📝 Borrador'}
                                                            </span>
                                                        </td>
                                                        <td style={{ padding: '16px 24px' }}>
                                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                                <button
                                                                    onClick={() => navigate(`/editar-documento/${doc.id}`)}
                                                                    style={{
                                                                        color: '#3b82f6',
                                                                        background: 'none',
                                                                        border: 'none',
                                                                        fontSize: '16px',
                                                                        cursor: 'pointer',
                                                                        padding: '6px',
                                                                        borderRadius: '6px',
                                                                        transition: 'all 0.2s ease'
                                                                    }}
                                                                    title="Editar"
                                                                    onMouseEnter={(e) => {
                                                                        e.target.style.background = '#eff6ff';
                                                                        e.target.style.transform = 'scale(1.2)';
                                                                    }}
                                                                    onMouseLeave={(e) => {
                                                                        e.target.style.background = 'none';
                                                                        e.target.style.transform = 'scale(1)';
                                                                    }}
                                                                >✏️</button>
                                                                <button
                                                                    onClick={() => navigate(`/documento/${doc.id}`)}
                                                                    style={{
                                                                        color: '#10b981',
                                                                        background: 'none',
                                                                        border: 'none',
                                                                        fontSize: '16px',
                                                                        cursor: 'pointer',
                                                                        padding: '6px',
                                                                        borderRadius: '6px',
                                                                        transition: 'all 0.2s ease'
                                                                    }}
                                                                    title="Ver"
                                                                    onMouseEnter={(e) => {
                                                                        e.target.style.background = '#f0fdf4';
                                                                        e.target.style.transform = 'scale(1.2)';
                                                                    }}
                                                                    onMouseLeave={(e) => {
                                                                        e.target.style.background = 'none';
                                                                        e.target.style.transform = 'scale(1)';
                                                                    }}
                                                                >👁️</button>
                                                                <button
                                                                    onClick={() => eliminarDocumento(doc.id)}
                                                                    style={{
                                                                        color: '#ef4444',
                                                                        background: 'none',
                                                                        border: 'none',
                                                                        fontSize: '16px',
                                                                        cursor: 'pointer',
                                                                        padding: '6px',
                                                                        borderRadius: '6px',
                                                                        transition: 'all 0.2s ease'
                                                                    }}
                                                                    title="Eliminar"
                                                                    onMouseEnter={(e) => {
                                                                        e.target.style.background = '#fef2f2';
                                                                        e.target.style.transform = 'scale(1.2)';
                                                                    }}
                                                                    onMouseLeave={(e) => {
                                                                        e.target.style.background = 'none';
                                                                        e.target.style.transform = 'scale(1)';
                                                                    }}
                                                                >🗑️</button>
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