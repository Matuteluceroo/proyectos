// 📊 MiProgreso.jsx - Página detallada de progreso de capacitación
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

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
            <div style={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #fef3c7 0%, #fed7aa 50%, #f97316 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <div style={{
                    background: 'linear-gradient(135deg, #ffffff 0%, #fef3c7 100%)',
                    borderRadius: '20px',
                    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
                    padding: '32px',
                    textAlign: 'center',
                    border: '2px solid #fed7aa'
                }}>
                    <div style={{
                        width: '64px',
                        height: '64px',
                        border: '6px solid #fbbf24',
                        borderTop: '6px solid #f97316',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 24px'
                    }}></div>
                    <div style={{
                        fontSize: '24px',
                        color: '#1f2937',
                        marginBottom: '8px',
                        fontWeight: 'bold'
                    }}>
                        Cargando tu progreso...
                    </div>
                    <div style={{
                        color: '#6b7280',
                        fontSize: '16px',
                        fontWeight: '500'
                    }}>
                        Preparando datos de capacitación
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #fef3c7 0%, #fed7aa 50%, #f97316 100%)'
        }}>
            {/* 🎯 Header */}
            <div style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #fef3c7 100%)',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
                borderBottom: '4px solid #f97316'
            }}>
                <div style={{
                    maxWidth: '1280px',
                    margin: '0 auto',
                    padding: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                        <button
                            onClick={() => navigate('/dashboard')}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '12px',
                                padding: '12px 16px',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                fontSize: '14px',
                                transition: 'all 0.3s ease',
                                boxShadow: '0 4px 12px rgba(249, 115, 22, 0.3)'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.transform = 'translateY(-2px)';
                                e.target.style.boxShadow = '0 8px 20px rgba(249, 115, 22, 0.4)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = '0 4px 12px rgba(249, 115, 22, 0.3)';
                            }}
                        >
                            🏠 <span>Dashboard</span>
                        </button>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            color: '#9ca3af'
                        }}>
                            <span>/</span>
                            <span style={{
                                fontSize: '24px',
                                fontWeight: 'bold',
                                background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text'
                            }}>
                                📊 MI PROGRESO
                            </span>
                        </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{
                                fontSize: '12px',
                                color: '#6b7280',
                                fontWeight: '500'
                            }}>
                                Operador
                            </div>
                            <div style={{
                                fontWeight: 'bold',
                                color: '#1f2937',
                                fontSize: '14px'
                            }}>
                                {user?.nombre_completo || user?.username}
                            </div>
                        </div>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '18px',
                            boxShadow: '0 4px 12px rgba(249, 115, 22, 0.3)'
                        }}>
                            👤
                        </div>
                    </div>
                </div>
            </div>

            {/* 📊 Main Content */}
            <div style={{
                maxWidth: '1280px',
                margin: '0 auto',
                padding: '32px 24px'
            }}>
                {/* 📈 Estadísticas Principales */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '24px',
                    marginBottom: '32px'
                }}>
                    <div style={{
                        background: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)',
                        borderRadius: '20px',
                        padding: '24px',
                        borderLeft: '6px solid #22c55e',
                        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
                        transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = '0 20px 40px rgba(34, 197, 94, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.1)';
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ flex: 1 }}>
                                <h3 style={{
                                    fontSize: '12px',
                                    fontWeight: 'bold',
                                    color: '#374151',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    marginBottom: '8px'
                                }}>
                                    Progreso General
                                </h3>
                                <div style={{
                                    fontSize: '36px',
                                    fontWeight: '900',
                                    color: '#22c55e',
                                    marginBottom: '12px'
                                }}>
                                    {estadisticas.progresoGeneral}%
                                </div>
                                <div style={{
                                    width: '100%',
                                    background: '#e5e7eb',
                                    borderRadius: '12px',
                                    height: '12px',
                                    overflow: 'hidden'
                                }}>
                                    <div style={{
                                        background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                                        height: '12px',
                                        borderRadius: '12px',
                                        width: `${estadisticas.progresoGeneral}%`,
                                        transition: 'width 0.8s ease'
                                    }}></div>
                                </div>
                            </div>
                            <div style={{ fontSize: '48px', marginLeft: '16px' }}>🏆</div>
                        </div>
                    </div>

                    <div style={{
                        background: 'linear-gradient(135deg, #ffffff 0%, #fef3c7 100%)',
                        borderRadius: '20px',
                        padding: '24px',
                        borderLeft: '6px solid #f97316',
                        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
                        transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = '0 20px 40px rgba(249, 115, 22, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.1)';
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ flex: 1 }}>
                                <h3 style={{
                                    fontSize: '12px',
                                    fontWeight: 'bold',
                                    color: '#374151',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    marginBottom: '8px'
                                }}>
                                    Cursos Completados
                                </h3>
                                <div style={{
                                    fontSize: '36px',
                                    fontWeight: '900',
                                    color: '#f97316',
                                    marginBottom: '4px'
                                }}>
                                    {estadisticas.cursosCompletados}
                                </div>
                                <div style={{
                                    fontSize: '14px',
                                    color: '#6b7280',
                                    fontWeight: '500'
                                }}>
                                    {estadisticas.cursosEnProgreso} en progreso
                                </div>
                            </div>
                            <div style={{ fontSize: '48px', marginLeft: '16px' }}>✅</div>
                        </div>
                    </div>

                    <div style={{
                        background: 'linear-gradient(135deg, #ffffff 0%, #ede9fe 100%)',
                        borderRadius: '20px',
                        padding: '24px',
                        borderLeft: '6px solid #8b5cf6',
                        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
                        transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = '0 20px 40px rgba(139, 92, 246, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.1)';
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ flex: 1 }}>
                                <h3 style={{
                                    fontSize: '12px',
                                    fontWeight: 'bold',
                                    color: '#374151',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    marginBottom: '8px'
                                }}>
                                    Horas de Estudio
                                </h3>
                                <div style={{
                                    fontSize: '36px',
                                    fontWeight: '900',
                                    color: '#8b5cf6',
                                    marginBottom: '4px'
                                }}>
                                    {estadisticas.horasEstudio}
                                </div>
                                <div style={{
                                    fontSize: '14px',
                                    color: '#6b7280',
                                    fontWeight: '500'
                                }}>
                                    {estadisticas.certificados} certificados
                                </div>
                            </div>
                            <div style={{ fontSize: '48px', marginLeft: '16px' }}>⏱️</div>
                        </div>
                    </div>
                </div>

                {/* 📈 Cursos en Progreso */}
                <div style={{
                    background: 'linear-gradient(135deg, #ffffff 0%, #fef3c7 100%)',
                    borderRadius: '20px',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
                    marginBottom: '32px',
                    borderLeft: '6px solid #f97316'
                }}>
                    <div style={{
                        background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                        padding: '20px 24px',
                        borderTopLeftRadius: '20px',
                        borderTopRightRadius: '20px'
                    }}>
                        <h2 style={{
                            fontSize: '24px',
                            fontWeight: 'bold',
                            color: 'white',
                            margin: 0,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            📈 Cursos en Progreso
                        </h2>
                    </div>
                    <div style={{ padding: '24px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            {cursosEnProgreso.map(curso => (
                                <div 
                                    key={curso.id} 
                                    style={{
                                        background: 'linear-gradient(135deg, #ffffff 0%, #fef3c7 100%)',
                                        borderRadius: '16px',
                                        padding: '24px',
                                        border: '2px solid #fed7aa',
                                        transition: 'all 0.3s ease',
                                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-4px)';
                                        e.currentTarget.style.boxShadow = '0 15px 35px rgba(249, 115, 22, 0.15)';
                                        e.currentTarget.style.borderColor = '#f97316';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.05)';
                                        e.currentTarget.style.borderColor = '#fed7aa';
                                    }}
                                >
                                    <div style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '16px'
                                    }}>
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'flex-start',
                                            flexWrap: 'wrap',
                                            gap: '16px'
                                        }}>
                                            <div style={{ flex: 1, minWidth: '250px' }}>
                                                <h3 style={{
                                                    fontSize: '20px',
                                                    fontWeight: 'bold',
                                                    color: '#1f2937',
                                                    marginBottom: '8px'
                                                }}>
                                                    {curso.titulo}
                                                </h3>
                                                <span style={{
                                                    display: 'inline-block',
                                                    background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                                                    color: 'white',
                                                    padding: '6px 16px',
                                                    borderRadius: '20px',
                                                    fontSize: '12px',
                                                    fontWeight: 'bold',
                                                    marginBottom: '8px'
                                                }}>
                                                    {curso.categoria}
                                                </span>
                                                <div style={{
                                                    fontSize: '14px',
                                                    color: '#6b7280',
                                                    fontWeight: '500'
                                                }}>
                                                    Última actividad: {new Date(curso.ultimaActividad).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{
                                                    fontSize: '32px',
                                                    fontWeight: 'bold',
                                                    color: '#f97316',
                                                    marginBottom: '4px'
                                                }}>
                                                    {curso.progreso}%
                                                </div>
                                                <div style={{
                                                    fontSize: '14px',
                                                    color: '#6b7280',
                                                    fontWeight: '500'
                                                }}>
                                                    {curso.horasCompletadas}/{curso.horasTotales} horas
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* 📊 Barra de progreso */}
                                        <div style={{
                                            width: '100%',
                                            background: '#e5e7eb',
                                            borderRadius: '12px',
                                            height: '16px',
                                            overflow: 'hidden'
                                        }}>
                                            <div style={{
                                                background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                                                height: '16px',
                                                borderRadius: '12px',
                                                width: `${curso.progreso}%`,
                                                transition: 'width 0.8s ease'
                                            }}></div>
                                        </div>
                                        
                                        {/* 📚 Módulos */}
                                        <div style={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                            gap: '8px'
                                        }}>
                                            {curso.modulos.map((modulo, index) => (
                                                <div 
                                                    key={index}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px',
                                                        padding: '8px 12px',
                                                        borderRadius: '12px',
                                                        fontSize: '14px',
                                                        fontWeight: '500',
                                                        ...(modulo.completado 
                                                            ? {
                                                                background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
                                                                color: '#166534',
                                                                border: '1px solid #86efac'
                                                            }
                                                            : {
                                                                background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
                                                                color: '#374151',
                                                                border: '1px solid #d1d5db'
                                                            })
                                                    }}
                                                >
                                                    <span>{modulo.completado ? '✅' : '⏳'}</span>
                                                    <span>{modulo.nombre}</span>
                                                </div>
                                            ))}
                                        </div>
                                        
                                        <button
                                            onClick={() => continuarCurso(curso.id)}
                                            style={{
                                                background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '12px',
                                                padding: '12px 24px',
                                                fontWeight: 'bold',
                                                cursor: 'pointer',
                                                transition: 'all 0.3s ease',
                                                boxShadow: '0 4px 12px rgba(249, 115, 22, 0.3)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                width: 'fit-content'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.target.style.transform = 'translateY(-2px)';
                                                e.target.style.boxShadow = '0 8px 20px rgba(249, 115, 22, 0.4)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.target.style.transform = 'translateY(0)';
                                                e.target.style.boxShadow = '0 4px 12px rgba(249, 115, 22, 0.3)';
                                            }}
                                        >
                                            🎯 Continuar Curso
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ✅ Cursos Completados */}
                <div style={{
                    background: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)',
                    borderRadius: '20px',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
                    marginBottom: '32px',
                    borderLeft: '6px solid #22c55e'
                }}>
                    <div style={{
                        background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                        padding: '20px 24px',
                        borderTopLeftRadius: '20px',
                        borderTopRightRadius: '20px'
                    }}>
                        <h2 style={{
                            fontSize: '24px',
                            fontWeight: 'bold',
                            color: 'white',
                            margin: 0,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            ✅ Cursos Completados
                        </h2>
                    </div>
                    <div style={{ padding: '24px' }}>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                            gap: '24px'
                        }}>
                            {cursosCompletados.map(curso => (
                                <div 
                                    key={curso.id} 
                                    style={{
                                        background: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)',
                                        borderRadius: '16px',
                                        padding: '24px',
                                        border: '2px solid #bbf7d0',
                                        transition: 'all 0.3s ease',
                                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-4px)';
                                        e.currentTarget.style.boxShadow = '0 15px 35px rgba(34, 197, 94, 0.15)';
                                        e.currentTarget.style.borderColor = '#22c55e';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.05)';
                                        e.currentTarget.style.borderColor = '#bbf7d0';
                                    }}
                                >
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'flex-start',
                                        marginBottom: '16px'
                                    }}>
                                        <div style={{ flex: 1 }}>
                                            <h3 style={{
                                                fontSize: '18px',
                                                fontWeight: 'bold',
                                                color: '#1f2937',
                                                marginBottom: '8px'
                                            }}>
                                                {curso.titulo}
                                            </h3>
                                            <span style={{
                                                display: 'inline-block',
                                                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                                                color: 'white',
                                                padding: '6px 16px',
                                                borderRadius: '20px',
                                                fontSize: '12px',
                                                fontWeight: 'bold'
                                            }}>
                                                {curso.categoria}
                                            </span>
                                        </div>
                                        {curso.certificado && (
                                            <div style={{
                                                fontSize: '32px',
                                                marginLeft: '16px',
                                                animation: 'pulse 2s infinite'
                                            }}>
                                                🏆
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '8px',
                                        marginBottom: '16px'
                                    }}>
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            fontSize: '14px'
                                        }}>
                                            <span style={{ color: '#6b7280', fontWeight: '500' }}>Completado:</span>
                                            <span style={{ fontWeight: 'bold', color: '#1f2937' }}>
                                                {new Date(curso.fechaCompletado).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            fontSize: '14px'
                                        }}>
                                            <span style={{ color: '#6b7280', fontWeight: '500' }}>Calificación:</span>
                                            <span style={{ fontWeight: 'bold', color: '#22c55e' }}>{curso.calificacion}%</span>
                                        </div>
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            fontSize: '14px'
                                        }}>
                                            <span style={{ color: '#6b7280', fontWeight: '500' }}>Duración:</span>
                                            <span style={{ fontWeight: 'bold', color: '#1f2937' }}>{curso.horas} horas</span>
                                        </div>
                                    </div>
                                    
                                    {curso.certificado && (
                                        <button
                                            onClick={() => descargarCertificado(curso.id)}
                                            style={{
                                                width: '100%',
                                                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '12px',
                                                padding: '12px 16px',
                                                fontWeight: 'bold',
                                                cursor: 'pointer',
                                                transition: 'all 0.3s ease',
                                                boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '8px'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.target.style.transform = 'translateY(-2px)';
                                                e.target.style.boxShadow = '0 8px 20px rgba(34, 197, 94, 0.4)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.target.style.transform = 'translateY(0)';
                                                e.target.style.boxShadow = '0 4px 12px rgba(34, 197, 94, 0.3)';
                                            }}
                                        >
                                            📄 Descargar Certificado
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 🏆 Certificados */}
                <div style={{
                    background: 'linear-gradient(135deg, #ffffff 0%, #fffbeb 100%)',
                    borderRadius: '20px',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
                    borderLeft: '6px solid #eab308'
                }}>
                    <div style={{
                        background: 'linear-gradient(135deg, #eab308 0%, #d97706 100%)',
                        padding: '20px 24px',
                        borderTopLeftRadius: '20px',
                        borderTopRightRadius: '20px'
                    }}>
                        <h2 style={{
                            fontSize: '24px',
                            fontWeight: 'bold',
                            color: 'white',
                            margin: 0,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            🏆 Mis Certificados
                        </h2>
                    </div>
                    <div style={{ padding: '24px' }}>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                            gap: '24px'
                        }}>
                            {certificados.map(certificado => (
                                <div 
                                    key={certificado.id} 
                                    style={{
                                        background: 'linear-gradient(135deg, #ffffff 0%, #fffbeb 100%)',
                                        borderRadius: '16px',
                                        padding: '24px',
                                        border: '2px solid #fde68a',
                                        transition: 'all 0.3s ease',
                                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-4px)';
                                        e.currentTarget.style.boxShadow = '0 15px 35px rgba(234, 179, 8, 0.15)';
                                        e.currentTarget.style.borderColor = '#eab308';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.05)';
                                        e.currentTarget.style.borderColor = '#fde68a';
                                    }}
                                >
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        justifyContent: 'space-between',
                                        marginBottom: '16px'
                                    }}>
                                        <div style={{ flex: 1 }}>
                                            <h3 style={{
                                                fontSize: '18px',
                                                fontWeight: 'bold',
                                                color: '#1f2937',
                                                marginBottom: '8px'
                                            }}>
                                                {certificado.titulo}
                                            </h3>
                                            <div style={{
                                                fontSize: '14px',
                                                color: '#6b7280',
                                                fontWeight: '500'
                                            }}>
                                                {certificado.institucion}
                                            </div>
                                        </div>
                                        <div style={{
                                            fontSize: '40px',
                                            marginLeft: '16px',
                                            animation: 'pulse 2s infinite'
                                        }}>
                                            🏆
                                        </div>
                                    </div>
                                    
                                    <div style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '8px',
                                        marginBottom: '16px'
                                    }}>
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            fontSize: '14px'
                                        }}>
                                            <span style={{ color: '#6b7280', fontWeight: '500' }}>Emitido:</span>
                                            <span style={{ fontWeight: 'bold', color: '#1f2937' }}>
                                                {new Date(certificado.fechaEmision).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            fontSize: '14px'
                                        }}>
                                            <span style={{ color: '#6b7280', fontWeight: '500' }}>Válido hasta:</span>
                                            <span style={{ fontWeight: 'bold', color: '#22c55e' }}>
                                                {new Date(certificado.validez).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <button
                                        onClick={() => descargarCertificado(certificado.id)}
                                        style={{
                                            width: '100%',
                                            background: 'linear-gradient(135deg, #eab308 0%, #d97706 100%)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '12px',
                                            padding: '12px 16px',
                                            fontWeight: 'bold',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease',
                                            boxShadow: '0 4px 12px rgba(234, 179, 8, 0.3)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.target.style.transform = 'translateY(-2px)';
                                            e.target.style.boxShadow = '0 8px 20px rgba(234, 179, 8, 0.4)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.transform = 'translateY(0)';
                                            e.target.style.boxShadow = '0 4px 12px rgba(234, 179, 8, 0.3)';
                                        }}
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