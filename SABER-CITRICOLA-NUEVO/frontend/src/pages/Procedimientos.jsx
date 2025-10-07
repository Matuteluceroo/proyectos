// 📋 Procedimientos.jsx - Portal de procedimientos paso a paso para operadores
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  obtenerProcedimientos, 
  buscarProcedimientos,
  obtenerCategoriasProcedimientos,
  marcarPasoComoCompletado,
  obtenerProgresProcedimiento,
  guardarComentarioProcedimiento
} from '../services/procedimientosAPI';

const Procedimientos = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [procedimientos, setProcedimientos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');
  const [procedimientoSeleccionado, setProcedimientoSeleccionado] = useState(null);
  const [pasoActual, setPasoActual] = useState(0);
  const [pasosCompletados, setPasosCompletados] = useState(new Set());
  const [comentarios, setComentarios] = useState({});
  const [mensaje, setMensaje] = useState(null);

  // Manejar parámetros URL para búsqueda por voz
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const categoria = params.get('categoria');
    const query = params.get('q');
    
    if (categoria) {
      // Mapear categorías de voz a categorías reales
      const categoriaMap = {
        'poda': 'Poda y Manejo',
        'riego': 'Sistemas de Riego',
        'injertos': 'Técnicas de Injerto'
      };
      
      const categoriaReal = categoriaMap[categoria] || categoria;
      setCategoriaSeleccionada(categoriaReal);
      console.log(`🎤 Aplicando filtro de categoría desde voz: ${categoriaReal}`);
    }
    
    if (query) {
      setBusqueda(query);
      console.log(`🎤 Aplicando búsqueda desde voz: ${query}`);
    }
  }, [location]);

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    if (busqueda.length >= 2 || categoriaSeleccionada) {
      buscarProcedimiento();
    } else if (busqueda.length === 0 && !categoriaSeleccionada) {
      cargarProcedimientos();
    }
  }, [busqueda, categoriaSeleccionada]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      await Promise.all([
        cargarProcedimientos(),
        cargarCategorias()
      ]);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      mostrarMensaje('Error al cargar los datos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const cargarProcedimientos = async () => {
    try {
      const data = await obtenerProcedimientos();
      setProcedimientos(data);
    } catch (error) {
      console.error('Error al cargar procedimientos:', error);
    }
  };

  const cargarCategorias = async () => {
    try {
      const data = await obtenerCategoriasProcedimientos();
      setCategorias(data);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
    }
  };

  const buscarProcedimiento = async () => {
    try {
      setLoading(true);
      const data = await buscarProcedimientos({
        busqueda,
        categoria: categoriaSeleccionada
      });
      setProcedimientos(data);
    } catch (error) {
      console.error('Error en búsqueda:', error);
      mostrarMensaje('Error en la búsqueda', 'error');
    } finally {
      setLoading(false);
    }
  };

  const mostrarMensaje = (texto, tipo = 'success') => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje(null), 5000);
  };

  const seleccionarProcedimiento = async (procedimiento) => {
    setProcedimientoSeleccionado(procedimiento);
    setPasoActual(0);
    
    // Cargar progreso guardado
    try {
      const progreso = await obtenerProgresProcedimiento(procedimiento.id);
      if (progreso) {
        setPasosCompletados(new Set(progreso.pasosCompletados));
        setPasoActual(progreso.pasoActual || 0);
        setComentarios(progreso.comentarios || {});
      }
    } catch (error) {
      console.error('Error al cargar progreso:', error);
    }
  };

  const marcarPasoCompletado = async (indicePaso) => {
    const nuevosCompletados = new Set(pasosCompletados);
    
    if (nuevosCompletados.has(indicePaso)) {
      nuevosCompletados.delete(indicePaso);
    } else {
      nuevosCompletados.add(indicePaso);
    }
    
    setPasosCompletados(nuevosCompletados);
    
    try {
      await marcarPasoComoCompletado(procedimientoSeleccionado.id, indicePaso, nuevosCompletados.has(indicePaso));
    } catch (error) {
      console.error('Error al guardar progreso:', error);
    }
  };

  const siguientePaso = () => {
    if (pasoActual < procedimientoSeleccionado.pasos.length - 1) {
      setPasoActual(pasoActual + 1);
    }
  };

  const pasoAnterior = () => {
    if (pasoActual > 0) {
      setPasoActual(pasoActual - 1);
    }
  };

  const guardarComentario = async (indicePaso, comentario) => {
    const nuevosComentarios = { ...comentarios, [indicePaso]: comentario };
    setComentarios(nuevosComentarios);
    
    try {
      await guardarComentarioProcedimiento(procedimientoSeleccionado.id, indicePaso, comentario);
    } catch (error) {
      console.error('Error al guardar comentario:', error);
    }
  };

  const limpiarBusqueda = () => {
    setBusqueda('');
    setCategoriaSeleccionada('');
    setProcedimientoSeleccionado(null);
    cargarProcedimientos();
  };

  const categoriasPrincipales = [
    { id: 'mantenimiento', nombre: 'Mantenimiento', icono: '🔧', color: 'bg-blue-100 text-blue-800' },
    { id: 'siembra', nombre: 'Siembra', icono: '🌱', color: 'bg-green-100 text-green-800' },
    { id: 'tratamientos', nombre: 'Tratamientos', icono: '💊', color: 'bg-purple-100 text-purple-800' },
    { id: 'cosecha', nombre: 'Cosecha', icono: '🍊', color: 'bg-orange-100 text-orange-800' },
    { id: 'seguridad', nombre: 'Seguridad', icono: '🦺', color: 'bg-red-100 text-red-800' },
    { id: 'maquinaria', nombre: 'Maquinaria', icono: '🚜', color: 'bg-yellow-100 text-yellow-800' }
  ];

  const calcularProgreso = (procedimiento) => {
    if (!procedimiento || !procedimiento.pasos) return 0;
    const completados = procedimiento.pasos.filter((_, index) => pasosCompletados.has(index)).length;
    return Math.round((completados / procedimiento.pasos.length) * 100);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
      padding: '24px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* ✨ Header con estilo cítrico profesional */}
        <div style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #fef3c7 100%)',
          borderRadius: '20px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
          marginBottom: '24px',
          padding: '32px',
          borderLeft: '6px solid #f97316'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <button
                onClick={() => navigate('/dashboard')}
                style={{
                  padding: '12px 16px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 12px rgba(107, 114, 128, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 8px 20px rgba(107, 114, 128, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 12px rgba(107, 114, 128, 0.3)';
                }}
              >
                ← Volver
              </button>
              <div>
                <h1 style={{
                  fontSize: '32px',
                  fontWeight: 'bold',
                  background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  margin: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  📋 Procedimientos
                </h1>
                <p style={{
                  color: '#6b7280',
                  marginTop: '8px',
                  fontSize: '16px',
                  fontWeight: '500'
                }}>
                  Guías paso a paso detalladas
                </p>
              </div>
            </div>
            <div style={{
              background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
              color: 'white',
              padding: '12px 20px',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: 'bold',
              boxShadow: '0 4px 12px rgba(249, 115, 22, 0.3)'
            }}>
              {procedimientos.length} procedimientos disponibles
            </div>
          </div>
        </div>

        {/* 📢 Mensaje de estado con estilo cítrico */}
        {mensaje && (
          <div style={{
            marginBottom: '24px',
            padding: '16px 24px',
            borderRadius: '12px',
            fontWeight: '500',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            ...(mensaje.tipo === 'error' 
              ? { 
                  background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
                  border: '2px solid #fca5a5',
                  color: '#dc2626'
                }
              : { 
                  background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                  border: '2px solid #bbf7d0',
                  color: '#166534'
                })
          }}>
            {mensaje.texto}
          </div>
        )}

        {!procedimientoSeleccionado ? (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 2fr', 
            gap: '24px',
            '@media (max-width: 1024px)': {
              gridTemplateColumns: '1fr'
            }
          }}>
            {/* 🔍 Panel de búsqueda y filtros */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Búsqueda principal */}
              <div style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #fef3c7 100%)',
                borderRadius: '20px',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
                padding: '24px',
                borderLeft: '6px solid #f97316'
              }}>
                <h2 style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: '#1f2937',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  🔍 Buscar Procedimientos
                </h2>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '8px'
                    }}>
                      Buscar por palabra clave
                    </label>
                    <input
                      type="text"
                      value={busqueda}
                      onChange={(e) => setBusqueda(e.target.value)}
                      placeholder="Ej: poda, fertilización, riego..."
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '12px',
                        fontSize: '14px',
                        transition: 'all 0.3s ease',
                        background: 'white'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#f97316';
                        e.target.style.boxShadow = '0 0 0 3px rgba(249, 115, 22, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e5e7eb';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '8px'
                    }}>
                      Filtrar por categoría
                    </label>
                    <select
                      value={categoriaSeleccionada}
                      onChange={(e) => setCategoriaSeleccionada(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '12px',
                        fontSize: '14px',
                        background: 'white',
                        cursor: 'pointer'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#f97316';
                        e.target.style.boxShadow = '0 0 0 3px rgba(249, 115, 22, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e5e7eb';
                        e.target.style.boxShadow = 'none';
                      }}
                    >
                      <option value="">Todas las categorías</option>
                      {categorias.map(categoria => (
                        <option key={categoria.id} value={categoria.id}>
                          {categoria.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={limpiarBusqueda}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 4px 12px rgba(107, 114, 128, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 8px 20px rgba(107, 114, 128, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 12px rgba(107, 114, 128, 0.3)';
                    }}
                  >
                    🔄 Limpiar Filtros
                  </button>
                </div>
              </div>

              {/* 📂 Categorías principales */}
              <div style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #fef3c7 100%)',
                borderRadius: '20px',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
                padding: '24px',
                borderLeft: '6px solid #ea580c'
              }}>
                <h2 style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: '#1f2937',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  📂 Categorías Principales
                </h2>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {categoriasPrincipales.map(categoria => (
                    <button
                      key={categoria.id}
                      onClick={() => setCategoriaSeleccionada(categoria.id)}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '16px',
                        borderRadius: '12px',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        fontWeight: '500',
                        fontSize: '14px',
                        ...(categoriaSeleccionada === categoria.id 
                          ? {
                              background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                              color: 'white',
                              transform: 'translateY(-2px)',
                              boxShadow: '0 8px 20px rgba(249, 115, 22, 0.4)'
                            }
                          : {
                              background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)',
                              color: '#374151'
                            })
                      }}
                      onMouseEnter={(e) => {
                        if (categoriaSeleccionada !== categoria.id) {
                          e.target.style.transform = 'translateY(-1px)';
                          e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                          e.target.style.background = 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (categoriaSeleccionada !== categoria.id) {
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.boxShadow = 'none';
                          e.target.style.background = 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)';
                        }
                      }}
                    >
                      <span style={{ fontSize: '24px' }}>{categoria.icono}</span>
                      <span>{categoria.nombre}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 📋 Lista de procedimientos */}
            <div>
              <div style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #fef3c7 100%)',
                borderRadius: '20px',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
                padding: '24px',
                borderLeft: '6px solid #f97316'
              }}>
                <h2 style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: '#1f2937',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  📋 Lista de Procedimientos
                </h2>
                
                {loading ? (
                  <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      border: '4px solid #fbbf24',
                      borderTop: '4px solid #f97316',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                      margin: '0 auto'
                    }}></div>
                    <p style={{
                      color: '#6b7280',
                      marginTop: '16px',
                      fontWeight: '500'
                    }}>
                      Cargando procedimientos...
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {procedimientos.length > 0 ? (
                      procedimientos.map(procedimiento => (
                        <div
                          key={procedimiento.id}
                          onClick={() => seleccionarProcedimiento(procedimiento)}
                          style={{
                            background: 'linear-gradient(135deg, #ffffff 0%, #fef3c7 100%)',
                            border: '2px solid #fed7aa',
                            borderRadius: '16px',
                            padding: '20px',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = '0 8px 25px rgba(249, 115, 22, 0.15)';
                            e.target.style.borderColor = '#f97316';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.05)';
                            e.target.style.borderColor = '#fed7aa';
                          }}
                        >
                          <div style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            justifyContent: 'space-between'
                          }}>
                            <div style={{ flex: 1 }}>
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                marginBottom: '12px'
                              }}>
                                <span style={{ fontSize: '28px' }}>{procedimiento.icono}</span>
                                <h3 style={{
                                  fontSize: '18px',
                                  fontWeight: 'bold',
                                  color: '#1f2937',
                                  margin: 0
                                }}>
                                  {procedimiento.titulo}
                                </h3>
                                <span style={{
                                  padding: '4px 12px',
                                  fontSize: '12px',
                                  borderRadius: '20px',
                                  fontWeight: 'bold',
                                  ...(procedimiento.dificultad === 'alta' 
                                    ? { background: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5' }
                                    : procedimiento.dificultad === 'media' 
                                    ? { background: '#fffbeb', color: '#d97706', border: '1px solid #fcd34d' }
                                    : { background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' })
                                }}>
                                  {procedimiento.dificultad}
                                </span>
                              </div>
                              <p style={{
                                color: '#6b7280',
                                fontSize: '14px',
                                marginBottom: '12px',
                                lineHeight: '1.5'
                              }}>
                                {procedimiento.descripcion}
                              </p>
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '20px',
                                fontSize: '12px',
                                color: '#9ca3af',
                                marginBottom: '12px'
                              }}>
                                <span style={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  gap: '4px',
                                  fontWeight: '500'
                                }}>
                                  📂 {procedimiento.categoria}
                                </span>
                                <span style={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  gap: '4px',
                                  fontWeight: '500'
                                }}>
                                  ⏱️ {procedimiento.duracionEstimada}
                                </span>
                                <span style={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  gap: '4px',
                                  fontWeight: '500'
                                }}>
                                  📝 {procedimiento.pasos?.length || 0} pasos
                                </span>
                              </div>
                              {/* Barra de progreso */}
                              <div style={{
                                width: '100%',
                                background: '#e5e7eb',
                                borderRadius: '10px',
                                height: '8px',
                                overflow: 'hidden',
                                marginBottom: '8px'
                              }}>
                                <div style={{
                                  background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                                  height: '8px',
                                  borderRadius: '10px',
                                  width: `${calcularProgreso(procedimiento)}%`,
                                  transition: 'width 0.3s ease'
                                }}></div>
                              </div>
                              <div style={{
                                fontSize: '12px',
                                color: '#6b7280',
                                fontWeight: '500'
                              }}>
                                Progreso: {calcularProgreso(procedimiento)}%
                              </div>
                            </div>
                            <div style={{ marginLeft: '16px' }}>
                              <span style={{
                                color: '#f97316',
                                fontSize: '24px',
                                fontWeight: 'bold'
                              }}>
                                →
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div style={{ textAlign: 'center', padding: '40px 0' }}>
                        <div style={{ fontSize: '64px', marginBottom: '16px' }}>📋</div>
                        <h3 style={{
                          fontSize: '18px',
                          fontWeight: '600',
                          color: '#1f2937',
                          marginBottom: '8px'
                        }}>
                          No se encontraron procedimientos
                        </h3>
                        <p style={{
                          color: '#6b7280',
                          marginBottom: '16px',
                          fontSize: '14px'
                        }}>
                          Intenta con otros términos de búsqueda o categorías
                        </p>
                        <button
                          onClick={limpiarBusqueda}
                          style={{
                            padding: '12px 24px',
                            background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
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
                          Ver todos los procedimientos
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* 📖 Vista detallada del procedimiento */
          <div style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #fef3c7 100%)',
            borderRadius: '20px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
            padding: '24px',
            borderLeft: '6px solid #f97316'
          }}>
            {/* 🔙 Header con botón volver */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '24px',
              paddingBottom: '16px',
              borderBottom: '2px solid #fed7aa'
            }}>
              <button
                onClick={() => setProcedimientoSeleccionado(null)}
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
                ← Volver a la lista
              </button>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <span style={{
                  padding: '6px 16px',
                  fontSize: '14px',
                  borderRadius: '20px',
                  fontWeight: 'bold',
                  ...(procedimientoSeleccionado.dificultad === 'alta' 
                    ? { background: '#fef2f2', color: '#dc2626', border: '2px solid #fca5a5' }
                    : procedimientoSeleccionado.dificultad === 'media' 
                    ? { background: '#fffbeb', color: '#d97706', border: '2px solid #fcd34d' }
                    : { background: '#f0fdf4', color: '#166534', border: '2px solid #bbf7d0' })
                }}>
                  {procedimientoSeleccionado.dificultad}
                </span>
                <span style={{
                  padding: '6px 16px',
                  fontSize: '14px',
                  borderRadius: '20px',
                  fontWeight: 'bold',
                  background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                  color: 'white'
                }}>
                  {procedimientoSeleccionado.categoria}
                </span>
              </div>
            </div>

            {/* 📋 Información del procedimiento */}
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '16px',
              marginBottom: '24px'
            }}>
              <span style={{ fontSize: '48px' }}>{procedimientoSeleccionado.icono}</span>
              <div style={{ flex: 1 }}>
                <h1 style={{
                  fontSize: '28px',
                  fontWeight: 'bold',
                  color: '#1f2937',
                  marginBottom: '8px',
                  lineHeight: '1.2'
                }}>
                  {procedimientoSeleccionado.titulo}
                </h1>
                <p style={{
                  color: '#6b7280',
                  fontSize: '16px',
                  marginBottom: '16px',
                  lineHeight: '1.6'
                }}>
                  {procedimientoSeleccionado.descripcion}
                </p>
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  gap: '16px',
                  fontSize: '14px',
                  color: '#6b7280',
                  fontWeight: '500'
                }}>
                  <span style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '6px',
                    background: '#fef3c7',
                    padding: '8px 12px',
                    borderRadius: '12px',
                    border: '1px solid #fed7aa'
                  }}>
                    ⏱️ {procedimientoSeleccionado.duracionEstimada}
                  </span>
                  <span style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '6px',
                    background: '#fef3c7',
                    padding: '8px 12px',
                    borderRadius: '12px',
                    border: '1px solid #fed7aa'
                  }}>
                    📝 {procedimientoSeleccionado.pasos?.length || 0} pasos
                  </span>
                  <span style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '6px',
                    background: '#fef3c7',
                    padding: '8px 12px',
                    borderRadius: '12px',
                    border: '1px solid #fed7aa'
                  }}>
                    📈 {calcularProgreso(procedimientoSeleccionado)}% completado
                  </span>
                </div>
              </div>
            </div>

            {/* 📈 Barra de progreso general */}
            <div style={{
              background: '#ffffff',
              borderRadius: '16px',
              padding: '20px',
              marginBottom: '24px',
              border: '2px solid #fed7aa',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px'
              }}>
                <span style={{
                  fontSize: '16px',
                  fontWeight: 'bold',
                  color: '#1f2937'
                }}>
                  Progreso General
                </span>
                <span style={{
                  fontSize: '16px',
                  fontWeight: 'bold',
                  color: '#f97316'
                }}>
                  {pasosCompletados.size} de {procedimientoSeleccionado.pasos?.length || 0} pasos completados
                </span>
              </div>
              <div style={{
                width: '100%',
                background: '#e5e7eb',
                borderRadius: '12px',
                height: '12px',
                overflow: 'hidden'
              }}>
                <div style={{
                  background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                  height: '12px',
                  borderRadius: '12px',
                  width: `${calcularProgreso(procedimientoSeleccionado)}%`,
                  transition: 'width 0.5s ease'
                }}></div>
              </div>
            </div>

            {/* 📝 Navegación entre pasos */}
            <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '24px' }}>
              {/* Lista de pasos */}
              <div style={{
                background: '#ffffff',
                borderRadius: '16px',
                padding: '20px',
                border: '2px solid #fed7aa',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                height: 'fit-content'
              }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: '#1f2937',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  📝 Pasos
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {procedimientoSeleccionado.pasos?.map((paso, index) => (
                    <button
                      key={index}
                      onClick={() => setPasoActual(index)}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '12px',
                        borderRadius: '12px',
                        border: '2px solid',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        fontWeight: '500',
                        fontSize: '14px',
                        ...(index === pasoActual
                          ? {
                              background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                              borderColor: '#3b82f6',
                              color: '#1e40af'
                            }
                          : pasosCompletados.has(index)
                          ? {
                              background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
                              borderColor: '#22c55e',
                              color: '#166534'
                            }
                          : {
                              background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)',
                              borderColor: '#d1d5db',
                              color: '#374151'
                            })
                      }}
                      onMouseEnter={(e) => {
                        if (index !== pasoActual && !pasosCompletados.has(index)) {
                          e.target.style.transform = 'translateY(-1px)';
                          e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (index !== pasoActual && !pasosCompletados.has(index)) {
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.boxShadow = 'none';
                        }
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          ...(pasosCompletados.has(index)
                            ? { background: '#22c55e', color: 'white' }
                            : index === pasoActual
                            ? { background: '#3b82f6', color: 'white' }
                            : { background: '#d1d5db', color: '#6b7280' })
                        }}>
                          {pasosCompletados.has(index) ? '✓' : index + 1}
                        </span>
                        <span>{paso.titulo}</span>
                      </div>
                    </button>
                  )) || (
                    <div style={{ textAlign: 'center', color: '#6b7280', fontSize: '14px' }}>
                      No hay pasos definidos
                    </div>
                  )}
                </div>
              </div>

              {/* Contenido del paso actual */}
              <div style={{
                background: '#ffffff',
                borderRadius: '16px',
                padding: '24px',
                border: '2px solid #fed7aa',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
              }}>
                {procedimientoSeleccionado.pasos && procedimientoSeleccionado.pasos[pasoActual] ? (
                  <div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '24px'
                    }}>
                      <h3 style={{
                        fontSize: '22px',
                        fontWeight: 'bold',
                        color: '#1f2937'
                      }}>
                        Paso {pasoActual + 1}: {procedimientoSeleccionado.pasos[pasoActual].titulo}
                      </h3>
                      <button
                        onClick={() => marcarPasoCompletado(pasoActual)}
                        style={{
                          padding: '12px 16px',
                          borderRadius: '12px',
                          border: 'none',
                          fontWeight: 'bold',
                          fontSize: '14px',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          ...(pasosCompletados.has(pasoActual)
                            ? {
                                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                                color: 'white',
                                boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)'
                              }
                            : {
                                background: 'linear-gradient(135deg, #d1d5db 0%, #9ca3af 100%)',
                                color: '#374151',
                                boxShadow: '0 4px 12px rgba(209, 213, 219, 0.3)'
                              })
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.transform = 'translateY(-2px)';
                          e.target.style.boxShadow = pasosCompletados.has(pasoActual) 
                            ? '0 8px 20px rgba(34, 197, 94, 0.4)'
                            : '0 8px 20px rgba(209, 213, 219, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.boxShadow = pasosCompletados.has(pasoActual)
                            ? '0 4px 12px rgba(34, 197, 94, 0.3)'
                            : '0 4px 12px rgba(209, 213, 219, 0.3)';
                        }}
                      >
                        {pasosCompletados.has(pasoActual) ? '✓ Completado' : '☐ Marcar completado'}
                      </button>
                    </div>

                    <div style={{
                      color: '#374151',
                      fontSize: '16px',
                      lineHeight: '1.6',
                      marginBottom: '24px'
                    }}>
                      {procedimientoSeleccionado.pasos[pasoActual].descripcion}
                    </div>

                    {/* Instrucciones detalladas */}
                    {procedimientoSeleccionado.pasos[pasoActual].instrucciones && (
                      <div style={{
                        background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)',
                        borderRadius: '12px',
                        padding: '16px',
                        marginBottom: '24px',
                        border: '1px solid #e5e7eb'
                      }}>
                        <h4 style={{
                          fontWeight: 'bold',
                          color: '#1f2937',
                          marginBottom: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          📋 Instrucciones:
                        </h4>
                        <ol style={{
                          listStyleType: 'decimal',
                          paddingLeft: '20px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px'
                        }}>
                          {procedimientoSeleccionado.pasos[pasoActual].instrucciones.map((instruccion, idx) => (
                            <li key={idx} style={{ color: '#374151' }}>{instruccion}</li>
                          ))}
                        </ol>
                      </div>
                    )}

                    {/* Herramientas necesarias */}
                    {procedimientoSeleccionado.pasos[pasoActual].herramientas && (
                      <div style={{
                        background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                        borderRadius: '12px',
                        padding: '16px',
                        marginBottom: '24px',
                        border: '1px solid #93c5fd'
                      }}>
                        <h4 style={{
                          fontWeight: 'bold',
                          color: '#1e40af',
                          marginBottom: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          🔧 Herramientas necesarias:
                        </h4>
                        <ul style={{
                          listStyleType: 'disc',
                          paddingLeft: '20px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px'
                        }}>
                          {procedimientoSeleccionado.pasos[pasoActual].herramientas.map((herramienta, idx) => (
                            <li key={idx} style={{ color: '#1e40af' }}>{herramienta}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Precauciones */}
                    {procedimientoSeleccionado.pasos[pasoActual].precauciones && (
                      <div style={{
                        background: 'linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%)',
                        borderRadius: '12px',
                        padding: '16px',
                        marginBottom: '24px',
                        border: '1px solid #fbbf24'
                      }}>
                        <h4 style={{
                          fontWeight: 'bold',
                          color: '#d97706',
                          marginBottom: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          ⚠️ Precauciones:
                        </h4>
                        <ul style={{
                          listStyleType: 'disc',
                          paddingLeft: '20px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px'
                        }}>
                          {procedimientoSeleccionado.pasos[pasoActual].precauciones.map((precaucion, idx) => (
                            <li key={idx} style={{ color: '#d97706' }}>{precaucion}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Tiempo estimado */}
                    {procedimientoSeleccionado.pasos[pasoActual].tiempoEstimado && (
                      <div style={{
                        background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
                        borderRadius: '12px',
                        padding: '16px',
                        marginBottom: '24px',
                        border: '1px solid #86efac'
                      }}>
                        <h4 style={{
                          fontWeight: 'bold',
                          color: '#166534',
                          marginBottom: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          ⏱️ Tiempo estimado:
                        </h4>
                        <p style={{ color: '#166534' }}>
                          {procedimientoSeleccionado.pasos[pasoActual].tiempoEstimado}
                        </p>
                      </div>
                    )}

                    {/* Área de comentarios */}
                    <div style={{
                      background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)',
                      borderRadius: '12px',
                      padding: '16px',
                      marginBottom: '24px',
                      border: '1px solid #d1d5db'
                    }}>
                      <h4 style={{
                        fontWeight: 'bold',
                        color: '#1f2937',
                        marginBottom: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        💬 Notas del paso:
                      </h4>
                      <textarea
                        value={comentarios[pasoActual] || ''}
                        onChange={(e) => setComentarios({...comentarios, [pasoActual]: e.target.value})}
                        onBlur={(e) => {
                          guardarComentario(pasoActual, e.target.value);
                          e.target.style.borderColor = '#e5e7eb';
                          e.target.style.boxShadow = 'none';
                        }}
                        placeholder="Agrega tus notas sobre este paso..."
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: '2px solid #e5e7eb',
                          borderRadius: '8px',
                          fontSize: '14px',
                          minHeight: '80px',
                          resize: 'vertical',
                          fontFamily: 'inherit'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#f97316';
                          e.target.style.boxShadow = '0 0 0 3px rgba(249, 115, 22, 0.1)';
                        }}
                      />
                    </div>

                    {/* Navegación entre pasos */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingTop: '24px',
                      borderTop: '2px solid #fed7aa'
                    }}>
                      <button
                        onClick={pasoAnterior}
                        disabled={pasoActual === 0}
                        style={{
                          padding: '12px 20px',
                          borderRadius: '12px',
                          border: 'none',
                          fontWeight: 'bold',
                          fontSize: '14px',
                          cursor: pasoActual === 0 ? 'not-allowed' : 'pointer',
                          transition: 'all 0.3s ease',
                          ...(pasoActual === 0 
                            ? {
                                background: '#f3f4f6',
                                color: '#9ca3af',
                                opacity: 0.5
                              }
                            : {
                                background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
                                color: 'white',
                                boxShadow: '0 4px 12px rgba(107, 114, 128, 0.3)'
                              })
                        }}
                        onMouseEnter={(e) => {
                          if (pasoActual > 0) {
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = '0 8px 20px rgba(107, 114, 128, 0.4)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (pasoActual > 0) {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 4px 12px rgba(107, 114, 128, 0.3)';
                          }
                        }}
                      >
                        ← Paso anterior
                      </button>
                      
                      <div style={{
                        fontSize: '14px',
                        color: '#6b7280',
                        fontWeight: '500'
                      }}>
                        Paso {pasoActual + 1} de {procedimientoSeleccionado.pasos.length}
                      </div>
                      
                      <button
                        onClick={siguientePaso}
                        disabled={pasoActual === procedimientoSeleccionado.pasos.length - 1}
                        style={{
                          padding: '12px 20px',
                          borderRadius: '12px',
                          border: 'none',
                          fontWeight: 'bold',
                          fontSize: '14px',
                          cursor: pasoActual === procedimientoSeleccionado.pasos.length - 1 ? 'not-allowed' : 'pointer',
                          transition: 'all 0.3s ease',
                          ...(pasoActual === procedimientoSeleccionado.pasos.length - 1
                            ? {
                                background: '#f3f4f6',
                                color: '#9ca3af',
                                opacity: 0.5
                              }
                            : {
                                background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                                color: 'white',
                                boxShadow: '0 4px 12px rgba(249, 115, 22, 0.3)'
                              })
                        }}
                        onMouseEnter={(e) => {
                          if (pasoActual < procedimientoSeleccionado.pasos.length - 1) {
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = '0 8px 20px rgba(249, 115, 22, 0.4)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (pasoActual < procedimientoSeleccionado.pasos.length - 1) {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 4px 12px rgba(249, 115, 22, 0.3)';
                          }
                        }}
                      >
                        Siguiente paso →
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <div style={{ fontSize: '64px', marginBottom: '16px' }}>📝</div>
                    <div style={{
                      color: '#6b7280',
                      fontSize: '16px'
                    }}>
                      No hay información del paso disponible
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Procedimientos;