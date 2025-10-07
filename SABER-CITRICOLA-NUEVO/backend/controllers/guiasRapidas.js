// ⚡ guiasRapidas.js - Controlador para guías rápidas
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Datos de ejemplo para guías rápidas
const guiasRapidasData = [
    {
        id: 1,
        titulo: 'Identificación Rápida de Plagas',
        descripcion: 'Guía visual para identificar las plagas más comunes en cítricos',
        categoria: 'plagas',
        icono: '🐛',
        prioridad: 'alta',
        tiempoLectura: 3,
        vistas: 245,
        fechaCreacion: '2024-01-15',
        fechaActualizacion: '2024-01-20',
        contenido: [
            {
                titulo: 'Signos Visuales Principales',
                texto: 'Los primeros signos de infestación incluyen hojas amarillentas, manchas oscuras o deformaciones en las hojas. También busca presencia de insectos o sus larvas.'
            },
            {
                titulo: 'Áreas Críticas a Revisar',
                texto: 'Concentra tu inspección en las siguientes áreas del árbol:',
                lista: [
                    'Envés de las hojas (parte inferior)',
                    'Brotes nuevos y hojas jóvenes',
                    'Uniones entre ramas y tronco',
                    'Base del tronco y raíces superficiales'
                ]
            },
            {
                titulo: 'Acciones Inmediatas',
                texto: 'Una vez detectada la plaga, ejecuta estas acciones prioritarias:',
                lista: [
                    'Fotografiar las áreas afectadas para documentación',
                    'Medir la extensión del daño (porcentaje de hojas afectadas)',
                    'Verificar plantas cercanas para detectar propagación',
                    'Aislar la planta si es posible para evitar contagio'
                ]
            }
        ],
        notasImportantes: [
            'Actúa rápidamente para prevenir propagación a otras plantas',
            'Consulta con experto si no estás seguro del tipo de plaga',
            'Documenta siempre con fotos para seguimiento posterior'
        ],
        recursosRelacionados: [
            'Manual de Tratamiento de Plagas',
            'Contactos de Especialistas en Sanidad Vegetal',
            'Procedimiento de Aplicación de Pesticidas'
        ]
    },
    {
        id: 2,
        titulo: 'Calibración de pH del Suelo',
        descripcion: 'Pasos rápidos para medir y ajustar el pH del suelo de manera precisa',
        categoria: 'cultivo',
        icono: '🌱',
        prioridad: 'media',
        tiempoLectura: 5,
        vistas: 189,
        fechaCreacion: '2024-01-10',
        fechaActualizacion: '2024-01-18',
        contenido: [
            {
                titulo: 'Herramientas Necesarias',
                texto: 'Para una medición precisa del pH necesitarás:',
                lista: [
                    'Medidor de pH digital calibrado',
                    'Agua destilada para limpieza',
                    'Recipientes para muestras de suelo',
                    'Pala pequeña para toma de muestras'
                ]
            },
            {
                titulo: 'Proceso de Medición',
                texto: 'Sigue estos pasos para obtener mediciones confiables:',
                lista: [
                    'Toma muestras a 15cm de profundidad en 5-7 puntos diferentes',
                    'Limpia el medidor con agua destilada entre mediciones',
                    'Inserta el medidor en suelo ligeramente húmedo',
                    'Espera 60 segundos para lectura estable',
                    'Registra todas las mediciones para calcular promedio'
                ]
            },
            {
                titulo: 'Interpretación de Resultados',
                texto: 'Los cítricos prefieren pH entre 6.0 y 7.5. Si el pH está fuera de este rango, considera ajustes con cal (para subir pH) o azufre (para bajar pH).'
            }
        ],
        notasImportantes: [
            'Mide el pH cuando el suelo esté ligeramente húmedo, no empapado',
            'Toma múltiples muestras para obtener un promedio representativo'
        ]
    },
    {
        id: 3,
        titulo: 'Dosificación de Riego por Goteo',
        descripcion: 'Cálculo rápido de cantidad de agua necesaria según tipo de suelo y clima',
        categoria: 'riego',
        icono: '💧',
        prioridad: 'alta',
        tiempoLectura: 4,
        vistas: 312,
        fechaCreacion: '2024-01-08',
        fechaActualizacion: '2024-01-22',
        contenido: [
            {
                titulo: 'Factores a Considerar',
                texto: 'La dosificación depende de varios factores:',
                lista: [
                    'Tipo de suelo (arcilloso, franco, arenoso)',
                    'Edad y tamaño del árbol',
                    'Época del año y temperatura',
                    'Precipitaciones recientes'
                ]
            },
            {
                titulo: 'Cálculo Básico',
                texto: 'Para árboles adultos: 40-60 litros por árbol por día en verano, 20-30 litros en invierno. Ajusta según el tamaño del árbol y condiciones climáticas.'
            }
        ]
    },
    {
        id: 4,
        titulo: 'Reconocimiento de Deficiencias Nutricionales',
        descripcion: 'Identificación visual de carencias de nutrientes en hojas y frutos',
        categoria: 'fertilizacion',
        icono: '🌿',
        prioridad: 'media',
        tiempoLectura: 6,
        vistas: 156,
        fechaCreacion: '2024-01-12',
        contenido: [
            {
                titulo: 'Deficiencia de Nitrógeno',
                texto: 'Hojas amarillas comenzando por las más viejas, crecimiento lento, frutos pequeños.'
            },
            {
                titulo: 'Deficiencia de Hierro',
                texto: 'Clorosis en hojas jóvenes, nervaduras verdes con tejido amarillo entre ellas.'
            }
        ]
    }
];

