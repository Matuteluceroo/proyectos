// ⚡ GuiasRapidas.jsx - Portal de consultas inmediatas para operadores
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  obtenerGuiasRapidas, 
  buscarGuiasRapidas,
  obtenerCategoriasGuias,
  marcarGuiaComoConsultada
} from '../services/guiasRapidasAPI';

const GuiasRapidas = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [guias, setGuias] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');
  const [guiaSeleccionada, setGuiaSeleccionada] = useState(null);
  const [mensaje, setMensaje] = useState(null);

  // Manejar parámetros URL para búsqueda por voz
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const categoria = params.get('categoria');
    const query = params.get('q');
    
    if (categoria) {
      // Mapear categorías de voz a categorías reales
      const categoriaMap = {
        'control-plagas': 'Control de Plagas',
        'fertilizacion': 'Fertilización',
        'enfermedades': 'Enfermedades'
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
      buscarGuias();
    } else if (busqueda.length === 0 && !categoriaSeleccionada) {
      cargarGuias();
    }
  }, [busqueda, categoriaSeleccionada]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      await Promise.all([
        cargarGuias(),
        cargarCategorias()
      ]);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      mostrarMensaje('Error al cargar los datos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const cargarGuias = async () => {
    try {
      const data = await obtenerGuiasRapidas();
      setGuias(data);
    } catch (error) {
      console.error('Error al cargar guías:', error);
    }
  };

  const cargarCategorias = async () => {
    try {
      const data = await obtenerCategoriasGuias();
      setCategorias(data);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
    }
  };

  const buscarGuias = async () => {
    try {
      setLoading(true);
      const data = await buscarGuiasRapidas({
        busqueda,
        categoria: categoriaSeleccionada
      });
      setGuias(data);
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

  const seleccionarGuia = async (guia) => {
    setGuiaSeleccionada(guia);
    
    // Marcar como consultada
    try {
      await marcarGuiaComoConsultada(guia.id);
    } catch (error) {
      console.error('Error al marcar guía como consultada:', error);
    }
  };

  const limpiarBusqueda = () => {
    setBusqueda('');
    setCategoriaSeleccionada('');
    setGuiaSeleccionada(null);
    cargarGuias();
  };

  const categoriasPopulares = [
    { id: 'cultivo', nombre: 'Cultivo', icono: '🌱', color: 'bg-green-100 text-green-800' },
    { id: 'plagas', nombre: 'Plagas', icono: '🐛', color: 'bg-red-100 text-red-800' },
    { id: 'riego', nombre: 'Riego', icono: '💧', color: 'bg-blue-100 text-blue-800' },
    { id: 'fertilizacion', nombre: 'Fertilización', icono: '🌿', color: 'bg-yellow-100 text-yellow-800' },
    { id: 'cosecha', nombre: 'Cosecha', icono: '🍊', color: 'bg-orange-100 text-orange-800' },
    { id: 'poda', nombre: 'Poda', icono: '✂️', color: 'bg-purple-100 text-purple-800' }
  ];

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
                  ⚡ Guías Rápidas
                </h1>
                <p style={{
                  color: '#6b7280',
                  marginTop: '8px',
                  fontSize: '16px',
                  fontWeight: '500'
                }}>
                  Consulta inmediata de información clave
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
              {guias.length} guías disponibles
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
                🔍 Buscar Guías
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
                    placeholder="Ej: poda, riego, fertilización..."
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

            {/* 🔥 Categorías populares */}
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
                🔥 Categorías Populares
              </h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {categoriasPopulares.map(categoria => (
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

          {/* 📋 Lista de guías */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {!guiaSeleccionada ? (
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
                  📋 Resultados de Búsqueda
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
                      Cargando guías...
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {guias.length > 0 ? (
                      guias.map(guia => (
                        <div
                          key={guia.id}
                          onClick={() => seleccionarGuia(guia)}
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
                                <span style={{ fontSize: '28px' }}>{guia.icono}</span>
                                <h3 style={{
                                  fontSize: '18px',
                                  fontWeight: 'bold',
                                  color: '#1f2937',
                                  margin: 0
                                }}>
                                  {guia.titulo}
                                </h3>
                                <span style={{
                                  padding: '4px 12px',
                                  fontSize: '12px',
                                  borderRadius: '20px',
                                  fontWeight: 'bold',
                                  ...(guia.prioridad === 'alta' 
                                    ? { background: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5' }
                                    : guia.prioridad === 'media' 
                                    ? { background: '#fffbeb', color: '#d97706', border: '1px solid #fcd34d' }
                                    : { background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' })
                                }}>
                                  {guia.prioridad}
                                </span>
                              </div>
                              <p style={{
                                color: '#6b7280',
                                fontSize: '14px',
                                marginBottom: '12px',
                                lineHeight: '1.5'
                              }}>
                                {guia.descripcion}
                              </p>
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '20px',
                                fontSize: '12px',
                                color: '#9ca3af'
                              }}>
                                <span style={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  gap: '4px',
                                  fontWeight: '500'
                                }}>
                                  📂 {guia.categoria}
                                </span>
                                <span style={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  gap: '4px',
                                  fontWeight: '500'
                                }}>
                                  ⏱️ {guia.tiempoLectura} min
                                </span>
                                <span style={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  gap: '4px',
                                  fontWeight: '500'
                                }}>
                                  👁️ {guia.vistas} vistas
                                </span>
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
                        <div style={{ fontSize: '64px', marginBottom: '16px' }}>🔍</div>
                        <h3 style={{
                          fontSize: '18px',
                          fontWeight: '600',
                          color: '#1f2937',
                          marginBottom: '8px'
                        }}>
                          No se encontraron guías
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
                          Ver todas las guías
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* 📖 Vista detallada de guía */
              <div style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #fef3c7 100%)',
                borderRadius: '20px',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
                padding: '32px',
                borderLeft: '6px solid #f97316'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '24px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span style={{ fontSize: '48px' }}>{guiaSeleccionada.icono}</span>
                    <div>
                      <h2 style={{
                        fontSize: '28px',
                        fontWeight: 'bold',
                        color: '#1f2937',
                        margin: 0
                      }}>
                        {guiaSeleccionada.titulo}
                      </h2>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        fontSize: '14px',
                        color: '#6b7280',
                        marginTop: '8px'
                      }}>
                        <span style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '4px',
                          fontWeight: '500'
                        }}>
                          📂 {guiaSeleccionada.categoria}
                        </span>
                        <span style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '4px',
                          fontWeight: '500'
                        }}>
                          ⏱️ {guiaSeleccionada.tiempoLectura} min
                        </span>
                        <span style={{
                          padding: '6px 12px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          ...(guiaSeleccionada.prioridad === 'alta' 
                            ? { background: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5' }
                            : guiaSeleccionada.prioridad === 'media' 
                            ? { background: '#fffbeb', color: '#d97706', border: '1px solid #fcd34d' }
                            : { background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' })
                        }}>
                          {guiaSeleccionada.prioridad}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setGuiaSeleccionada(null)}
                    style={{
                      padding: '12px 20px',
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
                    ← Volver a la lista
                  </button>
                </div>

                <div style={{ maxWidth: 'none' }}>
                  <div style={{
                    background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
                    borderLeft: '4px solid #f97316',
                    padding: '20px',
                    marginBottom: '24px',
                    borderRadius: '12px'
                  }}>
                    <p style={{
                      color: '#9a3412',
                      margin: 0,
                      fontSize: '16px',
                      lineHeight: '1.6'
                    }}>
                      <strong>Descripción:</strong> {guiaSeleccionada.descripcion}
                    </p>
                  </div>

                  {/* 📝 Contenido de la guía */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {guiaSeleccionada.contenido?.map((seccion, index) => (
                      <div key={index} style={{
                        borderLeft: '3px solid #fed7aa',
                        paddingLeft: '20px',
                        background: 'linear-gradient(135deg, #fefbf6 0%, #fef3c7 100%)',
                        padding: '20px',
                        borderRadius: '12px',
                        marginLeft: '0'
                      }}>
                        <h3 style={{
                          fontSize: '20px',
                          fontWeight: 'bold',
                          color: '#1f2937',
                          marginBottom: '12px'
                        }}>
                          {seccion.titulo}
                        </h3>
                        <div style={{
                          color: '#374151',
                          lineHeight: '1.7',
                          fontSize: '15px'
                        }}>
                          {seccion.texto}
                        </div>
                        {seccion.lista && (
                          <ul style={{
                            listStyleType: 'disc',
                            listStylePosition: 'inside',
                            marginTop: '12px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '6px'
                          }}>
                            {seccion.lista.map((item, idx) => (
                              <li key={idx} style={{
                                color: '#374151',
                                fontSize: '15px',
                                lineHeight: '1.6'
                              }}>
                                {item}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )) || (
                      <div style={{
                        color: '#6b7280',
                        fontSize: '16px',
                        padding: '20px',
                        textAlign: 'center',
                        background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)',
                        borderRadius: '12px'
                      }}>
                        <p>Contenido de la guía rápida aquí...</p>
                      </div>
                    )}
                  </div>

                  {/* ⚠️ Información adicional */}
                  {guiaSeleccionada.notasImportantes && (
                    <div style={{
                      background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
                      border: '2px solid #fcd34d',
                      borderRadius: '12px',
                      padding: '20px',
                      marginTop: '24px'
                    }}>
                      <h4 style={{
                        fontWeight: 'bold',
                        color: '#d97706',
                        marginBottom: '12px',
                        fontSize: '16px'
                      }}>
                        ⚠️ Notas Importantes:
                      </h4>
                      <ul style={{
                        listStyleType: 'disc',
                        listStylePosition: 'inside',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px'
                      }}>
                        {guiaSeleccionada.notasImportantes.map((nota, index) => (
                          <li key={index} style={{
                            color: '#92400e',
                            fontSize: '14px',
                            lineHeight: '1.6'
                          }}>
                            {nota}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* 🔗 Recursos relacionados */}
                  {guiaSeleccionada.recursosRelacionados && (
                    <div style={{
                      background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                      border: '2px solid #93c5fd',
                      borderRadius: '12px',
                      padding: '20px',
                      marginTop: '24px'
                    }}>
                      <h4 style={{
                        fontWeight: 'bold',
                        color: '#1d4ed8',
                        marginBottom: '12px',
                        fontSize: '16px'
                      }}>
                        🔗 Recursos Relacionados:
                      </h4>
                      <ul style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {guiaSeleccionada.recursosRelacionados.map((recurso, index) => (
                          <li key={index}>
                            <button style={{
                              color: '#2563eb',
                              textDecoration: 'underline',
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              fontSize: '14px',
                              fontWeight: '500'
                            }}>
                              {recurso}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '32px',
                  paddingTop: '24px',
                  borderTop: '2px solid #fed7aa'
                }}>
                  <div style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    fontWeight: '500'
                  }}>
                    Última actualización: {guiaSeleccionada.fechaActualizacion || 'Hoy'}
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button style={{
                      padding: '12px 20px',
                      background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 8px 20px rgba(59, 130, 246, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
                    }}>
                      📤 Compartir
                    </button>
                    <button style={{
                      padding: '12px 20px',
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 8px 20px rgba(16, 185, 129, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
                    }}>
                      💾 Guardar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuiasRapidas;