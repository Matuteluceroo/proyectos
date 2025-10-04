// ⚡ GuiasRapidas.jsx - Portal de consultas inmediatas para operadores
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  obtenerGuiasRapidas, 
  buscarGuiasRapidas,
  obtenerCategoriasGuias,
  marcarGuiaComoConsultada
} from '../services/guiasRapidasAPI';

const GuiasRapidas = () => {
  const navigate = useNavigate();
  const [guias, setGuias] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');
  const [guiaSeleccionada, setGuiaSeleccionada] = useState(null);
  const [mensaje, setMensaje] = useState(null);

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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 p-6">
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
                  ⚡ Guías Rápidas
                </h1>
                <p className="text-gray-600 mt-1">
                  Consulta inmediata de información clave
                </p>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              {guias.length} guías disponibles
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Panel de búsqueda y filtros */}
          <div className="lg:col-span-1 space-y-6">
            {/* Búsqueda */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                🔍 Buscar Guías
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
                    placeholder="Ej: poda, riego, fertilización..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Filtrar por categoría
                  </label>
                  <select
                    value={categoriaSeleccionada}
                    onChange={(e) => setCategoriaSeleccionada(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
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

            {/* Categorías populares */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                🔥 Categorías Populares
              </h2>
              
              <div className="space-y-2">
                {categoriasPopulares.map(categoria => (
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

          {/* Lista de guías */}
          <div className="lg:col-span-2 space-y-6">
            {!guiaSeleccionada ? (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  📋 Resultados de Búsqueda
                </h2>
                
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
                    <p className="text-gray-600 mt-4">Cargando guías...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {guias.length > 0 ? (
                      guias.map(guia => (
                        <div
                          key={guia.id}
                          onClick={() => seleccionarGuia(guia)}
                          className="border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-orange-300 transition-all cursor-pointer"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <span className="text-2xl">{guia.icono}</span>
                                <h3 className="text-lg font-semibold text-gray-800">
                                  {guia.titulo}
                                </h3>
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  guia.prioridad === 'alta' ? 'bg-red-100 text-red-800' :
                                  guia.prioridad === 'media' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-green-100 text-green-800'
                                }`}>
                                  {guia.prioridad}
                                </span>
                              </div>
                              <p className="text-gray-600 text-sm mb-2">
                                {guia.descripcion}
                              </p>
                              <div className="flex items-center space-x-4 text-xs text-gray-500">
                                <span>📂 {guia.categoria}</span>
                                <span>⏱️ {guia.tiempoLectura} min</span>
                                <span>👁️ {guia.vistas} vistas</span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <span className="text-orange-600 hover:text-orange-800">
                                →
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <div className="text-6xl mb-4">🔍</div>
                        <h3 className="text-lg font-medium text-gray-800 mb-2">
                          No se encontraron guías
                        </h3>
                        <p className="text-gray-600 mb-4">
                          Intenta con otros términos de búsqueda o categorías
                        </p>
                        <button
                          onClick={limpiarBusqueda}
                          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                        >
                          Ver todas las guías
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* Vista detallada de guía */
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl">{guiaSeleccionada.icono}</span>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800">
                        {guiaSeleccionada.titulo}
                      </h2>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                        <span>📂 {guiaSeleccionada.categoria}</span>
                        <span>⏱️ {guiaSeleccionada.tiempoLectura} min</span>
                        <span className={`px-2 py-1 rounded-full ${
                          guiaSeleccionada.prioridad === 'alta' ? 'bg-red-100 text-red-800' :
                          guiaSeleccionada.prioridad === 'media' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {guiaSeleccionada.prioridad}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setGuiaSeleccionada(null)}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    ← Volver a la lista
                  </button>
                </div>

                <div className="prose max-w-none">
                  <div className="bg-orange-50 border-l-4 border-orange-400 p-4 mb-6">
                    <p className="text-gray-700">
                      <strong>Descripción:</strong> {guiaSeleccionada.descripcion}
                    </p>
                  </div>

                  {/* Contenido de la guía */}
                  <div className="space-y-4">
                    {guiaSeleccionada.contenido?.map((seccion, index) => (
                      <div key={index} className="border-l-2 border-gray-200 pl-4">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">
                          {seccion.titulo}
                        </h3>
                        <div className="text-gray-700 leading-relaxed">
                          {seccion.texto}
                        </div>
                        {seccion.lista && (
                          <ul className="list-disc list-inside mt-2 space-y-1">
                            {seccion.lista.map((item, idx) => (
                              <li key={idx} className="text-gray-700">{item}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )) || (
                      <div className="text-gray-600">
                        <p>Contenido de la guía rápida aquí...</p>
                      </div>
                    )}
                  </div>

                  {/* Información adicional */}
                  {guiaSeleccionada.notasImportantes && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
                      <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Notas Importantes:</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {guiaSeleccionada.notasImportantes.map((nota, index) => (
                          <li key={index} className="text-yellow-700">{nota}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Recursos relacionados */}
                  {guiaSeleccionada.recursosRelacionados && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                      <h4 className="font-semibold text-blue-800 mb-2">🔗 Recursos Relacionados:</h4>
                      <ul className="space-y-2">
                        {guiaSeleccionada.recursosRelacionados.map((recurso, index) => (
                          <li key={index}>
                            <button className="text-blue-600 hover:text-blue-800 underline">
                              {recurso}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
                  <div className="text-sm text-gray-500">
                    Última actualización: {guiaSeleccionada.fechaActualizacion || 'Hoy'}
                  </div>
                  <div className="flex space-x-3">
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      📤 Compartir
                    </button>
                    <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
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