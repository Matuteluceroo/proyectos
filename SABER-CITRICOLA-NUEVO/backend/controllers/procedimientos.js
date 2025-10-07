// 📋 procedimientos.js - Controlador para procedimientos paso a paso
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Datos de ejemplo para procedimientos
const procedimientosData = [
    {
        id: 1,
        titulo: 'Poda de Formación en Cítricos',
        descripcion: 'Procedimiento completo para realizar poda de formación en árboles jóvenes de cítricos para optimizar su crecimiento y producción',
        categoria: 'mantenimiento',
        icono: '✂️',
        dificultad: 'media',
        duracionEstimada: '45-60 minutos',
        fechaCreacion: '2024-01-15',
        fechaActualizacion: '2024-01-20',
        pasos: [
            {
                titulo: 'Preparación de herramientas',
                descripcion: 'Preparar y desinfectar todas las herramientas necesarias para realizar una poda segura y efectiva',
                instrucciones: [
                    'Limpiar tijeras de poda con alcohol al 70% para evitar transmisión de enfermedades',
                    'Verificar el filo de las herramientas - deben cortar limpiamente',
                    'Preparar pasta cicatrizante para sellar cortes grandes',
                    'Usar guantes de protección resistentes a cortes',
                    'Tener a mano escalera si es necesario para alcanzar ramas altas'
                ],
                herramientas: [
                    'Tijeras de poda bypass',
                    'Serrucho de poda para ramas gruesas',
                    'Alcohol al 70% para desinfección',
                    'Pasta cicatrizante',
                    'Guantes de protección',
                    'Escalera (si es necesario)'
                ],
                precauciones: [
                    'Mantener herramientas limpias para evitar propagación de enfermedades',
                    'Usar equipo de protección personal en todo momento',
                    'Verificar estabilidad de escalera antes de usar'
                ],
                tiempoEstimado: '10 minutos'
            },
            {
                titulo: 'Evaluación del árbol',
                descripcion: 'Evaluar la estructura actual del árbol y planificar los cortes necesarios antes de comenzar la poda',
                instrucciones: [
                    'Observar la forma general del árbol desde diferentes ángulos',
                    'Identificar ramas muertas, enfermas o dañadas - estas tienen prioridad',
                    'Marcar ramas que interfieren entre sí o crecen hacia el interior',
                    'Planificar la estructura deseada según el tipo de formación',
                    'Determinar altura final deseada para facilitar manejo'
                ],
                herramientas: [
                    'Cinta de marcar de colores',
                    'Libreta para anotar observaciones'
                ],
                precauciones: [
                    'No podar más del 25% del follaje total en una sola sesión',
                    'Respetar la forma natural del árbol'
                ],
                tiempoEstimado: '10 minutos'
            },
            {
                titulo: 'Eliminación de ramas problemáticas',
                descripcion: 'Remover sistemáticamente ramas muertas, enfermas o que comprometen la estructura del árbol',
                instrucciones: [
                    'Comenzar cortando ramas muertas y enfermas para prevenir propagación',
                    'Eliminar chupones del tronco que roban energía al árbol',
                    'Remover ramas que crecen hacia el centro del árbol',
                    'Cortar ramas que se cruzan o rozan entre sí',
                    'Eliminar ramas muy bajas que dificultan el manejo'
                ],
                herramientas: [
                    'Tijeras de poda',
                    'Serrucho para ramas gruesas'
                ],
                precauciones: [
                    'Hacer cortes limpios y sesgados para favorecer cicatrización',
                    'Aplicar pasta cicatrizante en cortes mayores a 2cm de diámetro',
                    'No dejar muñones - cortar cerca del tronco o rama principal'
                ],
                tiempoEstimado: '20 minutos'
            },
            {
                titulo: 'Formación de estructura',
                descripcion: 'Dar forma a la copa del árbol según el tipo de formación deseada para optimizar producción',
                instrucciones: [
                    'Seleccionar 3-4 ramas principales bien distribuidas alrededor del tronco',
                    'Equilibrar la distribución de ramas para mantener estabilidad',
                    'Recortar puntas de ramas para estimular ramificación lateral',
                    'Mantener altura manejable (2.5-3 metros para facilitar cosecha)',
                    'Crear espacios para entrada de luz y circulación de aire'
                ],
                herramientas: [
                    'Tijeras de poda',
                    'Cinta métrica para verificar alturas'
                ],
                precauciones: [
                    'No cortar ramas principales muy drásticamente',
                    'Mantener equilibrio visual del árbol'
                ],
                tiempoEstimado: '15 minutos'
            },
            {
                titulo: 'Limpieza y cuidados post-poda',
                descripcion: 'Realizar la limpieza final y aplicar cuidados necesarios después de la poda',
                instrucciones: [
                    'Recoger y quemar todas las ramas cortadas para evitar plagas',
                    'Aplicar fertilizante balanceado para estimular crecimiento',
                    'Verificar que todos los cortes grandes tengan pasta cicatrizante',
                    'Regar abundantemente si es época seca',
                    'Programar seguimiento en 2-3 semanas'
                ],
                herramientas: [
                    'Rastrillo',
                    'Bolsas para residuos',
                    'Fertilizante balanceado'
                ],
                tiempoEstimado: '10 minutos'
            }
        ]
    },
    {
        id: 2,
        titulo: 'Aplicación de Fertilizante Foliar',
        descripcion: 'Procedimiento para aplicar fertilizante foliar de manera efectiva, segura y en el momento óptimo',
        categoria: 'fertilizacion',
        icono: '🌿',
        dificultad: 'baja',
        duracionEstimada: '30 minutos',
        fechaCreacion: '2024-01-10',
        pasos: [
            {
                titulo: 'Preparación de la mezcla',
                descripcion: 'Preparar la solución fertilizante según las especificaciones técnicas y necesidades del cultivo',
                instrucciones: [
                    'Calcular la cantidad necesaria según área a tratar y concentración requerida',
                    'Medir fertilizante con precisión usando balanza calibrada',
                    'Usar agua limpia, preferiblemente de pH neutro',
                    'Mezclar gradualmente para evitar formación de grumos',
                    'Verificar pH de la solución final (debe estar entre 5.5-6.5)',
                    'Colar la mezcla si es necesario para evitar obstrucciones'
                ],
                herramientas: [
                    'Recipiente de mezcla graduado',
                    'Balanza de precisión',
                    'pHmetro',
                    'Agitador o palo para mezclar',
                    'Colador fino'
                ],
                precauciones: [
                    'Usar equipo de protección personal',
                    'No preparar más solución de la que se va a usar inmediatamente',
                    'Mantener fertilizante alejado de niños y animales'
                ],
                tiempoEstimado: '10 minutos'
            },
            {
                titulo: 'Aplicación foliar',
                descripcion: 'Aplicar la solución sobre las hojas de manera uniforme y en condiciones óptimas',
                instrucciones: [
                    'Aplicar en horas de menor temperatura (temprano en la mañana o al atardecer)',
                    'Cubrir tanto el envés como el haz de las hojas',
                    'Mantener presión constante en el pulverizador',
                    'Evitar escurrimiento excesivo de la solución',
                    'Aplicar en movimientos sistemáticos para cobertura uniforme',
                    'No aplicar si hay viento fuerte o lluvia pronosticada'
                ],
                herramientas: [
                    'Pulverizador calibrado',
                    'Boquillas apropiadas para aplicación foliar'
                ],
                precauciones: [
                    'No aplicar con viento superior a 10 km/h',
                    'Usar mascarilla y protección ocular',
                    'No aplicar en horas de sol intenso para evitar quemaduras'
                ],
                tiempoEstimado: '20 minutos'
            }
        ]
    },
    {
        id: 3,
        titulo: 'Instalación de Sistema de Riego por Goteo',
        descripcion: 'Guía completa para instalar un sistema de riego por goteo eficiente y bien diseñado',
        categoria: 'riego',
        icono: '💧',
        dificultad: 'alta',
        duracionEstimada: '2-3 horas',
        fechaCreacion: '2024-01-08',
        pasos: [
            {
                titulo: 'Planificación del sistema',
                descripcion: 'Diseñar el layout del sistema considerando topografía, plantas y fuente de agua',
                tiempoEstimado: '30 minutos'
            },
            {
                titulo: 'Instalación de tuberías principales',
                descripcion: 'Instalar las líneas principales de distribución del agua',
                tiempoEstimado: '60 minutos'
            },
            {
                titulo: 'Colocación de goteros',
                descripcion: 'Instalar goteros en cada planta según sus necesidades hídricas',
                tiempoEstimado: '45 minutos'
            },
            {
                titulo: 'Pruebas y ajustes',
                descripcion: 'Verificar el funcionamiento del sistema y ajustar caudales',
                tiempoEstimado: '30 minutos'
            }
        ]
    },
    {
        id: 4,
        titulo: 'Aplicación de Tratamiento Fitosanitario',
        descripcion: 'Procedimiento seguro para aplicación de productos fitosanitarios',
        categoria: 'tratamientos',
        icono: '💊',
        dificultad: 'alta',
        duracionEstimada: '1-2 horas',
        pasos: [
            {
                titulo: 'Preparación del equipo de protección',
                descripcion: 'Equiparse adecuadamente para aplicación segura',
                tiempoEstimado: '15 minutos'
            },
            {
                titulo: 'Preparación del producto',
                descripcion: 'Mezclar el producto según especificaciones técnicas',
                tiempoEstimado: '20 minutos'
            },
            {
                titulo: 'Aplicación del tratamiento',
                descripcion: 'Aplicar el producto de manera uniforme y efectiva',
                tiempoEstimado: '45 minutos'
            },
            {
                titulo: 'Limpieza y disposición de residuos',
                descripcion: 'Limpiar equipo y disponer residuos apropiadamente',
                tiempoEstimado: '20 minutos'
            }
        ]
    }
];

