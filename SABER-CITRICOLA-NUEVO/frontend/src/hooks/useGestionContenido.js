/**
 * 🪝 useGestionContenido - Hook personalizado para gestión de contenido
 * =====================================================================
 * Encapsula toda la lógica de estado y efectos para la gestión de contenido.
 * Separación limpia entre lógica de negocio y presentación.
 */

import { useState, useEffect } from 'react';
import { 
    obtenerCategorias, 
    crearCategoria as crearCategoriaAPI, 
    actualizarCategoria as actualizarCategoriaAPI, 
    eliminarCategoria as eliminarCategoriaAPI,
    obtenerDocumentos, 
    eliminarDocumento as eliminarDocumentoAPI, 
    obtenerEstadisticasContenido 
} from '../services/gestionContenidoAPI';

export const useGestionContenido = () => {
    // Estados generales
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

    // Cargar datos iniciales
    useEffect(() => {
        cargarDatos();
    }, []);

    // 📚 Cargar todos los datos
    const cargarDatos = async () => {
        setLoading(true);
        try {
            console.log('📚 Cargando datos de gestión de contenido...');
            
            const [categoriasData, documentosData, estadisticasData] = await Promise.all([
                obtenerCategorias(),
                obtenerDocumentos(),
                obtenerEstadisticasContenido()
            ]);
            
            setCategorias(categoriasData);
            setDocumentos(documentosData);
            setEstadisticas(estadisticasData);
            
            console.log('✅ Datos cargados exitosamente');
        } catch (error) {
            console.error('❌ Error al cargar datos:', error);
            
            // Datos simulados en caso de error
            usarDatosDePrueba();
        } finally {
            setLoading(false);
        }
    };

    // 📝 Usar datos de prueba
    const usarDatosDePrueba = () => {
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
    };

    // ➕ Crear nueva categoría
    const crearCategoria = async () => {
        if (!nuevaCategoria.nombre.trim()) {
            alert('El nombre de la categoría es obligatorio');
            return;
        }

        try {
            console.log('➕ Creando nueva categoría...');
            const categoria = await crearCategoriaAPI(nuevaCategoria);
            setCategorias([...categorias, categoria]);
            resetFormCategoria();
            alert('✅ Categoría creada exitosamente');
            cargarDatos();
        } catch (error) {
            console.error('❌ Error al crear categoría:', error);
            alert('❌ Error al crear la categoría');
        }
    };

    // ✏️ Editar categoría
    const editarCategoria = (categoria) => {
        setEditandoCategoria(categoria);
        setNuevaCategoria({
            nombre: categoria.nombre,
            descripcion: categoria.descripcion,
            color: categoria.color
        });
        setMostrarFormCategoria(true);
    };

    // 💾 Guardar edición de categoría
    const guardarEdicionCategoria = async () => {
        try {
            await actualizarCategoriaAPI(editandoCategoria.id, nuevaCategoria);
            setCategorias(categorias.map(cat => 
                cat.id === editandoCategoria.id 
                    ? { ...cat, ...nuevaCategoria }
                    : cat
            ));
            resetFormCategoria();
            alert('✅ Categoría actualizada exitosamente');
        } catch (error) {
            console.error('❌ Error al actualizar categoría:', error);
            alert('❌ Error al actualizar la categoría');
        }
    };

    // 🗑️ Eliminar categoría
    const eliminarCategoria = async (id) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar esta categoría?')) {
            try {
                await eliminarCategoriaAPI(id);
                setCategorias(categorias.filter(cat => cat.id !== id));
                alert('✅ Categoría eliminada exitosamente');
            } catch (error) {
                console.error('❌ Error al eliminar categoría:', error);
                alert('❌ Error al eliminar la categoría');
            }
        }
    };

    // 🗑️ Eliminar documento
    const eliminarDocumento = async (id) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este documento?')) {
            try {
                await eliminarDocumentoAPI(id);
                setDocumentos(documentos.filter(doc => doc.id !== id));
                alert('✅ Documento eliminado exitosamente');
            } catch (error) {
                console.error('❌ Error al eliminar documento:', error);
                alert('❌ Error al eliminar el documento');
            }
        }
    };

    // 🔄 Reset form categoría
    const resetFormCategoria = () => {
        setEditandoCategoria(null);
        setNuevaCategoria({ nombre: '', descripcion: '', color: '#3B82F6' });
        setMostrarFormCategoria(false);
    };

    // 🔍 Documentos filtrados
    const documentosFiltrados = documentos.filter(doc => {
        const coincideCategoria = filtroCategoria === 'todas' || doc.categoria === filtroCategoria;
        const coincideBusqueda = doc.titulo?.toLowerCase().includes(busquedaDocumento.toLowerCase()) ?? false;
        return coincideCategoria && coincideBusqueda;
    });

    return {
        // Estados
        loading,
        activeTab,
        estadisticas,
        categorias,
        nuevaCategoria,
        mostrarFormCategoria,
        editandoCategoria,
        documentos,
        filtroCategoria,
        busquedaDocumento,
        documentosFiltrados,

        // Setters
        setActiveTab,
        setNuevaCategoria,
        setMostrarFormCategoria,
        setFiltroCategoria,
        setBusquedaDocumento,

        // Acciones
        cargarDatos,
        crearCategoria,
        editarCategoria,
        guardarEdicionCategoria,
        eliminarCategoria,
        eliminarDocumento,
        resetFormCategoria
    };
};

