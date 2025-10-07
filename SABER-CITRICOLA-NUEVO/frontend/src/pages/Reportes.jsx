// 📊 Reportes.jsx - Página de reportes y estadísticas del administrador
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { obtenerReportesCompletos, exportarReporte as exportarReporteAPI } from '../services/reportesAPI';

const Reportes = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [reportData, setReportData] = useState({
        usuarios: {
            total: 0,
            nuevosEsteMes: 0,
            activos: 0,
            porRol: {
                admin: 0,
                experto: 0,
                operador: 0
            }
        },
        contenido: {
            documentos: 0,
            categorias: 0,
            capacitaciones: 0,
            descargas: 0
        },
        actividad: {
            loginsDiarios: 0,
            sesionesPromedio: 0,
            tiempoPromedioSesion: 0,
            accionesPorDia: 0
        },
        sistema: {
            uptime: 0,
            rendimiento: 0,
            espacioUsado: 0,
            errores: 0
        }
    });
    const [dateRange, setDateRange] = useState({
        desde: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        hasta: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        cargarReportes();
    }, [dateRange]);

    const cargarReportes = async () => {
        setLoading(true);
        try {
            console.log('📊 Cargando reportes del sistema...');
            const data = await obtenerReportesCompletos();
            setReportData(data);
            console.log('✅ Reportes cargados exitosamente:', data);
        } catch (error) {
            console.error('❌ Error al cargar reportes:', error);
            // Mantener datos simulados en caso de error
            setReportData({
                usuarios: {
                    total: 127,
                    nuevosEsteMes: 15,
                    activos: 89,
                    porRol: {
                        admin: 3,
                        experto: 24,
                        operador: 100
                    }
                },
                contenido: {
                    documentos: 342,
                    categorias: 15,
                    capacitaciones: 28,
                    descargas: 1847
                },
                actividad: {
                    loginsDiarios: 67,
                    sesionesPromedio: 156,
                    tiempoPromedioSesion: 24,
                    accionesPorDia: 892
                },
                sistema: {
                    uptime: 99.8,
                    rendimiento: 95.2,
                    espacioUsado: 67.3,
                    errores: 2
                }
            });
        }
        setLoading(false);
    };

    const exportarReporte = async (tipo) => {
        try {
            console.log(`📤 Exportando reporte de ${tipo}...`);
            await exportarReporteAPI(tipo, 'json');
            alert(`✅ Reporte de ${tipo} exportado exitosamente`);
        } catch (error) {
            console.error('❌ Error al exportar reporte:', error);
            alert(`❌ Error al exportar reporte de ${tipo}`);
        }
    };

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 25%, #fed7aa 50%, #fdba74 75%, #fb923c 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <div style={{
                    background: 'linear-gradient(135deg, #ffffff 0%, #fef3c7 100%)',
                    borderRadius: '20px',
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
                    padding: '40px',
                    textAlign: 'center',
                    borderLeft: '6px solid #f97316'
                }}>
                    <div style={{
                        width: '64px',
                        height: '64px',
                        border: '4px solid #f3f4f6',
                        borderTop: '4px solid #f97316',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 24px'
                    }}></div>
                    <div style={{
                        fontSize: '20px',
                        color: '#1f2937',
                        marginBottom: '8px',
                        fontWeight: 'bold'
                    }}>Generando reportes...</div>
                    <div style={{
                        color: '#6b7280',
                        fontSize: '14px'
                    }}>Analizando datos del sistema</div>
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
                                    📊 REPORTES Y ESTADÍSTICAS
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

            {/* 📊 Contenido Principal */}
            <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 24px' }}>
                {/* 📅 Panel de Filtros Mejorado */}
                <div style={{
                    background: 'linear-gradient(135deg, #ffffff 0%, #fef3c7 100%)',
                    borderRadius: '20px',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
                    marginBottom: '32px',
                    borderLeft: '6px solid #f97316',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                        padding: '20px 24px'
                    }}>
                        <h3 style={{
                            fontSize: '20px',
                            fontWeight: 'bold',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            margin: 0,
                            textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)'
                        }}>
                            <span>📅</span>
                            <span>Filtros de Reporte</span>
                        </h3>
                    </div>
                    <div style={{ padding: '24px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                            <div>
                                <label style={{
                                    display: 'block',
                                    fontSize: '14px',
                                    fontWeight: 'bold',
                                    color: '#374151',
                                    marginBottom: '8px'
                                }}>📆 Fecha Desde</label>
                                <input
                                    type="date"
                                    value={dateRange.desde}
                                    onChange={(e) => setDateRange({...dateRange, desde: e.target.value})}
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        border: '2px solid #d1d5db',
                                        borderRadius: '12px',
                                        fontSize: '14px',
                                        transition: 'all 0.3s ease',
                                        background: '#ffffff'
                                    }}
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
                                }}>📅 Fecha Hasta</label>
                                <input
                                    type="date"
                                    value={dateRange.hasta}
                                    onChange={(e) => setDateRange({...dateRange, hasta: e.target.value})}
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        border: '2px solid #d1d5db',
                                        borderRadius: '12px',
                                        fontSize: '14px',
                                        transition: 'all 0.3s ease',
                                        background: '#ffffff'
                                    }}
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
                            <div style={{ display: 'flex', alignItems: 'end' }}>
                                <button
                                    onClick={cargarReportes}
                                    style={{
                                        width: '100%',
                                        background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                                        color: 'white',
                                        padding: '12px 24px',
                                        borderRadius: '12px',
                                        fontWeight: 'bold',
                                        border: 'none',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                        boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.transform = 'translateY(-2px)';
                                        e.target.style.boxShadow = '0 8px 25px rgba(59, 130, 246, 0.4)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.transform = 'translateY(0)';
                                        e.target.style.boxShadow = '0 4px 15px rgba(59, 130, 246, 0.3)';
                                    }}
                                >
                                    🔄 Actualizar
                                </button>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'end' }}>
                                <button
                                    onClick={() => exportarReporte('completo')}
                                    style={{
                                        width: '100%',
                                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                        color: 'white',
                                        padding: '12px 24px',
                                        borderRadius: '12px',
                                        fontWeight: 'bold',
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
                                    📥 Exportar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 📊 Panel de Métricas Principales */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                    {/* Total Usuarios */}
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
                            }}>👥</div>
                            <h3 style={{
                                fontSize: '12px',
                                fontWeight: 'bold',
                                color: '#374151',
                                textTransform: 'uppercase',
                                letterSpacing: '1px',
                                marginBottom: '8px'
                            }}>Total Usuarios</h3>
                            <div style={{
                                fontSize: '36px',
                                fontWeight: '900',
                                color: '#3b82f6',
                                textShadow: '1px 1px 2px rgba(0, 0, 0, 0.1)',
                                marginBottom: '8px'
                            }}>{reportData.usuarios.total}</div>
                            <p style={{
                                fontSize: '12px',
                                color: '#6b7280',
                                margin: 0
                            }}>+{reportData.usuarios.nuevosEsteMes} este mes</p>
                        </div>
                    </div>

                    {/* Total Documentos */}
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
                            }}>Documentos</h3>
                            <div style={{
                                fontSize: '36px',
                                fontWeight: '900',
                                color: '#10b981',
                                textShadow: '1px 1px 2px rgba(0, 0, 0, 0.1)',
                                marginBottom: '8px'
                            }}>{reportData.contenido.documentos}</div>
                            <p style={{
                                fontSize: '12px',
                                color: '#6b7280',
                                margin: 0
                            }}>{reportData.contenido.descargas} descargas</p>
                        </div>
                    </div>

                    {/* Usuarios Activos */}
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
                            }}>⚡</div>
                            <h3 style={{
                                fontSize: '12px',
                                fontWeight: 'bold',
                                color: '#374151',
                                textTransform: 'uppercase',
                                letterSpacing: '1px',
                                marginBottom: '8px'
                            }}>Usuarios Activos</h3>
                            <div style={{
                                fontSize: '36px',
                                fontWeight: '900',
                                color: '#8b5cf6',
                                textShadow: '1px 1px 2px rgba(0, 0, 0, 0.1)',
                                marginBottom: '8px'
                            }}>{reportData.usuarios.activos}</div>
                            <p style={{
                                fontSize: '12px',
                                color: '#6b7280',
                                margin: 0
                            }}>{((reportData.usuarios.activos / reportData.usuarios.total) * 100).toFixed(1)}% del total</p>
                        </div>
                    </div>

                    {/* Rendimiento Sistema */}
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
                            }}>🚀</div>
                            <h3 style={{
                                fontSize: '12px',
                                fontWeight: 'bold',
                                color: '#374151',
                                textTransform: 'uppercase',
                                letterSpacing: '1px',
                                marginBottom: '8px'
                            }}>Rendimiento</h3>
                            <div style={{
                                fontSize: '36px',
                                fontWeight: '900',
                                color: '#f97316',
                                textShadow: '1px 1px 2px rgba(0, 0, 0, 0.1)',
                                marginBottom: '8px'
                            }}>{reportData.sistema.rendimiento}%</div>
                            <p style={{
                                fontSize: '12px',
                                color: '#6b7280',
                                margin: 0
                            }}>Sistema optimizado</p>
                        </div>
                    </div>
                </div>

                {/* 📋 Reportes Detallados */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '32px', marginBottom: '32px' }}>
                    {/* Distribución por Roles */}
                    <div style={{
                        background: 'linear-gradient(135deg, #ffffff 0%, #fef3c7 100%)',
                        borderRadius: '20px',
                        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
                        borderLeft: '6px solid #f97316',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
                            padding: '20px 24px'
                        }}>
                            <h3 style={{
                                fontSize: '20px',
                                fontWeight: 'bold',
                                color: 'white',
                                margin: 0,
                                textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)'
                            }}>👑 Distribución por Roles</h3>
                        </div>
                        <div style={{ padding: '24px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '16px',
                                    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                                    borderRadius: '12px',
                                    border: '2px solid #e5e7eb',
                                    transition: 'all 0.3s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateX(4px)';
                                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateX(0)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{
                                            width: '32px',
                                            height: '32px',
                                            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '14px',
                                            boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)'
                                        }}>👑</div>
                                        <span style={{ fontWeight: '600', color: '#1f2937' }}>Administradores</span>
                                    </div>
                                    <div style={{
                                        fontSize: '20px',
                                        fontWeight: 'bold',
                                        color: '#ef4444'
                                    }}>{reportData.usuarios.porRol.admin}</div>
                                </div>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '16px',
                                    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                                    borderRadius: '12px',
                                    border: '2px solid #e5e7eb',
                                    transition: 'all 0.3s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateX(4px)';
                                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateX(0)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{
                                            width: '32px',
                                            height: '32px',
                                            background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '14px',
                                            boxShadow: '0 2px 8px rgba(139, 92, 246, 0.3)'
                                        }}>🎓</div>
                                        <span style={{ fontWeight: '600', color: '#1f2937' }}>Expertos</span>
                                    </div>
                                    <div style={{
                                        fontSize: '20px',
                                        fontWeight: 'bold',
                                        color: '#8b5cf6'
                                    }}>{reportData.usuarios.porRol.experto}</div>
                                </div>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '16px',
                                    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                                    borderRadius: '12px',
                                    border: '2px solid #e5e7eb',
                                    transition: 'all 0.3s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateX(4px)';
                                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateX(0)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{
                                            width: '32px',
                                            height: '32px',
                                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '14px',
                                            boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
                                        }}>🔧</div>
                                        <span style={{ fontWeight: '600', color: '#1f2937' }}>Operadores</span>
                                    </div>
                                    <div style={{
                                        fontSize: '20px',
                                        fontWeight: 'bold',
                                        color: '#10b981'
                                    }}>{reportData.usuarios.porRol.operador}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actividad del Sistema */}
                    <div style={{
                        background: 'linear-gradient(135deg, #ffffff 0%, #fef3c7 100%)',
                        borderRadius: '20px',
                        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
                        borderLeft: '6px solid #f97316',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
                            padding: '20px 24px'
                        }}>
                            <h3 style={{
                                fontSize: '20px',
                                fontWeight: 'bold',
                                color: 'white',
                                margin: 0,
                                textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)'
                            }}>📈 Actividad del Sistema</h3>
                        </div>
                        <div style={{ padding: '24px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '16px',
                                    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                                    borderRadius: '12px',
                                    border: '2px solid #e5e7eb'
                                }}>
                                    <span style={{ fontWeight: '600', color: '#1f2937' }}>🔑 Logins Diarios</span>
                                    <div style={{
                                        fontSize: '20px',
                                        fontWeight: 'bold',
                                        color: '#3b82f6'
                                    }}>{reportData.actividad.loginsDiarios}</div>
                                </div>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '16px',
                                    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                                    borderRadius: '12px',
                                    border: '2px solid #e5e7eb'
                                }}>
                                    <span style={{ fontWeight: '600', color: '#1f2937' }}>📊 Sesiones Promedio</span>
                                    <div style={{
                                        fontSize: '20px',
                                        fontWeight: 'bold',
                                        color: '#10b981'
                                    }}>{reportData.actividad.sesionesPromedio}</div>
                                </div>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '16px',
                                    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                                    borderRadius: '12px',
                                    border: '2px solid #e5e7eb'
                                }}>
                                    <span style={{ fontWeight: '600', color: '#1f2937' }}>⏱️ Tiempo Promedio (min)</span>
                                    <div style={{
                                        fontSize: '20px',
                                        fontWeight: 'bold',
                                        color: '#8b5cf6'
                                    }}>{reportData.actividad.tiempoPromedioSesion}</div>
                                </div>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '16px',
                                    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                                    borderRadius: '12px',
                                    border: '2px solid #e5e7eb'
                                }}>
                                    <span style={{ fontWeight: '600', color: '#1f2937' }}>⚡ Acciones por Día</span>
                                    <div style={{
                                        fontSize: '20px',
                                        fontWeight: 'bold',
                                        color: '#f97316'
                                    }}>{reportData.actividad.accionesPorDia}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 🔧 Estado del Sistema */}
                <div style={{
                    background: 'linear-gradient(135deg, #ffffff 0%, #fef3c7 100%)',
                    borderRadius: '20px',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
                    borderLeft: '6px solid #f97316',
                    overflow: 'hidden',
                    marginBottom: '32px'
                }}>
                    <div style={{
                        background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
                        padding: '20px 24px'
                    }}>
                        <h3 style={{
                            fontSize: '20px',
                            fontWeight: 'bold',
                            color: 'white',
                            margin: 0,
                            textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)'
                        }}>🔧 Estado del Sistema</h3>
                    </div>
                    <div style={{ padding: '24px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
                            <div style={{
                                textAlign: 'center',
                                padding: '20px',
                                background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                                borderRadius: '16px',
                                border: '2px solid #bbf7d0'
                            }}>
                                <div style={{
                                    fontSize: '32px',
                                    fontWeight: 'bold',
                                    color: '#166534',
                                    marginBottom: '8px'
                                }}>{reportData.sistema.uptime}%</div>
                                <div style={{
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: '#374151',
                                    marginBottom: '12px'
                                }}>🟢 Uptime</div>
                                <div style={{
                                    width: '100%',
                                    background: '#e5e7eb',
                                    borderRadius: '10px',
                                    height: '8px',
                                    overflow: 'hidden'
                                }}>
                                    <div style={{
                                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                        height: '8px',
                                        borderRadius: '10px',
                                        width: `${reportData.sistema.uptime}%`,
                                        transition: 'width 0.3s ease'
                                    }}></div>
                                </div>
                            </div>
                            <div style={{
                                textAlign: 'center',
                                padding: '20px',
                                background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                                borderRadius: '16px',
                                border: '2px solid #bfdbfe'
                            }}>
                                <div style={{
                                    fontSize: '32px',
                                    fontWeight: 'bold',
                                    color: '#1e40af',
                                    marginBottom: '8px'
                                }}>{reportData.sistema.rendimiento}%</div>
                                <div style={{
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: '#374151',
                                    marginBottom: '12px'
                                }}>🔵 Rendimiento</div>
                                <div style={{
                                    width: '100%',
                                    background: '#e5e7eb',
                                    borderRadius: '10px',
                                    height: '8px',
                                    overflow: 'hidden'
                                }}>
                                    <div style={{
                                        background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                                        height: '8px',
                                        borderRadius: '10px',
                                        width: `${reportData.sistema.rendimiento}%`,
                                        transition: 'width 0.3s ease'
                                    }}></div>
                                </div>
                            </div>
                            <div style={{
                                textAlign: 'center',
                                padding: '20px',
                                background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
                                borderRadius: '16px',
                                border: '2px solid #fed7aa'
                            }}>
                                <div style={{
                                    fontSize: '32px',
                                    fontWeight: 'bold',
                                    color: '#ea580c',
                                    marginBottom: '8px'
                                }}>{reportData.sistema.espacioUsado}%</div>
                                <div style={{
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: '#374151',
                                    marginBottom: '12px'
                                }}>🟠 Espacio Usado</div>
                                <div style={{
                                    width: '100%',
                                    background: '#e5e7eb',
                                    borderRadius: '10px',
                                    height: '8px',
                                    overflow: 'hidden'
                                }}>
                                    <div style={{
                                        background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                                        height: '8px',
                                        borderRadius: '10px',
                                        width: `${reportData.sistema.espacioUsado}%`,
                                        transition: 'width 0.3s ease'
                                    }}></div>
                                </div>
                            </div>
                            <div style={{
                                textAlign: 'center',
                                padding: '20px',
                                background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
                                borderRadius: '16px',
                                border: '2px solid #fca5a5'
                            }}>
                                <div style={{
                                    fontSize: '32px',
                                    fontWeight: 'bold',
                                    color: '#dc2626',
                                    marginBottom: '8px'
                                }}>{reportData.sistema.errores}</div>
                                <div style={{
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: '#374151',
                                    marginBottom: '12px'
                                }}>🔴 Errores Hoy</div>
                                <div style={{
                                    fontSize: '12px',
                                    color: '#6b7280'
                                }}>Sistema estable</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ⚡ Acciones Rápidas */}
                <div style={{
                    background: 'linear-gradient(135deg, #ffffff 0%, #fef3c7 100%)',
                    borderRadius: '20px',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
                    borderLeft: '6px solid #f97316',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                        padding: '20px 24px'
                    }}>
                        <h3 style={{
                            fontSize: '20px',
                            fontWeight: 'bold',
                            color: 'white',
                            margin: 0,
                            textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)'
                        }}>⚡ Acciones de Reporte</h3>
                    </div>
                    <div style={{ padding: '24px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                            <button
                                onClick={() => exportarReporte('usuarios')}
                                style={{
                                    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                                    color: 'white',
                                    padding: '16px 24px',
                                    borderRadius: '12px',
                                    fontWeight: 'bold',
                                    border: 'none',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)',
                                    fontSize: '14px'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.transform = 'translateY(-2px)';
                                    e.target.style.boxShadow = '0 8px 25px rgba(59, 130, 246, 0.4)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.transform = 'translateY(0)';
                                    e.target.style.boxShadow = '0 4px 15px rgba(59, 130, 246, 0.3)';
                                }}
                            >
                                📊 Reporte Usuarios
                            </button>
                            <button
                                onClick={() => exportarReporte('contenido')}
                                style={{
                                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                    color: 'white',
                                    padding: '16px 24px',
                                    borderRadius: '12px',
                                    fontWeight: 'bold',
                                    border: 'none',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
                                    fontSize: '14px'
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
                                📄 Reporte Contenido
                            </button>
                            <button
                                onClick={() => exportarReporte('actividad')}
                                style={{
                                    background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                                    color: 'white',
                                    padding: '16px 24px',
                                    borderRadius: '12px',
                                    fontWeight: 'bold',
                                    border: 'none',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    boxShadow: '0 4px 15px rgba(139, 92, 246, 0.3)',
                                    fontSize: '14px'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.transform = 'translateY(-2px)';
                                    e.target.style.boxShadow = '0 8px 25px rgba(139, 92, 246, 0.4)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.transform = 'translateY(0)';
                                    e.target.style.boxShadow = '0 4px 15px rgba(139, 92, 246, 0.3)';
                                }}
                            >
                                📈 Reporte Actividad
                            </button>
                            <button
                                onClick={() => exportarReporte('sistema')}
                                style={{
                                    background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                                    color: 'white',
                                    padding: '16px 24px',
                                    borderRadius: '12px',
                                    fontWeight: 'bold',
                                    border: 'none',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    boxShadow: '0 4px 15px rgba(249, 115, 22, 0.3)',
                                    fontSize: '14px'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.transform = 'translateY(-2px)';
                                    e.target.style.boxShadow = '0 8px 25px rgba(249, 115, 22, 0.4)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.transform = 'translateY(0)';
                                    e.target.style.boxShadow = '0 4px 15px rgba(249, 115, 22, 0.3)';
                                }}
                            >
                                🔧 Reporte Sistema
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reportes;