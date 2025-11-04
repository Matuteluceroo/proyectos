/**
 * 🔍 FiltrosDocumentos - Componente de filtros para documentos
 * ===========================================================
 * Barra de filtros y búsqueda para la tabla de documentos.
 */

import React from 'react';
import './FiltrosDocumentos.css';

const FiltrosDocumentos = ({ 
    busquedaDocumento, 
    setBusquedaDocumento, 
    filtroCategoria, 
    setFiltroCategoria,
    categorias 
}) => {
    return (
        <div className="filtros-documentos">
            <div className="filtro-busqueda">
                <span className="filtro-icono">🔍</span>
                <input
                    type="text"
                    placeholder="Buscar documentos..."
                    value={busquedaDocumento}
                    onChange={(e) => setBusquedaDocumento(e.target.value)}
                    className="filtro-input"
                />
            </div>

            <div className="filtro-categoria">
                <span className="filtro-icono">📁</span>
                <select
                    value={filtroCategoria}
                    onChange={(e) => setFiltroCategoria(e.target.value)}
                    className="filtro-select"
                >
                    <option value="todas">Todas las categorías</option>
                    {categorias.map(cat => (
                        <option key={cat.id} value={cat.nombre}>
                            {cat.nombre}
                        </option>
                    ))}
                </select>
            </div>

            <button 
                className="filtro-limpiar"
                onClick={() => {
                    setBusquedaDocumento('');
                    setFiltroCategoria('todas');
                }}
            >
                ✖️ Limpiar filtros
            </button>
        </div>
    );
};

export default FiltrosDocumentos;

