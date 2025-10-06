// 📊 reportesAPI.js - Servicio para comunicarse con la API de reportes
import { buildApiUrl } from '../config/app.config.js';

// 🔍 Función para obtener headers con autenticación
const getHeaders = () => {
  const headers = {
    'Content-Type': 'application/json',
  };

  // Buscar token en diferentes ubicaciones
  let userData = null;
  
  try {
    // Primero intentar desde localStorage como cadena JSON
    const userString = localStorage.getItem('user');
    if (userString) {
      userData = JSON.parse(userString);
    }
  } catch (error) {
    console.log('No se pudo parsear user desde localStorage');
  }

  // Si no se encuentra como JSON, buscar datos individuales
  if (!userData) {
    const nombre = localStorage.getItem('userName');
    const rol = localStorage.getItem('userRole');
    if (nombre && rol) {
      userData = { nombre, rol };
    }
  }

  // Agregar headers de autenticación si hay datos de usuario
  if (userData) {
    headers['X-User-Name'] = userData.nombre;
    headers['X-User-Role'] = userData.rol;
  }

  return headers;
};

// 📈 Obtener reporte completo del sistema
export const obtenerReportesCompletos = async () => {
  try {
    console.log('📊 Obteniendo reportes completos...');
    
    const response = await fetch(buildApiUrl('/reportes'), {
      method: 'GET',
      headers: getHeaders()
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Reportes obtenidos exitosamente:', data);
    return data;
  } catch (error) {
    console.error('❌ Error al obtener reportes:', error);
    throw error;
  }
};

// 📥 Exportar reporte específico
export const exportarReporte = async (tipo, formato = 'json') => {
  try {
    console.log(`📤 Exportando reporte: ${tipo}, formato: ${formato}`);
    
    const response = await fetch(`${API_URL}/api/reportes/exportar/${tipo}?formato=${formato}`, {
      method: 'GET',
      headers: getHeaders()
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    if (formato === 'csv') {
      // Para CSV, devolver como blob para descarga
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `reporte_${tipo}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      return { success: true, message: 'Archivo descargado' };
    } else {
      const data = await response.json();
      console.log('✅ Reporte exportado exitosamente:', data);
      return data;
    }
  } catch (error) {
    console.error('❌ Error al exportar reporte:', error);
    throw error;
  }
};

// 📊 Obtener métricas en tiempo real
export const obtenerMetricasEnTiempoReal = async () => {
  try {
    console.log('⚡ Obteniendo métricas en tiempo real...');
    
    const response = await fetch(`${API_URL}/api/reportes/metricas-tiempo-real`, {
      method: 'GET',
      headers: getHeaders()
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Métricas en tiempo real obtenidas:', data);
    return data;
  } catch (error) {
    console.error('❌ Error al obtener métricas en tiempo real:', error);
    throw error;
  }
};

// 📋 Funciones auxiliares para filtros y rangos de fechas
export const obtenerReportesFiltrados = async (filtros) => {
  try {
    const { desde, hasta, tipo } = filtros;
    console.log('🔍 Obteniendo reportes filtrados:', filtros);
    
    const params = new URLSearchParams();
    if (desde) params.append('desde', desde);
    if (hasta) params.append('hasta', hasta);
    if (tipo) params.append('tipo', tipo);
    
    const url = `${API_URL}/api/reportes?${params.toString()}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders()
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Reportes filtrados obtenidos:', data);
    return data;
  } catch (error) {
    console.error('❌ Error al obtener reportes filtrados:', error);
    throw error;
  }
};