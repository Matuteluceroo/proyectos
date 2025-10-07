// ⚡ guiasRapidasAPI.js - Servicio para guías rápidas
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

// ⚡ Obtener todas las guías rápidas
export const obtenerGuiasRapidas = async () => {
    try {
        console.log('⚡ Obteniendo guías rápidas...');
        
        const response = await fetch(`buildApiUrl('/guias-rapidas`, {
            method: 'GET',
            headers: getHeaders()
        });
        
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('✅ Guías rápidas obtenidas:', data);
        return data.guias || data;
        
    } catch (error) {
        console.error('❌ Error al obtener guías rápidas:', error);
        // Retornar datos de ejemplo en caso de error
        return [
            {
                id: 1,
                titulo: 'Identificación Rápida de Plagas',
                descripcion: 'Guía visual para identificar las plagas más comunes en cítricos',
                categoria: 'plagas',
                icono: '🐛',
                prioridad: 'alta',
                tiempoLectura: 3,
                vistas: 245,
                contenido: [
                    {
                        titulo: 'Signos Visuales',
                        texto: 'Busca hojas amarillentas, manchas oscuras o deformaciones en las hojas.'
                    },
                    {
                        titulo: 'Acciones Inmediatas',
                        texto: 'Aísla la planta afectada y documenta los síntomas observados.',
                        lista: [
                            'Fotografiar las áreas afectadas',
                            'Medir la extensión del daño',
                            'Verificar plantas cercanas'
                        ]
                    }
                ],
                notasImportantes: [
                    'Actúa rápidamente para prevenir propagación',
                    'Consulta con experto si no estás seguro'
                ],
                recursosRelacionados: [
                    'Manual de Tratamiento de Plagas',
                    'Contactos de Especialistas'
                ]
            },
            {
                id: 2,
                titulo: 'Calibración de pH del Suelo',
                descripcion: 'Pasos rápidos para medir y ajustar el pH del suelo',
                categoria: 'cultivo',
                icono: '🌱',
                prioridad: 'media',
                tiempoLectura: 5,
                vistas: 189,
                contenido: [
                    {
                        titulo: 'Herramientas Necesarias',
                        texto: 'Medidor de pH, agua destilada, muestras de suelo de diferentes puntos.'
                    },
                    {
                        titulo: 'Proceso de Medición',
                        texto: 'Toma muestras a 15cm de profundidad en varios puntos del terreno.',
                        lista: [
                            'Limpia el medidor con agua destilada',
                            'Inserta en suelo húmedo',
                            'Espera 60 segundos para lectura estable'
                        ]
                    }
                ]
            },
            {
                id: 3,
                titulo: 'Dosificación de Riego por Goteo',
                descripcion: 'Cálculo rápido de cantidad de agua necesaria',
                categoria: 'riego',
                icono: '💧',
                prioridad: 'alta',
                tiempoLectura: 4,
                vistas: 312
            }
        ];
    }
};

// 🔍 Buscar guías rápidas
export const buscarGuiasRapidas = async (filtros) => {
    try {
        console.log('🔍 Buscando guías rápidas:', filtros);
        
        const params = new URLSearchParams();
        if (filtros.busqueda) params.append('busqueda', filtros.busqueda);
        if (filtros.categoria) params.append('categoria', filtros.categoria);
        
        const response = await fetch(`buildApiUrl('/guias-rapidas/buscar?${params.toString()}`, {
            method: 'GET',
            headers: getHeaders()
        });
        
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('✅ Búsqueda completada:', data);
        return data.guias || data;
        
    } catch (error) {
        console.error('❌ Error en búsqueda de guías:', error);
        // Simular filtrado local como fallback
        const todasLasGuias = await obtenerGuiasRapidas();
        return todasLasGuias.filter(guia => {
            const coincideBusqueda = !filtros.busqueda || 
                guia.titulo.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
                guia.descripcion.toLowerCase().includes(filtros.busqueda.toLowerCase());
            
            const coincideCategoria = !filtros.categoria || guia.categoria === filtros.categoria;
            
            return coincideBusqueda && coincideCategoria;
        });
    }
};

// 📂 Obtener categorías de guías
export const obtenerCategoriasGuias = async () => {
    try {
        console.log('📂 Obteniendo categorías de guías...');
        
        const response = await fetch(`buildApiUrl('/guias-rapidas/categorias`, {
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
            { id: 'cultivo', nombre: 'Cultivo', descripcion: 'Técnicas de cultivo' },
            { id: 'plagas', nombre: 'Plagas', descripcion: 'Control de plagas' },
            { id: 'riego', nombre: 'Riego', descripcion: 'Sistemas de riego' },
            { id: 'fertilizacion', nombre: 'Fertilización', descripcion: 'Nutrición de plantas' },
            { id: 'cosecha', nombre: 'Cosecha', descripcion: 'Técnicas de cosecha' },
            { id: 'poda', nombre: 'Poda', descripcion: 'Técnicas de poda' }
        ];
    }
};

// 👁️ Marcar guía como consultada
export const marcarGuiaComoConsultada = async (guiaId) => {
    try {
        console.log('👁️ Marcando guía como consultada:', guiaId);
        
        const response = await fetch(`buildApiUrl('/guias-rapidas/${guiaId}/consultar`, {
            method: 'POST',
            headers: getHeaders()
        });
        
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('✅ Guía marcada como consultada:', data);
        return data;
        
    } catch (error) {
        console.error('❌ Error al marcar guía como consultada:', error);
        // Fallar silenciosamente para no interrumpir la experiencia del usuario
        return { success: false };
    }
};

// ⭐ Marcar guía como favorita
export const marcarGuiaComoFavorita = async (guiaId) => {
    try {
        console.log('⭐ Marcando guía como favorita:', guiaId);
        
        const response = await fetch(`buildApiUrl('/guias-rapidas/${guiaId}/favorita`, {
            method: 'POST',
            headers: getHeaders()
        });
        
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('✅ Guía marcada como favorita:', data);
        return data;
        
    } catch (error) {
        console.error('❌ Error al marcar guía como favorita:', error);
        return { success: false };
    }
};

// 📊 Obtener estadísticas de uso
export const obtenerEstadisticasGuias = async () => {
    try {
        console.log('📊 Obteniendo estadísticas de guías...');
        
        const response = await fetch(`buildApiUrl('/guias-rapidas/estadisticas`, {
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
            totalGuias: 15,
            masConsultadas: ['Identificación de Plagas', 'Dosificación de Riego'],
            categoriaPopular: 'Plagas'
        };
    }
};