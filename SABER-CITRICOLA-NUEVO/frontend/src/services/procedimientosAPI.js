// 📋 procedimientosAPI.js - Servicio para procedimientos paso a paso
import { buildApiUrl } from '../config/app.config.js';


// 🔐 Función auxiliar para obtener headers con autenticación
const getHeaders = () => {
    let userData = null;
    
    try {
        userData = JSON.parse(localStorage.getItem('userData'));
    } catch (error) {
        console.log('No hay userData en localStorage');
    }
    
    if (!userData) {
        try {
            userData = JSON.parse(localStorage.getItem('user'));
        } catch (error) {
            console.log('No hay user en localStorage');
        }
    }
    
    const headers = {
        'Content-Type': 'application/json',
    };
    
    if (userData && userData.token) {
        headers['Authorization'] = `Bearer ${userData.token}`;
    }
    
    if (!userData) {
        const nombre = localStorage.getItem('userName');
        const rol = localStorage.getItem('userRole');
        if (nombre && rol) {
            headers['X-User-Name'] = nombre;
            headers['X-User-Role'] = rol;
        }
    } else {
        headers['X-User-Name'] = userData.nombre_completo || userData.username;
        headers['X-User-Role'] = userData.rol;
    }
    
    return headers;
};

// 📋 Obtener todos los procedimientos
export const obtenerProcedimientos = async () => {
    try {
        console.log('📋 Obteniendo procedimientos...');
        
        const response = await fetch(`buildApiUrl('/procedimientos`, {
            method: 'GET',
            headers: getHeaders()
        });
        
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('✅ Procedimientos obtenidos:', data);
        return data.procedimientos || data;
        
    } catch (error) {
        console.error('❌ Error al obtener procedimientos:', error);
        // Retornar datos de ejemplo en caso de error
        return [
            {
                id: 1,
                titulo: 'Poda de Formación en Cítricos',
                descripcion: 'Procedimiento completo para realizar poda de formación en árboles jóvenes de cítricos',
                categoria: 'mantenimiento',
                icono: '✂️',
                dificultad: 'media',
                duracionEstimada: '45-60 minutos',
                pasos: [
                    {
                        titulo: 'Preparación de herramientas',
                        descripcion: 'Preparar y desinfectar todas las herramientas necesarias para la poda',
                        instrucciones: [
                            'Limpiar tijeras de poda con alcohol al 70%',
                            'Verificar el filo de las herramientas',
                            'Preparar pasta cicatrizante',
                            'Usar guantes de protección'
                        ],
                        herramientas: ['Tijeras de poda', 'Serrucho de poda', 'Alcohol 70%', 'Pasta cicatrizante', 'Guantes'],
                        precauciones: ['Mantener herramientas limpias para evitar enfermedades', 'Usar equipo de protección'],
                        tiempoEstimado: '10 minutos'
                    },
                    {
                        titulo: 'Evaluación del árbol',
                        descripcion: 'Evaluar la estructura actual del árbol y planificar los cortes',
                        instrucciones: [
                            'Observar la forma general del árbol',
                            'Identificar ramas dañadas o enfermas',
                            'Marcar ramas que interfieren entre sí',
                            'Planificar la estructura deseada'
                        ],
                        herramientas: ['Cinta de marcar'],
                        precauciones: ['No podar más del 25% del follaje total'],
                        tiempoEstimado: '10 minutos'
                    },
                    {
                        titulo: 'Eliminación de ramas problemáticas',
                        descripcion: 'Remover ramas muertas, enfermas o que crecen hacia el interior',
                        instrucciones: [
                            'Cortar ramas muertas primero',
                            'Eliminar chupones del tronco',
                            'Remover ramas que crecen hacia el centro',
                            'Cortar ramas que se cruzan'
                        ],
                        precauciones: ['Hacer cortes limpios y sesgados', 'Aplicar pasta cicatrizante en cortes grandes'],
                        tiempoEstimado: '20 minutos'
                    },
                    {
                        titulo: 'Formación de estructura',
                        descripcion: 'Dar forma a la copa del árbol según el tipo de formación deseada',
                        instrucciones: [
                            'Seleccionar 3-4 ramas principales',
                            'Equilibrar la distribución de ramas',
                            'Recortar puntas para estimular ramificación',
                            'Mantener altura manejable'
                        ],
                        tiempoEstimado: '15 minutos'
                    }
                ]
            },
            {
                id: 2,
                titulo: 'Aplicación de Fertilizante Foliar',
                descripcion: 'Procedimiento para aplicar fertilizante foliar de manera efectiva y segura',
                categoria: 'fertilizacion',
                icono: '🌿',
                dificultad: 'baja',
                duracionEstimada: '30 minutos',
                pasos: [
                    {
                        titulo: 'Preparación de la mezcla',
                        descripcion: 'Preparar la solución fertilizante según las especificaciones',
                        instrucciones: [
                            'Calcular la cantidad necesaria según área',
                            'Medir fertilizante con precisión',
                            'Mezclar con agua limpia',
                            'Verificar pH de la solución'
                        ],
                        herramientas: ['Recipiente de mezcla', 'Balanza', 'pHmetro', 'Agitador'],
                        tiempoEstimado: '10 minutos'
                    },
                    {
                        titulo: 'Aplicación foliar',
                        descripcion: 'Aplicar la solución sobre las hojas de manera uniforme',
                        instrucciones: [
                            'Aplicar en horas de menor temperatura',
                            'Cubrir envés y haz de las hojas',
                            'Mantener presión constante',
                            'Evitar escurrimiento excesivo'
                        ],
                        precauciones: ['No aplicar con viento fuerte', 'Usar equipo de protección personal'],
                        tiempoEstimado: '20 minutos'
                    }
                ]
            },
            {
                id: 3,
                titulo: 'Instalación de Sistema de Riego por Goteo',
                descripcion: 'Guía completa para instalar un sistema de riego por goteo eficiente',
                categoria: 'riego',
                icono: '💧',
                dificultad: 'alta',
                duracionEstimada: '2-3 horas',
                pasos: [
                    {
                        titulo: 'Planificación del sistema',
                        descripcion: 'Diseñar el layout del sistema de riego',
                        tiempoEstimado: '30 minutos'
                    },
                    {
                        titulo: 'Instalación de tuberías principales',
                        descripcion: 'Instalar las líneas principales de distribución',
                        tiempoEstimado: '60 minutos'
                    },
                    {
                        titulo: 'Colocación de goteros',
                        descripcion: 'Instalar goteros en cada planta según sus necesidades',
                        tiempoEstimado: '45 minutos'
                    },
                    {
                        titulo: 'Pruebas y ajustes',
                        descripcion: 'Verificar el funcionamiento y ajustar caudales',
                        tiempoEstimado: '30 minutos'
                    }
                ]
            }
        ];
    }
};

