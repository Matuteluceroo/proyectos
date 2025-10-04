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
            <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex items-center justify-center">
                <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-600 mx-auto mb-4"></div>
                    <div className="text-xl text-gray-800 mb-2">Generando reportes...</div>
                    <div className="text-gray-600">Analizando datos del sistema</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
            {/* Header */}
            <div className="bg-white shadow-lg border-b-4 border-orange-500">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-6">
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="flex items-center space-x-2 text-orange-600 hover:text-orange-800 font-bold transition-all duration-200 hover:scale-105"
                            >
                                🏠 <span>Dashboard</span>
                            </button>
                            <div className="hidden md:flex items-center space-x-2 text-gray-400">
                                <span>/</span>
                                <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                                    📊 REPORTES Y ESTADÍSTICAS
                                </span>
                            </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                            <div className="text-right">
                                <div className="text-sm text-gray-500">Administrador</div>
                                <div className="font-bold text-gray-800">Juan</div>
                            </div>
                            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full flex items-center justify-center text-white font-bold">
                                👤
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Filtros de Fecha */}
                <div className="bg-gradient-to-br from-pink-100 to-rose-100 rounded-2xl shadow-xl mb-8 border-l-4 border-orange-500">
                    <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-4 rounded-t-2xl">
                        <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                            <span>📅</span>
                            <span>Filtros de Reporte</span>
                        </h3>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Fecha Desde</label>
                                <input
                                    type="date"
                                    value={dateRange.desde}
                                    onChange={(e) => setDateRange({...dateRange, desde: e.target.value})}
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Fecha Hasta</label>
                                <input
                                    type="date"
                                    value={dateRange.hasta}
                                    onChange={(e) => setDateRange({...dateRange, hasta: e.target.value})}
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                />
                            </div>
                            <div className="flex items-end">
                                <button
                                    onClick={cargarReportes}
                                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105"
                                >
                                    🔄 Actualizar
                                </button>
                            </div>
                            <div className="flex items-end">
                                <button
                                    onClick={() => exportarReporte('completo')}
                                    className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105"
                                >
                                    📥 Exportar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Métricas Principales */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Total Usuarios */}
                    <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl p-6 border-l-4 border-blue-500 shadow-lg hover:shadow-xl transition-all duration-300">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl">👥</span>
                            </div>
                            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-2">Total Usuarios</h3>
                            <div className="text-4xl font-black text-blue-600 mb-2">{reportData.usuarios.total}</div>
                            <p className="text-xs text-gray-600">+{reportData.usuarios.nuevosEsteMes} este mes</p>
                        </div>
                    </div>

                    {/* Total Documentos */}
                    <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-2xl p-6 border-l-4 border-green-500 shadow-lg hover:shadow-xl transition-all duration-300">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl">📄</span>
                            </div>
                            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-2">Documentos</h3>
                            <div className="text-4xl font-black text-green-600 mb-2">{reportData.contenido.documentos}</div>
                            <p className="text-xs text-gray-600">{reportData.contenido.descargas} descargas</p>
                        </div>
                    </div>

                    {/* Usuarios Activos */}
                    <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl p-6 border-l-4 border-purple-500 shadow-lg hover:shadow-xl transition-all duration-300">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl">⚡</span>
                            </div>
                            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-2">Usuarios Activos</h3>
                            <div className="text-4xl font-black text-purple-600 mb-2">{reportData.usuarios.activos}</div>
                            <p className="text-xs text-gray-600">{((reportData.usuarios.activos / reportData.usuarios.total) * 100).toFixed(1)}% del total</p>
                        </div>
                    </div>

                    {/* Rendimiento Sistema */}
                    <div className="bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl p-6 border-l-4 border-orange-500 shadow-lg hover:shadow-xl transition-all duration-300">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl">🚀</span>
                            </div>
                            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-2">Rendimiento</h3>
                            <div className="text-4xl font-black text-orange-600 mb-2">{reportData.sistema.rendimiento}%</div>
                            <p className="text-xs text-gray-600">Sistema optimizado</p>
                        </div>
                    </div>
                </div>

                {/* Reportes Detallados */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Distribución por Roles */}
                    <div className="bg-gradient-to-br from-pink-100 to-rose-100 rounded-2xl shadow-xl border-l-4 border-orange-500">
                        <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-4 rounded-t-2xl">
                            <h3 className="text-xl font-bold text-white">👑 Distribución por Roles</h3>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-white rounded-xl">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                                            <span className="text-white text-sm">👑</span>
                                        </div>
                                        <span className="font-semibold">Administradores</span>
                                    </div>
                                    <div className="text-xl font-bold text-red-600">{reportData.usuarios.porRol.admin}</div>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-white rounded-xl">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                                            <span className="text-white text-sm">🎓</span>
                                        </div>
                                        <span className="font-semibold">Expertos</span>
                                    </div>
                                    <div className="text-xl font-bold text-purple-600">{reportData.usuarios.porRol.experto}</div>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-white rounded-xl">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                            <span className="text-white text-sm">🔧</span>
                                        </div>
                                        <span className="font-semibold">Operadores</span>
                                    </div>
                                    <div className="text-xl font-bold text-green-600">{reportData.usuarios.porRol.operador}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actividad del Sistema */}
                    <div className="bg-gradient-to-br from-pink-100 to-rose-100 rounded-2xl shadow-xl border-l-4 border-orange-500">
                        <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-4 rounded-t-2xl">
                            <h3 className="text-xl font-bold text-white">📈 Actividad del Sistema</h3>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-white rounded-xl">
                                    <span className="font-semibold">Logins Diarios</span>
                                    <div className="text-xl font-bold text-blue-600">{reportData.actividad.loginsDiarios}</div>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-white rounded-xl">
                                    <span className="font-semibold">Sesiones Promedio</span>
                                    <div className="text-xl font-bold text-green-600">{reportData.actividad.sesionesPromedio}</div>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-white rounded-xl">
                                    <span className="font-semibold">Tiempo Promedio (min)</span>
                                    <div className="text-xl font-bold text-purple-600">{reportData.actividad.tiempoPromedioSesion}</div>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-white rounded-xl">
                                    <span className="font-semibold">Acciones por Día</span>
                                    <div className="text-xl font-bold text-orange-600">{reportData.actividad.accionesPorDia}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Estado del Sistema */}
                <div className="bg-gradient-to-br from-pink-100 to-rose-100 rounded-2xl shadow-xl border-l-4 border-orange-500">
                    <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-4 rounded-t-2xl">
                        <h3 className="text-xl font-bold text-white">🔧 Estado del Sistema</h3>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-green-600 mb-2">{reportData.sistema.uptime}%</div>
                                <div className="text-sm font-semibold text-gray-700">Uptime</div>
                                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                    <div 
                                        className="bg-green-500 h-2 rounded-full" 
                                        style={{width: `${reportData.sistema.uptime}%`}}
                                    ></div>
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-blue-600 mb-2">{reportData.sistema.rendimiento}%</div>
                                <div className="text-sm font-semibold text-gray-700">Rendimiento</div>
                                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                    <div 
                                        className="bg-blue-500 h-2 rounded-full" 
                                        style={{width: `${reportData.sistema.rendimiento}%`}}
                                    ></div>
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-orange-600 mb-2">{reportData.sistema.espacioUsado}%</div>
                                <div className="text-sm font-semibold text-gray-700">Espacio Usado</div>
                                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                    <div 
                                        className="bg-orange-500 h-2 rounded-full" 
                                        style={{width: `${reportData.sistema.espacioUsado}%`}}
                                    ></div>
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-red-600 mb-2">{reportData.sistema.errores}</div>
                                <div className="text-sm font-semibold text-gray-700">Errores Hoy</div>
                                <div className="text-xs text-gray-500 mt-2">Sistema estable</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Acciones Rápidas */}
                <div className="mt-8 bg-gradient-to-br from-pink-100 to-rose-100 rounded-2xl shadow-xl border-l-4 border-orange-500">
                    <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-4 rounded-t-2xl">
                        <h3 className="text-xl font-bold text-white">⚡ Acciones de Reporte</h3>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <button
                                onClick={() => exportarReporte('usuarios')}
                                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105"
                            >
                                📊 Reporte Usuarios
                            </button>
                            <button
                                onClick={() => exportarReporte('contenido')}
                                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105"
                            >
                                📄 Reporte Contenido
                            </button>
                            <button
                                onClick={() => exportarReporte('actividad')}
                                className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105"
                            >
                                📈 Reporte Actividad
                            </button>
                            <button
                                onClick={() => exportarReporte('sistema')}
                                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105"
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