const categoriasProcedimientos = [
    { id: 'mantenimiento', nombre: 'Mantenimiento', descripcion: 'Cuidado y mantenimiento de cultivos' },
    { id: 'siembra', nombre: 'Siembra', descripcion: 'Técnicas de siembra y plantación' },
    { id: 'tratamientos', nombre: 'Tratamientos', descripcion: 'Aplicación de tratamientos fitosanitarios' },
    { id: 'cosecha', nombre: 'Cosecha', descripcion: 'Procesos de cosecha y recolección' },
    { id: 'seguridad', nombre: 'Seguridad', descripcion: 'Procedimientos de seguridad laboral' },
    { id: 'maquinaria', nombre: 'Maquinaria', descripcion: 'Uso y mantenimiento de maquinaria' },
    { id: 'riego', nombre: 'Riego', descripcion: 'Sistemas y técnicas de riego' },
    { id: 'fertilizacion', nombre: 'Fertilización', descripcion: 'Aplicación de fertilizantes y nutrientes' }
];

// Almacenamiento temporal para progreso de usuarios (en producción sería base de datos)
const progresoUsuarios = new Map();

// 📋 Obtener todos los procedimientos
export const obtenerProcedimientos = async (req, res) => {
    try {
        console.log('📋 Obteniendo procedimientos...');
        
        res.json({
            success: true,
            mensaje: 'Procedimientos obtenidos exitosamente',
            procedimientos: procedimientosData,
            total: procedimientosData.length
        });
        
    } catch (error) {
        console.error('❌ Error al obtener procedimientos:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener procedimientos',
            mensaje: error.message
        });
    }
};

