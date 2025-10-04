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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg mb-6 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                ← Volver
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                  📋 Procedimientos
                </h1>
                <p className="text-gray-600 mt-1">
                  Guías paso a paso detalladas
                </p>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              {procedimientos.length} procedimientos disponibles
            </div>
          </div>
        </div>

        {/* Mensaje de estado */}
        {mensaje && (
          <div className={`mb-6 p-4 rounded-lg ${
            mensaje.tipo === 'error' 
              ? 'bg-red-100 border border-red-300 text-red-700' 
              : 'bg-green-100 border border-green-300 text-green-700'
          }`}>
            {mensaje.texto}
          </div>
        )}

        {!procedimientoSeleccionado ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Panel de búsqueda y filtros */}
            <div className="lg:col-span-1 space-y-6">
              {/* Búsqueda */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  🔍 Buscar Procedimientos
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Buscar por palabra clave
                    </label>
                    <input
                      type="text"
                      value={busqueda}
                      onChange={(e) => setBusqueda(e.target.value)}
                      placeholder="Ej: poda, fertilización, riego..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Filtrar por categoría
                    </label>
                    <select
                      value={categoriaSeleccionada}
                      onChange={(e) => setCategoriaSeleccionada(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                    className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    🔄 Limpiar Filtros
                  </button>
                </div>
              </div>

              {/* Categorías principales */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  📂 Categorías Principales
                </h2>
                
                <div className="space-y-2">
                  {categoriasPrincipales.map(categoria => (
                    <button
                      key={categoria.id}
                      onClick={() => setCategoriaSeleccionada(categoria.id)}
                      className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors hover:shadow-md ${
                        categoriaSeleccionada === categoria.id 
                          ? categoria.color 
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <span className="text-2xl">{categoria.icono}</span>
                      <span className="font-medium">{categoria.nombre}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Lista de procedimientos */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  📋 Lista de Procedimientos
                </h2>
                
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-600 mt-4">Cargando procedimientos...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {procedimientos.length > 0 ? (
                      procedimientos.map(procedimiento => (
                        <div
                          key={procedimiento.id}
                          onClick={() => seleccionarProcedimiento(procedimiento)}
                          className="border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <span className="text-2xl">{procedimiento.icono}</span>
                                <h3 className="text-lg font-semibold text-gray-800">
                                  {procedimiento.titulo}
                                </h3>
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  procedimiento.dificultad === 'alta' ? 'bg-red-100 text-red-800' :
                                  procedimiento.dificultad === 'media' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-green-100 text-green-800'
                                }`}>
                                  {procedimiento.dificultad}
                                </span>
                              </div>
                              <p className="text-gray-600 text-sm mb-2">
                                {procedimiento.descripcion}
                              </p>
                              <div className="flex items-center space-x-4 text-xs text-gray-500 mb-2">
                                <span>📂 {procedimiento.categoria}</span>
                                <span>⏱️ {procedimiento.duracionEstimada}</span>
                                <span>📝 {procedimiento.pasos?.length || 0} pasos</span>
                              </div>
                              {/* Barra de progreso */}
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full transition-all"
                                  style={{ width: `${calcularProgreso(procedimiento)}%` }}
                                ></div>
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                Progreso: {calcularProgreso(procedimiento)}%
                              </div>
                            </div>
                            <div className="ml-4">
                              <span className="text-blue-600 hover:text-blue-800">
                                →
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <div className="text-6xl mb-4">📋</div>
                        <h3 className="text-lg font-medium text-gray-800 mb-2">
                          No se encontraron procedimientos
                        </h3>
                        <p className="text-gray-600 mb-4">
                          Intenta con otros términos de búsqueda o categorías
                        </p>
                        <button
                          onClick={limpiarBusqueda}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
          /* Vista del procedimiento seleccionado */
          <div className="space-y-6">
            {/* Header del procedimiento */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">{procedimientoSeleccionado.icono}</span>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                      {procedimientoSeleccionado.titulo}
                    </h2>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                      <span>📂 {procedimientoSeleccionado.categoria}</span>
                      <span>⏱️ {procedimientoSeleccionado.duracionEstimada}</span>
                      <span>📝 {procedimientoSeleccionado.pasos?.length || 0} pasos</span>
                      <span className={`px-2 py-1 rounded-full ${
                        procedimientoSeleccionado.dificultad === 'alta' ? 'bg-red-100 text-red-800' :
                        procedimientoSeleccionado.dificultad === 'media' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {procedimientoSeleccionado.dificultad}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setProcedimientoSeleccionado(null)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  ← Volver a la lista
                </button>
              </div>

              {/* Progreso general */}
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-blue-800">Progreso General</span>
                  <span className="text-sm text-blue-600">
                    {pasosCompletados.size} de {procedimientoSeleccionado.pasos?.length || 0} pasos completados
                  </span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-3">
                  <div 
                    className="bg-blue-600 h-3 rounded-full transition-all"
                    style={{ width: `${calcularProgreso(procedimientoSeleccionado)}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Lista de pasos */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">📝 Pasos</h3>
                  <div className="space-y-2">
                    {procedimientoSeleccionado.pasos?.map((paso, index) => (
                      <button
                        key={index}
                        onClick={() => setPasoActual(index)}
                        className={`w-full text-left p-3 rounded-lg transition-colors ${
                          index === pasoActual
                            ? 'bg-blue-100 border border-blue-300'
                            : pasosCompletados.has(index)
                            ? 'bg-green-100 border border-green-300'
                            : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                            pasosCompletados.has(index)
                              ? 'bg-green-500 text-white'
                              : index === pasoActual
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-300 text-gray-600'
                          }`}>
                            {pasosCompletados.has(index) ? '✓' : index + 1}
                          </span>
                          <span className="text-sm font-medium">
                            {paso.titulo}
                          </span>
                        </div>
                      </button>
                    )) || (
                      <div className="text-gray-500 text-sm">No hay pasos definidos</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Contenido del paso actual */}
              <div className="lg:col-span-3">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  {procedimientoSeleccionado.pasos && procedimientoSeleccionado.pasos[pasoActual] ? (
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-gray-800">
                          Paso {pasoActual + 1}: {procedimientoSeleccionado.pasos[pasoActual].titulo}
                        </h3>
                        <button
                          onClick={() => marcarPasoCompletado(pasoActual)}
                          className={`px-4 py-2 rounded-lg transition-colors ${
                            pasosCompletados.has(pasoActual)
                              ? 'bg-green-600 text-white hover:bg-green-700'
                              : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                          }`}
                        >
                          {pasosCompletados.has(pasoActual) ? '✓ Completado' : '☐ Marcar completado'}
                        </button>
                      </div>

                      <div className="prose max-w-none">
                        <div className="text-gray-700 leading-relaxed mb-6">
                          {procedimientoSeleccionado.pasos[pasoActual].descripcion}
                        </div>

                        {/* Instrucciones detalladas */}
                        {procedimientoSeleccionado.pasos[pasoActual].instrucciones && (
                          <div className="bg-gray-50 rounded-lg p-4 mb-6">
                            <h4 className="font-semibold text-gray-800 mb-2">📋 Instrucciones:</h4>
                            <ol className="list-decimal list-inside space-y-2">
                              {procedimientoSeleccionado.pasos[pasoActual].instrucciones.map((instruccion, idx) => (
                                <li key={idx} className="text-gray-700">{instruccion}</li>
                              ))}
                            </ol>
                          </div>
                        )}

                        {/* Herramientas necesarias */}
                        {procedimientoSeleccionado.pasos[pasoActual].herramientas && (
                          <div className="bg-blue-50 rounded-lg p-4 mb-6">
                            <h4 className="font-semibold text-blue-800 mb-2">🔧 Herramientas necesarias:</h4>
                            <ul className="list-disc list-inside space-y-1">
                              {procedimientoSeleccionado.pasos[pasoActual].herramientas.map((herramienta, idx) => (
                                <li key={idx} className="text-blue-700">{herramienta}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Precauciones */}
                        {procedimientoSeleccionado.pasos[pasoActual].precauciones && (
                          <div className="bg-yellow-50 rounded-lg p-4 mb-6">
                            <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Precauciones:</h4>
                            <ul className="list-disc list-inside space-y-1">
                              {procedimientoSeleccionado.pasos[pasoActual].precauciones.map((precaucion, idx) => (
                                <li key={idx} className="text-yellow-700">{precaucion}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Tiempo estimado */}
                        {procedimientoSeleccionado.pasos[pasoActual].tiempoEstimado && (
                          <div className="bg-green-50 rounded-lg p-4 mb-6">
                            <h4 className="font-semibold text-green-800 mb-2">⏱️ Tiempo estimado:</h4>
                            <p className="text-green-700">{procedimientoSeleccionado.pasos[pasoActual].tiempoEstimado}</p>
                          </div>
                        )}

                        {/* Área de comentarios */}
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-800 mb-2">💬 Notas del paso:</h4>
                          <textarea
                            value={comentarios[pasoActual] || ''}
                            onChange={(e) => setComentarios({...comentarios, [pasoActual]: e.target.value})}
                            onBlur={(e) => guardarComentario(pasoActual, e.target.value)}
                            placeholder="Agrega tus notas sobre este paso..."
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            rows="3"
                          />
                        </div>
                      </div>

                      {/* Navegación */}
                      <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
                        <button
                          onClick={pasoAnterior}
                          disabled={pasoActual === 0}
                          className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          ← Paso anterior
                        </button>
                        
                        <div className="text-sm text-gray-500">
                          Paso {pasoActual + 1} de {procedimientoSeleccionado.pasos.length}
                        </div>
                        
                        <button
                          onClick={siguientePaso}
                          disabled={pasoActual === procedimientoSeleccionado.pasos.length - 1}
                          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Siguiente paso →
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-gray-500">No hay información del paso disponible</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Procedimientos;