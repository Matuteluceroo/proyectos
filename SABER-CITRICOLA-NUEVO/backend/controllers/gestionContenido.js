// 📚 gestionContenido.js - Controlador para gestión de categorías y documentos
import fs from 'fs';
import path from 'path';

// 📁 GESTIÓN DE CATEGORÍAS

// Obtener todas las categorías
export const obtenerCategorias = async (req, res) => {
    try {
        console.log('📁 Obteniendo todas las categorías...');
        
        // Datos simulados de categorías (en producción sería de la base de datos)
        const categorias = [
            { 
                id: 1, 
                nombre: 'Técnicas de Cultivo', 
                descripcion: 'Métodos y técnicas para el cultivo de cítricos', 
                color: '#10B981', 
                documentos: 5,
                fechaCreacion: '2024-01-01',
                estado: 'activo'
            },
            { 
                id: 2, 
                nombre: 'Control de Plagas', 
                descripcion: 'Estrategias para el control de plagas y enfermedades', 
                color: '#EF4444', 
                documentos: 3,
                fechaCreacion: '2024-01-02',
                estado: 'activo'
            },
            { 
                id: 3, 
                nombre: 'Fertilización', 
                descripcion: 'Técnicas de fertilización y nutrición', 
                color: '#F59E0B', 
                documentos: 4,
                fechaCreacion: '2024-01-03',
                estado: 'activo'
            },
            { 
                id: 4, 
                nombre: 'Poda y Manejo', 
                descripcion: 'Técnicas de poda y manejo de árboles', 
                color: '#8B5CF6', 
                documentos: 2,
                fechaCreacion: '2024-01-04',
                estado: 'activo'
            },
            { 
                id: 5, 
                nombre: 'Riego', 
                descripcion: 'Sistemas y técnicas de riego', 
                color: '#06B6D4', 
                documentos: 0,
                fechaCreacion: '2024-01-05',
                estado: 'activo'
            }
        ];

        console.log(`✅ Se encontraron ${categorias.length} categorías`);
        res.json(categorias);

    } catch (error) {
        console.error('❌ Error al obtener categorías:', error);
        res.status(500).json({ 
            error: 'Error al obtener categorías',
            mensaje: error.message 
        });
    }
};

// Crear nueva categoría
export const crearCategoria = async (req, res) => {
    try {
        const { nombre, descripcion, color } = req.body;
        console.log('➕ Creando nueva categoría:', { nombre, descripcion, color });

        // Validaciones
        if (!nombre || !nombre.trim()) {
            return res.status(400).json({ 
                error: 'El nombre de la categoría es obligatorio' 
            });
        }

        // Simular creación en base de datos
        const nuevaCategoria = {
            id: Date.now(), // En producción sería un ID de la BD
            nombre: nombre.trim(),
            descripcion: descripcion?.trim() || '',
            color: color || '#3B82F6',
            documentos: 0,
            fechaCreacion: new Date().toISOString(),
            estado: 'activo'
        };

        console.log('✅ Categoría creada exitosamente:', nuevaCategoria);
        res.status(201).json(nuevaCategoria);

    } catch (error) {
        console.error('❌ Error al crear categoría:', error);
        res.status(500).json({ 
            error: 'Error al crear categoría',
            mensaje: error.message 
        });
    }
};

// Actualizar categoría
export const actualizarCategoria = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, descripcion, color } = req.body;
        console.log('✏️ Actualizando categoría:', id, { nombre, descripcion, color });

        // Validaciones
        if (!nombre || !nombre.trim()) {
            return res.status(400).json({ 
                error: 'El nombre de la categoría es obligatorio' 
            });
        }

        // Simular actualización en base de datos
        const categoriaActualizada = {
            id: parseInt(id),
            nombre: nombre.trim(),
            descripcion: descripcion?.trim() || '',
            color: color || '#3B82F6',
            documentos: Math.floor(Math.random() * 10), // Simulado
            fechaCreacion: '2024-01-01', // Simulado
            fechaActualizacion: new Date().toISOString(),
            estado: 'activo'
        };

        console.log('✅ Categoría actualizada exitosamente:', categoriaActualizada);
        res.json(categoriaActualizada);

    } catch (error) {
        console.error('❌ Error al actualizar categoría:', error);
        res.status(500).json({ 
            error: 'Error al actualizar categoría',
            mensaje: error.message 
        });
    }
};

// Eliminar categoría
export const eliminarCategoria = async (req, res) => {
    try {
        const { id } = req.params;
        console.log('🗑️ Eliminando categoría:', id);

        // En producción se verificaría si la categoría tiene documentos
        // y se manejaría la eliminación en cascada o se impediría la eliminación

        console.log('✅ Categoría eliminada exitosamente');
        res.json({ 
            success: true, 
            mensaje: 'Categoría eliminada exitosamente' 
        });

    } catch (error) {
        console.error('❌ Error al eliminar categoría:', error);
        res.status(500).json({ 
            error: 'Error al eliminar categoría',
            mensaje: error.message 
        });
    }
};

