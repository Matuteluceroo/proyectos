// 🧪 Página de prueba para verificar datos del documento y usuario
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const TestDocumento = () => {
  const { user, API_URL } = useAuth();
  const [documento, setDocumento] = useState(null);
  const [loading, setLoading] = useState(false);

  const testearDocumento = async (id = 11) => {
    setLoading(true);
    try {
      console.log('🧪 Testeando documento ID:', id);
      console.log('🧪 Usuario actual:', user);
      console.log('🧪 API URL:', API_URL);
      
      const response = await fetch(`${API_URL}/api/documentos/${id}`);
      console.log('🧪 Respuesta HTTP:', response.status);
      
      if (!response.ok) {
        console.error('🧪 Error HTTP:', response.status, response.statusText);
        return;
      }
      
      const data = await response.json();
      console.log('🧪 Datos recibidos completos:', data);
      
      if (data.success && data.data) {
        const doc = data.data;
        setDocumento(doc);
        
        console.log('🧪 ANÁLISIS DE PERMISOS:');
        console.log('  - Documento autor_id:', doc.autor_id, typeof doc.autor_id);
        console.log('  - Usuario actual ID:', user?.id, typeof user?.id);
        console.log('  - Usuario rol:', user?.rol);
        console.log('  - Comparación autor === user:', doc.autor_id === user?.id);
        console.log('  - Es administrador:', user?.rol === 'administrador');
        console.log('  - Puede editar:', doc.autor_id === user?.id || user?.rol === 'administrador');
      }
    } catch (error) {
      console.error('🧪 Error en petición:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      testearDocumento();
    }
  }, [user]);

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>🧪 Test de Documento y Permisos</h1>
      
      <div style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ccc' }}>
        <h3>👤 Usuario Actual:</h3>
        <pre>{JSON.stringify(user, null, 2)}</pre>
      </div>

      <div style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ccc' }}>
        <h3>📄 Documento (ID: 11):</h3>
        {loading ? (
          <p>Cargando...</p>
        ) : documento ? (
          <pre>{JSON.stringify(documento, null, 2)}</pre>
        ) : (
          <p>No se pudo cargar el documento</p>
        )}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <button onClick={() => testearDocumento(11)} style={{ marginRight: '10px' }}>
          🔄 Recargar Documento 11
        </button>
        <button onClick={() => testearDocumento(8)}>
          🔄 Probar Documento 8
        </button>
      </div>

      {documento && user && (
        <div style={{ padding: '10px', border: '2px solid #333', backgroundColor: '#f0f0f0' }}>
          <h3>🔍 ANÁLISIS DE PERMISOS:</h3>
          <p><strong>Documento autor_id:</strong> {documento.autor_id} ({typeof documento.autor_id})</p>
          <p><strong>Usuario ID:</strong> {user.id} ({typeof user.id})</p>
          <p><strong>Usuario rol:</strong> {user.rol}</p>
          <p><strong>Son iguales los IDs:</strong> {documento.autor_id === user.id ? '✅ SÍ' : '❌ NO'}</p>
          <p><strong>Es administrador:</strong> {user.rol === 'administrador' ? '✅ SÍ' : '❌ NO'}</p>
          <p><strong>Puede editar:</strong> {(documento.autor_id === user.id || user.rol === 'administrador') ? '✅ SÍ' : '❌ NO'}</p>
        </div>
      )}

      <div style={{ marginTop: '20px' }}>
        <h3>📋 Instrucciones:</h3>
        <ol>
          <li>Abre la consola del navegador (F12)</li>
          <li>Mira los logs que empiezan con 🧪</li>
          <li>Compara los valores y tipos de datos</li>
          <li>Verifica si hay diferencias en los tipos (string vs number)</li>
        </ol>
      </div>
    </div>
  );
};

export default TestDocumento;