// 🔍 Buscar procedimientos
export const buscarProcedimientos = async (req, res) => {
    try {
        const { busqueda, categoria } = req.query;
        console.log('🔍 Buscando procedimientos:', { busqueda, categoria });
        
        let procedimientosFiltrados = [...procedimientosData];
        
        // Filtrar por búsqueda de texto
        if (busqueda && busqueda.trim()) {
            const termino = busqueda.toLowerCase().trim();
            procedimientosFiltrados = procedimientosFiltrados.filter(proc =>
                proc.titulo.toLowerCase().includes(termino) ||
                proc.descripcion.toLowerCase().includes(termino) ||
                proc.pasos?.some(paso => 
                    paso.titulo.toLowerCase().includes(termino) ||
                    paso.descripcion.toLowerCase().includes(termino)
                )
            );
        }
        
        // Filtrar por categoría
        if (categoria && categoria.trim()) {
            procedimientosFiltrados = procedimientosFiltrados.filter(proc => 
                proc.categoria === categoria.trim()
            );
        }
        
        res.json({
            success: true,
            mensaje: 'Búsqueda completada',
            procedimientos: procedimientosFiltrados,
            total: procedimientosFiltrados.length,
            filtros: { busqueda, categoria }
        });
        
    } catch (error) {
        console.error('❌ Error en búsqueda de procedimientos:', error);
        res.status(500).json({
            success: false,
            error: 'Error en la búsqueda',
            mensaje: error.message
        });
    }
};

