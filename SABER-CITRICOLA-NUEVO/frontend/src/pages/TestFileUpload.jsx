// 📁 pages/TestFileUpload.jsx - Página de prueba para subida de archivos
import { useState } from 'react';
import FileUpload from '../components/FileUpload/FileUpload';

const TestFileUpload = () => {
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const handleFileUploaded = (data) => {
    console.log('Archivo(s) subido(s):', data);
    
    // Si es un solo archivo
    if (data.archivo) {
      setUploadedFiles(prev => [...prev, data]);
    }
    
    // Si son múltiples archivos
    if (data.archivos_subidos) {
      setUploadedFiles(prev => [...prev, ...data.archivos_subidos]);
    }
  };

  // Función para descargar archivo
  const downloadFile = async (fileId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/archivos/descargar/${fileId}`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `archivo-${fileId}`;
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        alert('Error descargando archivo');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión');
    }
  };

  // Función para eliminar archivo
  const deleteFile = async (fileId) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este archivo?')) {
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:5000/api/archivos/${fileId}`, {
        method: 'DELETE'
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert('Archivo eliminado correctamente');
        // Remover archivo de la lista local
        setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
      } else {
        alert(result.message || 'Error eliminando archivo');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión');
    }
  };

  // Función para obtener icono según extensión
  const getFileIcon = (filename) => {
    if (!filename) return '📁';
    
    const extension = filename.split('.').pop()?.toLowerCase();
    
    const icons = {
      pdf: '📄',
      doc: '📝',
      docx: '📝',
      txt: '📃',
      jpg: '🖼️',
      jpeg: '🖼️',
      png: '🖼️',
      gif: '🖼️',
      webp: '🖼️',
      mp4: '🎥',
      avi: '🎥',
      mov: '🎥',
      wmv: '🎥'
    };
    
    return icons[extension] || '📁';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🍊 Sistema de Archivos - Saber Citrícola
          </h1>
          <p className="text-gray-600">
            Prueba la funcionalidad de subida de archivos
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Columna izquierda - Subida de archivos */}
          <div className="space-y-6">
            {/* Un solo archivo */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                📄 Subir Un Archivo
              </h2>
              <FileUpload
                onFileUploaded={handleFileUploaded}
                accept="*/*"
                maxSize={50}
                categoria_id={1}
                tipo="documento"
              />
            </div>

            {/* Múltiples archivos */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                📁 Subir Múltiples Archivos
              </h2>
              <FileUpload
                onFileUploaded={handleFileUploaded}
                multiple={true}
                accept="*/*"
                maxSize={50}
                categoria_id={1}
                tipo="documento"
              />
            </div>

            {/* Solo imágenes */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                🖼️ Solo Imágenes
              </h2>
              <FileUpload
                onFileUploaded={handleFileUploaded}
                accept="image/*"
                maxSize={10}
                categoria_id={2}
                tipo="imagen"
              />
            </div>

            {/* Solo PDFs */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                📄 Solo PDFs
              </h2>
              <FileUpload
                onFileUploaded={handleFileUploaded}
                accept="application/pdf"
                maxSize={25}
                categoria_id={3}
                tipo="manual"
              />
            </div>
          </div>

          {/* Columna derecha - Lista de archivos subidos */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              📋 Archivos Subidos ({uploadedFiles.length})
            </h2>
            
            {uploadedFiles.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-4">📁</div>
                <p>No hay archivos subidos aún</p>
                <p className="text-sm">Sube algunos archivos para verlos aquí</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {uploadedFiles.map((file, index) => (
                  <div 
                    key={index}
                    className="flex items-center p-3 bg-gray-50 rounded-lg border"
                  >
                    <div className="text-2xl mr-3">
                      {getFileIcon(file.archivo?.nombre_original || file.nombre_original)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {file.archivo?.nombre_original || file.nombre_original}
                      </p>
                      <p className="text-sm text-gray-500">
                        ID: {file.id} • URL: {file.archivo?.url || file.url}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => downloadFile(file.id)}
                        className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                      >
                        📥 Descargar
                      </button>
                      <button
                        onClick={() => deleteFile(file.id)}
                        className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                      >
                        🗑️ Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sección de estadísticas */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            📊 Estadísticas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {uploadedFiles.length}
              </div>
              <div className="text-sm text-blue-600">Archivos Subidos</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {uploadedFiles.filter(f => (f.archivo?.nombre_original || f.nombre_original)?.match(/\.(jpg|jpeg|png|gif|webp)$/i)).length}
              </div>
              <div className="text-sm text-green-600">Imágenes</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {uploadedFiles.filter(f => (f.archivo?.nombre_original || f.nombre_original)?.match(/\.pdf$/i)).length}
              </div>
              <div className="text-sm text-red-600">PDFs</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {uploadedFiles.filter(f => (f.archivo?.nombre_original || f.nombre_original)?.match(/\.(mp4|avi|mov|wmv)$/i)).length}
              </div>
              <div className="text-sm text-purple-600">Videos</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestFileUpload;