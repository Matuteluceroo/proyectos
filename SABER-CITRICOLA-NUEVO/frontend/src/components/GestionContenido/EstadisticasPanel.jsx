/**
 * 📊 EstadisticasPanel - Panel de estadísticas de gestión de contenido
 * ====================================================================
 * Muestra métricas clave de categorías y documentos.
 */

import React from 'react';
import './EstadisticasPanel.css';

const EstadisticasPanel = ({ estadisticas }) => {
    const stats = [
        {
            icono: '📚',
            titulo: 'Total Categorías',
            valor: estadisticas.totalCategorias,
            color: '#3B82F6',
            descripcion: 'Categorías activas'
        },
        {
            icono: '📄',
            titulo: 'Total Documentos',
            valor: estadisticas.totalDocumentos,
            color: '#10B981',
            descripcion: 'Documentos en sistema'
        },
        {
            icono: '🆕',
            titulo: 'Documentos Recientes',
            valor: estadisticas.documentosRecientes,
            color: '#F59E0B',
            descripcion: 'Últimos 7 días'
        },
        {
            icono: '⚠️',
            titulo: 'Categorías Vacías',
            valor: estadisticas.categoriasVacias,
            color: '#EF4444',
            descripcion: 'Sin documentos'
        }
    ];

    return (
        <div className="estadisticas-panel">
            {stats.map((stat, index) => (
                <div 
                    key={index}
                    className="estadistica-card"
                    style={{ borderLeftColor: stat.color }}
                >
                    <div className="estadistica-icono" style={{ backgroundColor: `${stat.color}20` }}>
                        <span>{stat.icono}</span>
                    </div>
                    <div className="estadistica-info">
                        <h3>{stat.titulo}</h3>
                        <p className="estadistica-valor" style={{ color: stat.color }}>
                            {stat.valor}
                        </p>
                        <p className="estadistica-descripcion">{stat.descripcion}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default EstadisticasPanel;