// 📂 Obtener categorías de procedimientos
export const obtenerCategoriasProcedimientos = async (req, res) => {
    try {
        console.log('📂 Obteniendo categorías de procedimientos...');
        
        // Agregar conteo de procedimientos por categoría
        const categoriasConConteo = categoriasProcedimientos.map(categoria => {
            const conteoProcedimientos = procedimientosData.filter(proc => proc.categoria === categoria.id).length;
            return {
                ...categoria,
                totalProcedimientos: conteoProcedimientos
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

// ✅ Marcar paso como completado
export const marcarPasoComoCompletado = async (req, res) => {
    try {
        const { procedimientoId, pasoIndex } = req.params;
        const { completado } = req.body;
        const usuario = req.headers['x-user-name'] || 'Usuario anónimo';
        
        console.log(`✅ Marcando paso ${pasoIndex} del procedimiento ${procedimientoId} como ${completado ? 'completado' : 'no completado'} para ${usuario}`);
        
        const claveProgreso = `${usuario}-${procedimientoId}`;
        
        if (!progresoUsuarios.has(claveProgreso)) {
            progresoUsuarios.set(claveProgreso, {
                pasosCompletados: [],
                pasoActual: 0,
                comentarios: {},
                fechaInicio: new Date().toISOString()
            });
        }
        
        const progreso = progresoUsuarios.get(claveProgreso);
        const pasoIndexNum = parseInt(pasoIndex);
        
        if (completado) {
            if (!progreso.pasosCompletados.includes(pasoIndexNum)) {
                progreso.pasosCompletados.push(pasoIndexNum);
            }
        } else {
            progreso.pasosCompletados = progreso.pasosCompletados.filter(p => p !== pasoIndexNum);
        }
        
        progreso.fechaUltimaActualizacion = new Date().toISOString();
        
        res.json({
            success: true,
            mensaje: `Paso ${completado ? 'completado' : 'desmarcado'} exitosamente`,
            progreso: {
                pasosCompletados: progreso.pasosCompletados,
                totalPasos: procedimientosData.find(p => p.id == procedimientoId)?.pasos?.length || 0
            }
        });
        
    } catch (error) {
        console.error('❌ Error al marcar paso como completado:', error);
        res.status(500).json({
            success: false,
            error: 'Error al marcar paso como completado',
            mensaje: error.message
        });
    }
};

// 📊 Obtener progreso de procedimiento
export const obtenerProgresProcedimiento = async (req, res) => {
    try {
        const { procedimientoId } = req.params;
        const usuario = req.headers['x-user-name'] || 'Usuario anónimo';
        
        console.log(`📊 Obteniendo progreso del procedimiento ${procedimientoId} para ${usuario}`);
        
        const claveProgreso = `${usuario}-${procedimientoId}`;
        const progreso = progresoUsuarios.get(claveProgreso) || {
            pasosCompletados: [],
            pasoActual: 0,
            comentarios: {}
        };
        
        res.json({
            success: true,
            mensaje: 'Progreso obtenido exitosamente',
            progreso
        });
        
    } catch (error) {
        console.error('❌ Error al obtener progreso:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener progreso',
            mensaje: error.message
        });
    }
};

// 💬 Guardar comentario de paso
export const guardarComentarioProcedimiento = async (req, res) => {
    try {
        const { procedimientoId, pasoIndex } = req.params;
        const { comentario } = req.body;
        const usuario = req.headers['x-user-name'] || 'Usuario anónimo';
        
        console.log(`💬 Guardando comentario para paso ${pasoIndex} del procedimiento ${procedimientoId}`);
        
        const claveProgreso = `${usuario}-${procedimientoId}`;
        
        if (!progresoUsuarios.has(claveProgreso)) {
            progresoUsuarios.set(claveProgreso, {
                pasosCompletados: [],
                pasoActual: 0,
                comentarios: {}
            });
        }
        
        const progreso = progresoUsuarios.get(claveProgreso);
        progreso.comentarios[pasoIndex] = comentario;
        progreso.fechaUltimaActualizacion = new Date().toISOString();
        
        res.json({
            success: true,
            mensaje: 'Comentario guardado exitosamente'
        });
        
    } catch (error) {
        console.error('❌ Error al guardar comentario:', error);
        res.status(500).json({
            success: false,
            error: 'Error al guardar comentario',
            mensaje: error.message
        });
    }
};

// 📋 Obtener procedimiento específico por ID
export const obtenerProcedimientoPorId = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`📋 Obteniendo procedimiento con ID: ${id}`);
        
        const procedimiento = procedimientosData.find(p => p.id == id);
        
        if (!procedimiento) {
            return res.status(404).json({
                success: false,
                error: 'Procedimiento no encontrado'
            });
        }
        
        res.json({
            success: true,
            mensaje: 'Procedimiento obtenido exitosamente',
            procedimiento
        });
        
    } catch (error) {
        console.error('❌ Error al obtener procedimiento por ID:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener procedimiento',
            mensaje: error.message
        });
    }
};