// 🔍 Buscar procedimientos
export const buscarProcedimientos = async (filtros) => {
    try {
        console.log('🔍 Buscando procedimientos:', filtros);
        
        const params = new URLSearchParams();
        if (filtros.busqueda) params.append('busqueda', filtros.busqueda);
        if (filtros.categoria) params.append('categoria', filtros.categoria);
        
        const response = await fetch(`buildApiUrl('/procedimientos/buscar?${params.toString()}`, {
            method: 'GET',
            headers: getHeaders()
        });
        
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('✅ Búsqueda completada:', data);
        return data.procedimientos || data;
        
    } catch (error) {
        console.error('❌ Error en búsqueda de procedimientos:', error);
        // Simular filtrado local como fallback
        const todosLosProcedimientos = await obtenerProcedimientos();
        return todosLosProcedimientos.filter(procedimiento => {
            const coincideBusqueda = !filtros.busqueda || 
                procedimiento.titulo.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
                procedimiento.descripcion.toLowerCase().includes(filtros.busqueda.toLowerCase());
            
            const coincideCategoria = !filtros.categoria || procedimiento.categoria === filtros.categoria;
            
            return coincideBusqueda && coincideCategoria;
        });
    }
};

// 📂 Obtener categorías de procedimientos
export const obtenerCategoriasProcedimientos = async () => {
    try {
        console.log('📂 Obteniendo categorías de procedimientos...');
        
        const response = await fetch(`buildApiUrl('/procedimientos/categorias`, {
            method: 'GET',
            headers: getHeaders()
        });
        
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('✅ Categorías obtenidas:', data);
        return data.categorias || data;
        
    } catch (error) {
        console.error('❌ Error al obtener categorías:', error);
        // Retornar categorías de ejemplo
        return [
            { id: 'mantenimiento', nombre: 'Mantenimiento', descripcion: 'Cuidado y mantenimiento' },
            { id: 'siembra', nombre: 'Siembra', descripcion: 'Técnicas de siembra' },
            { id: 'tratamientos', nombre: 'Tratamientos', descripcion: 'Aplicación de tratamientos' },
            { id: 'cosecha', nombre: 'Cosecha', descripcion: 'Procesos de cosecha' },
            { id: 'seguridad', nombre: 'Seguridad', descripcion: 'Procedimientos de seguridad' },
            { id: 'maquinaria', nombre: 'Maquinaria', descripcion: 'Uso de maquinaria' },
            { id: 'riego', nombre: 'Riego', descripcion: 'Sistemas de riego' },
            { id: 'fertilizacion', nombre: 'Fertilización', descripcion: 'Aplicación de fertilizantes' }
        ];
    }
};