const categoriasData = [
    { id: 'cultivo', nombre: 'Cultivo', descripcion: 'Técnicas de cultivo y manejo agronómico' },
    { id: 'plagas', nombre: 'Plagas', descripcion: 'Control y manejo integrado de plagas' },
    { id: 'riego', nombre: 'Riego', descripcion: 'Sistemas y técnicas de riego' },
    { id: 'fertilizacion', nombre: 'Fertilización', descripcion: 'Nutrición y fertilización de plantas' },
    { id: 'cosecha', nombre: 'Cosecha', descripcion: 'Técnicas y timing de cosecha' },
    { id: 'poda', nombre: 'Poda', descripcion: 'Técnicas de poda y formación' },
    { id: 'postcosecha', nombre: 'Postcosecha', descripcion: 'Manejo posterior a la cosecha' }
];

// ⚡ Obtener todas las guías rápidas
export const obtenerGuiasRapidas = async (req, res) => {
    try {
        console.log('⚡ Obteniendo guías rápidas...');
        
        // Simular incremento de vistas
        const guiasConVistas = guiasRapidasData.map(guia => ({
            ...guia,
            vistas: guia.vistas + Math.floor(Math.random() * 5)
        }));
        
        res.json({
            success: true,
            mensaje: 'Guías rápidas obtenidas exitosamente',
            guias: guiasConVistas,
            total: guiasConVistas.length
        });
        
    } catch (error) {
        console.error('❌ Error al obtener guías rápidas:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener guías rápidas',
            mensaje: error.message
        });
    }
};

// 🔍 Buscar guías rápidas
export const buscarGuiasRapidas = async (req, res) => {
    try {
        const { busqueda, categoria } = req.query;
        console.log('🔍 Buscando guías rápidas:', { busqueda, categoria });
        
        let guiasFiltradas = [...guiasRapidasData];
        
        // Filtrar por búsqueda de texto
        if (busqueda && busqueda.trim()) {
            const termino = busqueda.toLowerCase().trim();
            guiasFiltradas = guiasFiltradas.filter(guia =>
                guia.titulo.toLowerCase().includes(termino) ||
                guia.descripcion.toLowerCase().includes(termino) ||
                guia.contenido?.some(seccion => 
                    seccion.titulo.toLowerCase().includes(termino) ||
                    seccion.texto.toLowerCase().includes(termino)
                )
            );
        }
        
        // Filtrar por categoría
        if (categoria && categoria.trim()) {
            guiasFiltradas = guiasFiltradas.filter(guia => 
                guia.categoria === categoria.trim()
            );
        }
        
        res.json({
            success: true,
            mensaje: 'Búsqueda completada',
            guias: guiasFiltradas,
            total: guiasFiltradas.length,
            filtros: { busqueda, categoria }
        });
        
    } catch (error) {
        console.error('❌ Error en búsqueda de guías:', error);
        res.status(500).json({
            success: false,
            error: 'Error en la búsqueda',
            mensaje: error.message
        });
    }
};

