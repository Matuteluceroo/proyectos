// 📊 MiProgreso.jsx - Página detallada de progreso de capacitación
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const MiProgreso = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [estadisticas, setEstadisticas] = useState({
        cursosEnProgreso: 3,
        cursosCompletados: 12,
        progresoGeneral: 85,
        horasEstudio: 47,
        certificados: 8,
        puntajeTotal: 2340
    });

    const [cursosEnProgreso, setCursosEnProgreso] = useState([
        {
            id: 1,
            titulo: 'Control Integrado de Plagas',
            categoria: 'Control de Plagas',
            progreso: 75,
            horasCompletadas: 12,
            horasTotales: 16,
            ultimaActividad: '2024-10-03',
            modulos: [
                { nombre: 'Identificación de plagas', completado: true },
                { nombre: 'Métodos biológicos', completado: true },
                { nombre: 'Aplicación de tratamientos', completado: true },
                { nombre: 'Monitoreo y seguimiento', completado: false }
            ]
        },
        {
            id: 2,
            titulo: 'Técnicas de Poda Moderna',
            categoria: 'Poda y Manejo',
            progreso: 40,
            horasCompletadas: 6,
            horasTotales: 15,
            ultimaActividad: '2024-10-02',
            modulos: [
                { nombre: 'Principios de poda', completado: true },
                { nombre: 'Herramientas especializadas', completado: true },
                { nombre: 'Técnicas de corte', completado: false },
                { nombre: 'Poda de formación', completado: false },
                { nombre: 'Poda de producción', completado: false }
            ]
        },
        {
            id: 3,
            titulo: 'Fertilización Orgánica Avanzada',
            categoria: 'Fertilización',
            progreso: 90,
            horasCompletadas: 18,
            horasTotales: 20,
            ultimaActividad: '2024-10-04',
            modulos: [
                { nombre: 'Análisis de suelo', completado: true },
                { nombre: 'Compostaje profesional', completado: true },
                { nombre: 'Aplicación foliar', completado: true },
                { nombre: 'Micronutrientes', completado: true },
                { nombre: 'Evaluación final', completado: false }
            ]
        }
    ]);

    const [cursosCompletados, setCursosCompletados] = useState([
        {
            id: 11,
            titulo: 'Fundamentos del Cultivo Citrícola',
            categoria: 'Técnicas de Cultivo',
            fechaCompletado: '2024-09-15',
            calificacion: 95,
            certificado: true,
            horas: 20
        },
        {
            id: 12,
            titulo: 'Sistemas de Riego Eficiente',
            categoria: 'Riego',
            fechaCompletado: '2024-09-10',
            calificacion: 88,
            certificado: true,
            horas: 16
        },
        {
            id: 13,
            titulo: 'Injertos y Propagación',
            categoria: 'Técnicas de Cultivo',
            fechaCompletado: '2024-08-25',
            calificacion: 92,
            certificado: true,
            horas: 18
        },
        {
            id: 14,
            titulo: 'Nutrición Vegetal Básica',
            categoria: 'Fertilización',
            fechaCompletado: '2024-08-15',
            calificacion: 87,
            certificado: false,
            horas: 12
        }
    ]);

    const [certificados, setCertificados] = useState([
        {
            id: 1,
            titulo: 'Especialista en Control de Plagas',
            fechaEmision: '2024-09-20',
            validez: '2026-09-20',
            institucion: 'SENASA - Saber Citrícola'
        },
        {
            id: 2,
            titulo: 'Técnico en Sistemas de Riego',
            fechaEmision: '2024-09-12',
            validez: '2027-09-12',
            institucion: 'INTA - Saber Citrícola'
        }
    ]);

    useEffect(() => {
        // Simular carga de datos
        const cargarDatos = () => {
            setLoading(true);
            setTimeout(() => {
                setLoading(false);
            }, 1000);
        };
        cargarDatos();
    }, []);

    const continuarCurso = (cursoId) => {
        navigate(`/curso/${cursoId}`);
    };

    const descargarCertificado = (certificadoId) => {
        alert(`Descargando certificado ID: ${certificadoId}`);
        // Aquí implementarías la lógica real de descarga
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
                <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
                    <div className="text-xl text-gray-800 mb-2">Cargando tu progreso...</div>
                    <div className="text-gray-600">Preparando datos de capacitación</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            {/* Header */}
            <div className="bg-white shadow-lg border-b-4 border-blue-500">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-6">
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 font-bold transition-all duration-200 hover:scale-105"
                            >
                                🏠 <span>Dashboard</span>
                            </button>
                            <div className="hidden md:flex items-center space-x-2 text-gray-400">
                                <span>/</span>
                                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                    📊 MI PROGRESO
                                </span>
                            </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                            <div className="text-right">
                                <div className="text-sm text-gray-500">Operador</div>
                                <div className="font-bold text-gray-800">{user?.nombre_completo || user?.username}</div>
                            </div>
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
                                👤
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Estadísticas Principales */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-green-100 to-emerald-200 rounded-2xl p-6 border-l-4 border-green-500 shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-2">Progreso General</h3>
                                <div className="text-4xl font-black text-green-600 mb-2">{estadisticas.progresoGeneral}%</div>
                                <div className="w-full bg-green-200 rounded-full h-3">
                                    <div 
                                        className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500"
                                        style={{ width: `${estadisticas.progresoGeneral}%` }}
                                    ></div>
                                </div>
                            </div>
                            <div className="text-5xl">🏆</div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl p-6 border-l-4 border-blue-500 shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-2">Cursos Completados</h3>
                                <div className="text-4xl font-black text-blue-600">{estadisticas.cursosCompletados}</div>
                                <div className="text-sm text-gray-600 mt-1">{estadisticas.cursosEnProgreso} en progreso</div>
                            </div>
                            <div className="text-5xl">✅</div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl p-6 border-l-4 border-purple-500 shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-2">Horas de Estudio</h3>
                                <div className="text-4xl font-black text-purple-600">{estadisticas.horasEstudio}</div>
                                <div className="text-sm text-gray-600 mt-1">{estadisticas.certificados} certificados</div>
                            </div>
                            <div className="text-5xl">⏱️</div>
                        </div>
                    </div>
                </div>

                {/* Cursos en Progreso */}
                <div className="bg-white rounded-2xl shadow-xl mb-8 border-l-4 border-orange-500">
                    <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-4 rounded-t-2xl">
                        <h2 className="text-2xl font-bold text-white">📈 Cursos en Progreso</h2>
                    </div>
                    <div className="p-6">
                        <div className="space-y-6">
                            {cursosEnProgreso.map(curso => (
                                <div key={curso.id} className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-6 border-2 border-orange-200 hover:shadow-lg transition-all duration-300">
                                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
                                        <div className="mb-4 lg:mb-0">
                                            <h3 className="text-xl font-bold text-gray-800 mb-2">{curso.titulo}</h3>
                                            <span className="inline-block bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-semibold">
                                                {curso.categoria}
                                            </span>
                                            <div className="text-sm text-gray-600 mt-2">
                                                Última actividad: {new Date(curso.ultimaActividad).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-3xl font-bold text-orange-600 mb-1">{curso.progreso}%</div>
                                            <div className="text-sm text-gray-600">{curso.horasCompletadas}/{curso.horasTotales} horas</div>
                                        </div>
                                    </div>
                                    
                                    {/* Barra de progreso */}
                                    <div className="w-full bg-orange-200 rounded-full h-4 mb-4">
                                        <div 
                                            className="bg-gradient-to-r from-orange-500 to-amber-500 h-4 rounded-full transition-all duration-500"
                                            style={{ width: `${curso.progreso}%` }}
                                        ></div>
                                    </div>
                                    
                                    {/* Módulos */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mb-4">
                                        {curso.modulos.map((modulo, index) => (
                                            <div 
                                                key={index}
                                                className={`flex items-center space-x-2 p-2 rounded-lg text-sm ${
                                                    modulo.completado 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-gray-100 text-gray-600'
                                                }`}
                                            >
                                                <span>{modulo.completado ? '✅' : '⏳'}</span>
                                                <span>{modulo.nombre}</span>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    <button
                                        onClick={() => continuarCurso(curso.id)}
                                        className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105"
                                    >
                                        🎯 Continuar Curso
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Cursos Completados */}
                <div className="bg-white rounded-2xl shadow-xl mb-8 border-l-4 border-green-500">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-4 rounded-t-2xl">
                        <h2 className="text-2xl font-bold text-white">✅ Cursos Completados</h2>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {cursosCompletados.map(curso => (
                                <div key={curso.id} className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200 hover:shadow-lg transition-all duration-300">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-800 mb-2">{curso.titulo}</h3>
                                            <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                                                {curso.categoria}
                                            </span>
                                        </div>
                                        {curso.certificado && (
                                            <div className="text-2xl">🏆</div>
                                        )}
                                    </div>
                                    
                                    <div className="space-y-2 mb-4">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Completado:</span>
                                            <span className="font-semibold">{new Date(curso.fechaCompletado).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Calificación:</span>
                                            <span className="font-semibold text-green-600">{curso.calificacion}%</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Duración:</span>
                                            <span className="font-semibold">{curso.horas} horas</span>
                                        </div>
                                    </div>
                                    
                                    {curso.certificado && (
                                        <button
                                            onClick={() => descargarCertificado(curso.id)}
                                            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-4 py-2 rounded-lg font-bold transition-all duration-300"
                                        >
                                            📄 Descargar Certificado
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Certificados */}
                <div className="bg-white rounded-2xl shadow-xl border-l-4 border-yellow-500">
                    <div className="bg-gradient-to-r from-yellow-500 to-amber-500 px-6 py-4 rounded-t-2xl">
                        <h2 className="text-2xl font-bold text-white">🏆 Mis Certificados</h2>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {certificados.map(certificado => (
                                <div key={certificado.id} className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl p-6 border-2 border-yellow-200 hover:shadow-lg transition-all duration-300">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-800 mb-2">{certificado.titulo}</h3>
                                            <div className="text-sm text-gray-600">{certificado.institucion}</div>
                                        </div>
                                        <div className="text-3xl">🏆</div>
                                    </div>
                                    
                                    <div className="space-y-2 mb-4">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Emitido:</span>
                                            <span className="font-semibold">{new Date(certificado.fechaEmision).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Válido hasta:</span>
                                            <span className="font-semibold text-green-600">{new Date(certificado.validez).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    
                                    <button
                                        onClick={() => descargarCertificado(certificado.id)}
                                        className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white px-4 py-2 rounded-lg font-bold transition-all duration-300"
                                    >
                                        📥 Descargar
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MiProgreso;