// ✅ Marcar paso como completado
export const marcarPasoComoCompletado = async (procedimientoId, pasoIndex, completado) => {
    try {
        console.log('✅ Marcando paso como completado:', { procedimientoId, pasoIndex, completado });
        
        const response = await fetch(`buildApiUrl('/procedimientos/${procedimientoId}/pasos/${pasoIndex}/completar`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ completado })
        });
        
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('✅ Estado del paso actualizado:', data);
        return data;
        
    } catch (error) {
        console.error('❌ Error al marcar paso como completado:', error);
        return { success: false };
    }
};

// 📊 Obtener progreso de procedimiento
export const obtenerProgresProcedimiento = async (procedimientoId) => {
    try {
        console.log('📊 Obteniendo progreso del procedimiento:', procedimientoId);
        
        const response = await fetch(`buildApiUrl('/procedimientos/${procedimientoId}/progreso`, {
            method: 'GET',
            headers: getHeaders()
        });
        
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('✅ Progreso obtenido:', data);
        return data.progreso || data;
        
    } catch (error) {
        console.error('❌ Error al obtener progreso:', error);
        return {
            pasosCompletados: [],
            pasoActual: 0,
            comentarios: {}
        };
    }
};

// 💬 Guardar comentario de procedimiento
export const guardarComentarioProcedimiento = async (procedimientoId, pasoIndex, comentario) => {
    try {
        console.log('💬 Guardando comentario:', { procedimientoId, pasoIndex, comentario });
        
        const response = await fetch(`buildApiUrl('/procedimientos/${procedimientoId}/pasos/${pasoIndex}/comentario`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ comentario })
        });
        
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('✅ Comentario guardado:', data);
        return data;
        
    } catch (error) {
        console.error('❌ Error al guardar comentario:', error);
        return { success: false };
    }
};

// 📋 Obtener procedimiento específico
export const obtenerProcedimientoPorId = async (procedimientoId) => {
    try {
        console.log('📋 Obteniendo procedimiento por ID:', procedimientoId);
        
        const response = await fetch(`buildApiUrl('/procedimientos/${procedimientoId}`, {
            method: 'GET',
            headers: getHeaders()
        });
        
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('✅ Procedimiento obtenido:', data);
        return data.procedimiento || data;
        
    } catch (error) {
        console.error('❌ Error al obtener procedimiento:', error);
        throw error;
    }
};

// 📊 Obtener estadísticas de procedimientos
export const obtenerEstadisticasProcedimientos = async () => {
    try {
        console.log('📊 Obteniendo estadísticas de procedimientos...');
        
        const response = await fetch(`buildApiUrl('/procedimientos/estadisticas`, {
            method: 'GET',
            headers: getHeaders()
        });
        
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('✅ Estadísticas obtenidas:', data);
        return data;
        
    } catch (error) {
        console.error('❌ Error al obtener estadísticas:', error);
        return {
            totalProcedimientos: 12,
            enProgreso: 3,
            completados: 8,
            masUsados: ['Poda de Formación', 'Aplicación de Fertilizante']
        };
    }
};

// 🔄 Reiniciar progreso de procedimiento
export const reiniciarProgresoProcedimiento = async (procedimientoId) => {
    try {
        console.log('🔄 Reiniciando progreso del procedimiento:', procedimientoId);
        
        const response = await fetch(`buildApiUrl('/procedimientos/${procedimientoId}/reiniciar`, {
            method: 'POST',
            headers: getHeaders()
        });
        
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('✅ Progreso reiniciado:', data);
        return data;
        
    } catch (error) {
        console.error('❌ Error al reiniciar progreso:', error);
        return { success: false };
    }
};