// 📄 GESTIÓN DE DOCUMENTOS

// Obtener todos los documentos con filtros
export const obtenerDocumentos = async (req, res) => {
    try {
        const { categoria, busqueda, estado } = req.query;
        console.log('📄 Obteniendo documentos con filtros:', { categoria, busqueda, estado });

        // Datos simulados de documentos
        let documentos = [
            { 
                id: 1, 
                titulo: 'Guía de Plantación', 
                categoria: 'Técnicas de Cultivo', 
                fechaSubida: '2024-01-15', 
                fechaActualizacion: '2024-01-20',
                descargas: 245, 
                estado: 'activo',
                autor: 'Dr. Juan Pérez',
                descripcion: 'Guía completa para la plantación de cítricos',
                tamanio: '2.5 MB',
                tipo: 'PDF'
            },
            { 
                id: 2, 
                titulo: 'Control Biológico de Plagas', 
                categoria: 'Control de Plagas', 
                fechaSubida: '2024-01-14', 
                fechaActualizacion: '2024-01-19',
                descargas: 189, 
                estado: 'activo',
                autor: 'Dra. María García',
                descripcion: 'Técnicas de control biológico sostenible',
                tamanio: '3.1 MB',
                tipo: 'PDF'
            },
            { 
                id: 3, 
                titulo: 'Fertilización Orgánica', 
                categoria: 'Fertilización', 
                fechaSubida: '2024-01-13', 
                fechaActualizacion: '2024-01-18',
                descargas: 167, 
                estado: 'activo',
                autor: 'Ing. Carlos López',
                descripcion: 'Manual de fertilización orgánica para cítricos',
                tamanio: '1.8 MB',
                tipo: 'PDF'
            },
            { 
                id: 4, 
                titulo: 'Técnicas de Poda', 
                categoria: 'Poda y Manejo', 
                fechaSubida: '2024-01-12', 
                fechaActualizacion: '2024-01-17',
                descargas: 123, 
                estado: 'borrador',
                autor: 'Prof. Ana Martínez',
                descripcion: 'Técnicas modernas de poda para cítricos',
                tamanio: '4.2 MB',
                tipo: 'PDF'
            },
            { 
                id: 5, 
                titulo: 'Manual de Injertos', 
                categoria: 'Técnicas de Cultivo', 
                fechaSubida: '2024-01-11', 
                fechaActualizacion: '2024-01-16',
                descargas: 98, 
                estado: 'activo',
                autor: 'Dr. Roberto Silva',
                descripcion: 'Guía práctica de injertos en cítricos',
                tamanio: '2.9 MB',
                tipo: 'PDF'
            }
        ];

        // Aplicar filtros
        if (categoria && categoria !== 'todas') {
            documentos = documentos.filter(doc => doc.categoria === categoria);
        }

        if (busqueda) {
            documentos = documentos.filter(doc => 
                doc.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
                doc.descripcion.toLowerCase().includes(busqueda.toLowerCase()) ||
                doc.autor.toLowerCase().includes(busqueda.toLowerCase())
            );
        }

        if (estado) {
            documentos = documentos.filter(doc => doc.estado === estado);
        }

        console.log(`✅ Se encontraron ${documentos.length} documentos`);
        res.json(documentos);

    } catch (error) {
        console.error('❌ Error al obtener documentos:', error);
        res.status(500).json({ 
            error: 'Error al obtener documentos',
            mensaje: error.message 
        });
    }
};

// Obtener documento por ID
export const obtenerDocumentoPorId = async (req, res) => {
    try {
        const { id } = req.params;
        console.log('📄 Obteniendo documento por ID:', id);

        // Simular búsqueda en base de datos
        const documento = {
            id: parseInt(id),
            titulo: 'Documento de Ejemplo',
            categoria: 'Técnicas de Cultivo',
            fechaSubida: '2024-01-15',
            fechaActualizacion: '2024-01-20',
            descargas: 245,
            estado: 'activo',
            autor: 'Dr. Juan Pérez',
            descripcion: 'Descripción detallada del documento',
            tamanio: '2.5 MB',
            tipo: 'PDF',
            contenido: 'Contenido del documento...'
        };

        console.log('✅ Documento encontrado:', documento);
        res.json(documento);

    } catch (error) {
        console.error('❌ Error al obtener documento:', error);
        res.status(500).json({ 
            error: 'Error al obtener documento',
            mensaje: error.message 
        });
    }
};

