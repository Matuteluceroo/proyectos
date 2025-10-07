// 📖 GUÍA DE INTEGRACIÓN - useOfflineMode.md
// 🌐 Cómo integrar el modo offline en componentes existentes

/*
=== EJEMPLO DE INTEGRACIÓN EN GESTION CONTENIDO ===

1. Importar el hook:
```jsx
import useOfflineMode from '../hooks/useOfflineMode';
```

2. Usar el hook en el componente:
```jsx
const GestionContenido = () => {
  const { 
    isOnline,
    crearDocumento,
    actualizarDocumento,
    eliminarDocumento,
    obtenerDocumentos,
    crearCategoria,
    obtenerCategorias,
    sincronizarAhora,
    estadisticas,
    operacionesPendientes
  } = useOfflineMode();

  // ... resto del componente
```

3. Reemplazar llamadas a APIs por las funciones del hook:
```jsx
// ❌ ANTES:
const handleCrearDocumento = async (datos) => {
  const response = await fetch('/api/documentos', {
    method: 'POST',
    body: JSON.stringify(datos)
  });
  // ...
};

// ✅ DESPUÉS:
const handleCrearDocumento = async (datos) => {
  const resultado = await crearDocumento(datos);
  
  if (resultado.success) {
    if (resultado.offline) {
      mostrarNotificacion('Documento guardado offline', 'warning');
    } else {
      mostrarNotificacion('Documento creado exitosamente', 'success');
    }
  } else {
    mostrarNotificacion('Error: ' + resultado.error, 'error');
  }
};
```

4. Mostrar indicadores de estado offline:
```jsx
return (
  <div className="gestion-contenido">
    {/* Indicador de estado */}
    {!isOnline && (
      <div className="offline-banner">
        📱 Modo offline - Los cambios se sincronizarán automáticamente
        {operacionesPendientes > 0 && (
          <span>({operacionesPendientes} pendientes)</span>
        )}
      </div>
    )}
    
    {/* Botón de sincronización manual */}
    {isOnline && operacionesPendientes > 0 && (
      <button onClick={sincronizarAhora} className="sync-button">
        🔄 Sincronizar {operacionesPendientes} cambios
      </button>
    )}
    
    {/* Resto del componente */}
  </div>
);
```

=== FUNCIONES DISPONIBLES ===

📄 DOCUMENTOS:
- crearDocumento(data) → Crear documento online/offline
- actualizarDocumento(id, data) → Actualizar documento
- eliminarDocumento(id) → Eliminar documento
- obtenerDocumentos() → Obtener todos los documentos

🏷️ CATEGORÍAS:
- crearCategoria(data) → Crear categoría online/offline
- obtenerCategorias() → Obtener todas las categorías

🔄 SINCRONIZACIÓN:
- sincronizarAhora() → Forzar sincronización manual
- loadOfflineData() → Recargar datos offline

📊 ESTADO:
- isOnline → Boolean si hay conexión
- estadisticas → Estadísticas offline
- operacionesPendientes → Número de operaciones pendientes
- documentosOffline → Documentos solo offline

=== RESPUESTAS TÍPICAS ===

✅ ÉXITO ONLINE:
{
  success: true,
  data: {...},
  online: true
}

📱 ÉXITO OFFLINE:
{
  success: true,
  data: {...},
  offline: true,
  message: "Guardado offline. Se sincronizará automáticamente."
}

❌ ERROR:
{
  success: false,
  error: "Mensaje de error"
}

=== EVENTOS DISPONIBLES ===

🎧 Para escuchar en componentes:

```jsx
useEffect(() => {
  const handleSyncCompleted = (event) => {
    const { sincronizadas, errores } = event.detail;
    console.log(`Sincronización: ${sincronizadas} exitosas, ${errores} errores`);
  };

  const handleManualReview = (event) => {
    const { operacion } = event.detail;
    console.warn('Operación requiere revisión manual:', operacion);
  };

  window.addEventListener('sync-completed', handleSyncCompleted);
  window.addEventListener('sync-manual-review-needed', handleManualReview);

  return () => {
    window.removeEventListener('sync-completed', handleSyncCompleted);
    window.removeEventListener('sync-manual-review-needed', handleManualReview);
  };
}, []);
```

=== ESTILOS RECOMENDADOS ===

```css
.offline-banner {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.2);
}

.sync-button {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
}

.sync-button:hover {
  background: #2563eb;
  transform: translateY(-1px);
}

.offline-indicator {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}
```

=== BUENAS PRÁCTICAS ===

1. ✅ Siempre mostrar feedback al usuario sobre el estado offline
2. ✅ Permitir sincronización manual cuando hay conexión
3. ✅ Manejar errores gracefully con fallback offline
4. ✅ Mostrar indicadores visuales claros del estado
5. ✅ Informar sobre operaciones pendientes
6. ❌ No bloquear la UI durante operaciones offline
7. ❌ No asumir que siempre hay conexión
8. ❌ No perder datos cuando falla la conexión

*/

export default null; // Este archivo es solo documentación