// 📊 Obtener estadísticas de procedimientos
export const obtenerEstadisticasProcedimientos = async (req, res) => {
    try {
        console.log('📊 Obteniendo estadísticas de procedimientos...');
        
        const totalProcedimientos = procedimientosData.length;
        
        // Calcular estadísticas de progreso (simuladas)
        const enProgreso = Math.floor(totalProcedimientos * 0.3);
        const completados = Math.floor(totalProcedimientos * 0.6);
        
        // Procedimientos más usados (simulado)
        const masUsados = procedimientosData
            .slice(0, 3)
            .map(proc => proc.titulo);
        
        const estadisticas = {
            totalProcedimientos,
            enProgreso,
            completados,
            noIniciados: totalProcedimientos - enProgreso - completados,
            masUsados,
            promedioCompletitud: Math.round((completados / totalProcedimientos) * 100)
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

// 🔄 Reiniciar progreso de procedimiento
export const reiniciarProgresoProcedimiento = async (req, res) => {
    try {
        const { procedimientoId } = req.params;
        const usuario = req.headers['x-user-name'] || 'Usuario anónimo';
        
        console.log(`🔄 Reiniciando progreso del procedimiento ${procedimientoId} para ${usuario}`);
        
        const claveProgreso = `${usuario}-${procedimientoId}`;
        
        progresoUsuarios.set(claveProgreso, {
            pasosCompletados: [],
            pasoActual: 0,
            comentarios: {},
            fechaReinicio: new Date().toISOString()
        });
        
        res.json({
            success: true,
            mensaje: 'Progreso reiniciado exitosamente'
        });
        
    } catch (error) {
        console.error('❌ Error al reiniciar progreso:', error);
        res.status(500).json({
            success: false,
            error: 'Error al reiniciar progreso',
            mensaje: error.message
        });
    }
};