// Actualizar documento
export const actualizarDocumento = async (req, res) => {
    try {
        const { id } = req.params;
        const { titulo, categoria, descripcion, estado } = req.body;
        console.log('✏️ Actualizando documento:', id, { titulo, categoria, descripcion, estado });

        // Validaciones
        if (!titulo || !titulo.trim()) {
            return res.status(400).json({ 
                error: 'El título del documento es obligatorio' 
            });
        }

        // Simular actualización en base de datos
        const documentoActualizado = {
            id: parseInt(id),
            titulo: titulo.trim(),
            categoria: categoria || 'Sin categoría',
            descripcion: descripcion?.trim() || '',
            estado: estado || 'borrador',
            fechaActualizacion: new Date().toISOString(),
            // Mantener otros campos existentes
            fechaSubida: '2024-01-15',
            descargas: 245,
            autor: 'Dr. Juan Pérez',
            tamanio: '2.5 MB',
            tipo: 'PDF'
        };

        console.log('✅ Documento actualizado exitosamente:', documentoActualizado);
        res.json(documentoActualizado);

    } catch (error) {
        console.error('❌ Error al actualizar documento:', error);
        res.status(500).json({ 
            error: 'Error al actualizar documento',
            mensaje: error.message 
        });
    }
};

// Eliminar documento
export const eliminarDocumento = async (req, res) => {
    try {
        const { id } = req.params;
        console.log('🗑️ Eliminando documento:', id);

        // En producción se eliminaría el archivo físico también
        
        console.log('✅ Documento eliminado exitosamente');
        res.json({ 
            success: true, 
            mensaje: 'Documento eliminado exitosamente' 
        });

    } catch (error) {
        console.error('❌ Error al eliminar documento:', error);
        res.status(500).json({ 
            error: 'Error al eliminar documento',
            mensaje: error.message 
        });
    }
};

// Cambiar estado de documento
export const cambiarEstadoDocumento = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body;
        console.log('🔄 Cambiando estado de documento:', id, 'a', estado);

        // Validar estado
        if (!['activo', 'borrador', 'inactivo'].includes(estado)) {
            return res.status(400).json({ 
                error: 'Estado no válido. Debe ser: activo, borrador o inactivo' 
            });
        }

        // Simular actualización en base de datos
        const documento = {
            id: parseInt(id),
            estado: estado,
            fechaActualizacion: new Date().toISOString()
        };

        console.log('✅ Estado de documento actualizado:', documento);
        res.json(documento);

    } catch (error) {
        console.error('❌ Error al cambiar estado de documento:', error);
        res.status(500).json({ 
            error: 'Error al cambiar estado de documento',
            mensaje: error.message 
        });
    }
};

// 📊 ESTADÍSTICAS

// Obtener estadísticas de contenido
export const obtenerEstadisticasContenido = async (req, res) => {
    try {
        console.log('📊 Generando estadísticas de contenido...');

        // Simular estadísticas (en producción serían consultas reales)
        const estadisticas = {
            totalCategorias: 5,
            totalDocumentos: 14,
            documentosRecientes: 3,
            categoriasVacias: 1,
            documentosActivos: 11,
            documentosBorrador: 3,
            descargasTotales: 1247,
            documentosMasDescargados: [
                { titulo: 'Guía de Plantación', descargas: 245 },
                { titulo: 'Control Biológico de Plagas', descargas: 189 },
                { titulo: 'Fertilización Orgánica', descargas: 167 }
            ],
            categoriasMasUsadas: [
                { nombre: 'Técnicas de Cultivo', documentos: 5 },
                { nombre: 'Fertilización', documentos: 4 },
                { nombre: 'Control de Plagas', documentos: 3 }
            ]
        };

        console.log('✅ Estadísticas generadas:', estadisticas);
        res.json(estadisticas);

    } catch (error) {
        console.error('❌ Error al obtener estadísticas:', error);
        res.status(500).json({ 
            error: 'Error al obtener estadísticas',
            mensaje: error.message 
        });
    }
};

// Obtener documentos recientes
export const obtenerDocumentosRecientes = async (req, res) => {
    try {
        const { limite = 10 } = req.query;
        console.log('📄 Obteniendo documentos recientes, límite:', limite);

        // Simular documentos recientes
        const documentosRecientes = [
            { 
                id: 1, 
                titulo: 'Guía de Plantación', 
                categoria: 'Técnicas de Cultivo', 
                fechaSubida: '2024-01-15',
                autor: 'Dr. Juan Pérez',
                estado: 'activo'
            },
            { 
                id: 2, 
                titulo: 'Control Biológico de Plagas', 
                categoria: 'Control de Plagas', 
                fechaSubida: '2024-01-14',
                autor: 'Dra. María García',
                estado: 'activo'
            },
            { 
                id: 3, 
                titulo: 'Fertilización Orgánica', 
                categoria: 'Fertilización', 
                fechaSubida: '2024-01-13',
                autor: 'Ing. Carlos López',
                estado: 'activo'
            }
        ].slice(0, parseInt(limite));

        console.log(`✅ Se encontraron ${documentosRecientes.length} documentos recientes`);
        res.json(documentosRecientes);

    } catch (error) {
        console.error('❌ Error al obtener documentos recientes:', error);
        res.status(500).json({ 
            error: 'Error al obtener documentos recientes',
            mensaje: error.message 
        });
    }
};