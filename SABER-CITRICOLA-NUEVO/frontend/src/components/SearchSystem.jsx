// 🔍 SearchSystem.jsx - Sistema de búsqueda inteligente
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import './SearchSystem.css';

const SearchSystem = ({ onResultClick, placeholder = "Buscar en Saber Citrícola..." }) => {
  const { API_URL } = useAuth();
  const { showError } = useNotification();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [filters, setFilters] = useState({
    tipo: 'todos', // todos, documentos, usuarios, categorias
    categoria: '',
    fechaDesde: '',
    fechaHasta: ''
  });
  const [categorias, setCategorias] = useState([]);
  const searchRef = useRef(null);
  const resultsRef = useRef(null);

  // 📚 Cargar categorías disponibles
  useEffect(() => {
    const cargarCategorias = async () => {
      try {
        const response = await fetch(`${API_URL}/api/categorias`);
        const data = await response.json();
        if (response.ok) {
          setCategorias(data.categorias || []);
        }
      } catch (error) {
        console.error('Error al cargar categorías:', error);
      }
    };
    cargarCategorias();
  }, [API_URL]);

  // 🔍 Realizar búsqueda
  const realizarBusqueda = async (searchQuery, searchFilters = filters) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams({
        q: searchQuery.trim(),
        tipo: searchFilters.tipo,
        categoria: searchFilters.categoria,
        fechaDesde: searchFilters.fechaDesde,
        fechaHasta: searchFilters.fechaHasta
      });

      const response = await fetch(`${API_URL}/api/buscar?${params}`);
      const data = await response.json();

      if (response.ok) {
        setResults(data.resultados || []);
        setIsOpen(true);
      } else {
        showError('Error en la búsqueda', {
          message: data.error || 'No se pudo realizar la búsqueda'
        });
        setResults([]);
      }
    } catch (error) {
      console.error('Error en búsqueda:', error);
      showError('Error de conexión', {
        message: 'No se pudo conectar con el servidor'
      });
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  // ⌨️ Manejar cambios en el input
  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedIndex(-1);

    // Búsqueda en tiempo real con debounce
    if (value.length >= 2) {
      clearTimeout(window.searchTimeout);
      window.searchTimeout = setTimeout(() => {
        realizarBusqueda(value);
      }, 300);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  };

  // ⌨️ Navegación con teclado
  const handleKeyDown = (e) => {
    if (!isOpen || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < results.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : results.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleResultClick(results[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // 🎯 Manejar clic en resultado
  const handleResultClick = (result) => {
    setQuery(result.titulo || result.nombre || result.descripcion);
    setIsOpen(false);
    setSelectedIndex(-1);
    if (onResultClick) {
      onResultClick(result);
    }
  };

  // 🎨 Obtener icono según el tipo
  const getResultIcon = (tipo) => {
    switch (tipo) {
      case 'documento': return '📄';
      case 'usuario': return '👤';
      case 'categoria': return '📚';
      case 'capacitacion': return '🎓';
      default: return '📋';
    }
  };

  // 🎨 Destacar texto coincidente
  const highlightText = (text, query) => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query.trim()})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? 
        <mark key={index} className="search-highlight">{part}</mark> : 
        part
    );
  };

  // 🔍 Aplicar filtros
  const handleFilterChange = (filterType, value) => {
    const newFilters = { ...filters, [filterType]: value };
    setFilters(newFilters);
    
    if (query.length >= 2) {
      realizarBusqueda(query, newFilters);
    }
  };

  // 🧹 Limpiar búsqueda
  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    setSelectedIndex(-1);
    searchRef.current?.focus();
  };

  return (
    <div className="search-system" ref={searchRef}>
      {/* 🔍 Input de búsqueda */}
      <div className="search-input-container">
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => query.length >= 2 && setIsOpen(true)}
            placeholder={placeholder}
            className="search-input"
          />
          {query && (
            <button 
              className="search-clear"
              onClick={clearSearch}
              aria-label="Limpiar búsqueda"
            >
              ✕
            </button>
          )}
          {loading && (
            <span className="search-loading">⏳</span>
          )}
        </div>

        {/* 🎛️ Filtros de búsqueda */}
        <div className="search-filters">
          <select
            value={filters.tipo}
            onChange={(e) => handleFilterChange('tipo', e.target.value)}
            className="search-filter"
          >
            <option value="todos">Todos los tipos</option>
            <option value="documentos">📄 Documentos</option>
            <option value="usuarios">👤 Usuarios</option>
            <option value="categorias">📚 Categorías</option>
            <option value="capacitaciones">🎓 Capacitaciones</option>
          </select>

          {categorias.length > 0 && (
            <select
              value={filters.categoria}
              onChange={(e) => handleFilterChange('categoria', e.target.value)}
              className="search-filter"
            >
              <option value="">Todas las categorías</option>
              {categorias.map(categoria => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.icono} {categoria.nombre}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* 📋 Resultados de búsqueda */}
      {isOpen && (
        <div className="search-results" ref={resultsRef}>
          {loading ? (
            <div className="search-result loading">
              <span className="result-icon">⏳</span>
              <div className="result-content">
                <p>Buscando...</p>
              </div>
            </div>
          ) : results.length > 0 ? (
            <>
              <div className="search-results-header">
                <span>{results.length} resultado{results.length !== 1 ? 's' : ''} encontrado{results.length !== 1 ? 's' : ''}</span>
              </div>
              {results.map((result, index) => (
                <div
                  key={`${result.tipo}-${result.id}`}
                  className={`search-result ${selectedIndex === index ? 'selected' : ''}`}
                  onClick={() => handleResultClick(result)}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <span className="result-icon">
                    {getResultIcon(result.tipo)}
                  </span>
                  <div className="result-content">
                    <h4 className="result-title">
                      {highlightText(result.titulo || result.nombre, query)}
                    </h4>
                    {result.descripcion && (
                      <p className="result-description">
                        {highlightText(result.descripcion, query)}
                      </p>
                    )}
                    <div className="result-meta">
                      <span className="result-type">{result.tipo}</span>
                      {result.categoria_nombre && (
                        <span className="result-category">
                          📚 {result.categoria_nombre}
                        </span>
                      )}
                      {result.fecha && (
                        <span className="result-date">
                          {new Date(result.fecha).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </>
          ) : query.length >= 2 ? (
            <div className="search-result no-results">
              <span className="result-icon">🔍</span>
              <div className="result-content">
                <h4>No se encontraron resultados</h4>
                <p>Intenta con otros términos o ajusta los filtros</p>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default SearchSystem;