// 📂 Obtener categorías de guías
export const obtenerCategoriasGuias = async (req, res) => {
    try {
        console.log('📂 Obteniendo categorías de guías...');
        
        // Agregar conteo de guías por categoría
        const categoriasConConteo = categoriasData.map(categoria => {
            const conteoGuias = guiasRapidasData.filter(guia => guia.categoria === categoria.id).length;
            return {
                ...categoria,
                totalGuias: conteoGuias
            };
        });
        
        res.json({
            success: true,
            mensaje: 'Categorías obtenidas exitosamente',
            categorias: categoriasConConteo
        });
        
    } catch (error) {
        console.error('❌ Error al obtener categorías:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener categorías',
            mensaje: error.message
        });
    }
};

// 👁️ Marcar guía como consultada
export const marcarGuiaComoConsultada = async (req, res) => {
    try {
        const { id } = req.params;
        const usuario = req.headers['x-user-name'] || 'Usuario anónimo';
        
        console.log(`👁️ Marcando guía ${id} como consultada por ${usuario}`);
        
        // Encontrar la guía
        const guiaIndex = guiasRapidasData.findIndex(guia => guia.id == id);
        
        if (guiaIndex === -1) {
            return res.status(404).json({
                success: false,
                error: 'Guía no encontrada'
            });
        }
        
        // Incrementar vistas
        guiasRapidasData[guiaIndex].vistas += 1;
        
        res.json({
            success: true,
            mensaje: 'Guía marcada como consultada',
            nuevasVistas: guiasRapidasData[guiaIndex].vistas
        });
        
    } catch (error) {
        console.error('❌ Error al marcar guía como consultada:', error);
        res.status(500).json({
            success: false,
            error: 'Error al marcar guía como consultada',
            mensaje: error.message
        });
    }
};

// ⭐ Marcar guía como favorita
export const marcarGuiaComoFavorita = async (req, res) => {
    try {
        const { id } = req.params;
        const usuario = req.headers['x-user-name'] || 'Usuario anónimo';
        
        console.log(`⭐ Marcando guía ${id} como favorita para ${usuario}`);
        
        // En una implementación real, esto se guardaría en base de datos
        // Por ahora solo confirmamos la acción
        
        res.json({
            success: true,
            mensaje: 'Guía marcada como favorita',
            usuario: usuario
        });
        
    } catch (error) {
        console.error('❌ Error al marcar guía como favorita:', error);
        res.status(500).json({
            success: false,
            error: 'Error al marcar guía como favorita',
            mensaje: error.message
        });
    }
};

// 📊 Obtener estadísticas de guías
export const obtenerEstadisticasGuias = async (req, res) => {
    try {
        console.log('📊 Obteniendo estadísticas de guías...');
        
        // Calcular estadísticas
        const totalGuias = guiasRapidasData.length;
        const totalVistas = guiasRapidasData.reduce((sum, guia) => sum + guia.vistas, 0);
        
        // Guías más consultadas
        const masConsultadas = guiasRapidasData
            .sort((a, b) => b.vistas - a.vistas)
            .slice(0, 5)
            .map(guia => ({
                titulo: guia.titulo,
                vistas: guia.vistas,
                categoria: guia.categoria
            }));
        
        // Categoría más popular
        const vistasPorCategoria = {};
        guiasRapidasData.forEach(guia => {
            vistasPorCategoria[guia.categoria] = (vistasPorCategoria[guia.categoria] || 0) + guia.vistas;
        });
        
        const categoriaPopular = Object.keys(vistasPorCategoria).reduce((a, b) => 
            vistasPorCategoria[a] > vistasPorCategoria[b] ? a : b
        );
        
        const estadisticas = {
            totalGuias,
            totalVistas,
            masConsultadas,
            categoriaPopular,
            vistasPorCategoria,
            promedioVistas: Math.round(totalVistas / totalGuias)
        };
        
        res.json({
            success: true,
            mensaje: 'Estadísticas obtenidas exitosamente',
            estadisticas
        });
        
    } catch (error) {
        console.error('❌ Error al obtener estadísticas:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener estadísticas',
            mensaje: error.message
        });
    }
};

// 📋 Obtener guía específica por ID
export const obtenerGuiaPorId = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`📋 Obteniendo guía con ID: ${id}`);
        
        const guia = guiasRapidasData.find(g => g.id == id);
        
        if (!guia) {
            return res.status(404).json({
                success: false,
                error: 'Guía no encontrada'
            });
        }
        
        res.json({
            success: true,
            mensaje: 'Guía obtenida exitosamente',
            guia
        });
        
    } catch (error) {
        console.error('❌ Error al obtener guía por ID:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener guía',
            mensaje: error.message
        });
    }
};