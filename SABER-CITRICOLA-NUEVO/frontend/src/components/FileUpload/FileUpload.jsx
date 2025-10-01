// 📁 components/FileUpload/FileUpload.jsx - Componente para subir archivos
import { useState, useRef } from 'react';
import { useNotification } from '../../context/NotificationContext';
import './FileUpload.css';

const FileUpload = ({ 
  onFileUploaded, 
  multiple = false, 
  accept = '*/*',
  maxSize = 50, // MB
  categoria_id = null,
  tipo = 'documento'
}) => {
  const { showSuccess, showError, showLoading } = useNotification();
  const fileInputRef = useRef(null);
  
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // 📝 Tipos de archivo permitidos
  const acceptedTypes = {
    'image/*': ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    'application/pdf': ['pdf'],
    'video/*': ['mp4', 'avi', 'mov', 'wmv'],
    '*/*': ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf', 'mp4', 'avi', 'mov', 'wmv', 'txt', 'doc', 'docx']
  };

  // 🔍 Validar archivo
  const validateFile = (file) => {
    // Validar tamaño
    const maxSizeBytes = maxSize * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return `El archivo ${file.name} es muy grande. Máximo ${maxSize}MB permitido.`;
    }

    // Validar tipo
    const allowedExtensions = acceptedTypes[accept] || acceptedTypes['*/*'];
    const fileExtension = file.name.split('.').pop().toLowerCase();
    
    if (!allowedExtensions.includes(fileExtension)) {
      return `Tipo de archivo no permitido: .${fileExtension}. Tipos permitidos: ${allowedExtensions.join(', ')}`;
    }

    return null;
  };

  // 📤 Subir archivos
  const uploadFiles = async (files) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      // Validar archivos
      for (const file of files) {
        const error = validateFile(file);
        if (error) {
          showError(error);
          setUploading(false);
          return;
        }
      }

      const formData = new FormData();
      
      if (multiple) {
        // Múltiples archivos
        Array.from(files).forEach(file => {
          formData.append('archivos', file);
        });
        formData.append('categoria_id', categoria_id);
        formData.append('tipo', tipo);
      } else {
        // Un solo archivo
        formData.append('archivo', files[0]);
        formData.append('titulo', files[0].name);
        formData.append('descripcion', `Archivo subido: ${files[0].name}`);
        formData.append('categoria_id', categoria_id);
        formData.append('tipo', tipo);
      }

      showLoading('Subiendo archivo(s)...');

      // Simular progreso (ya que fetch no tiene progress nativo)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const endpoint = multiple ? '/api/archivos/subir-multiples' : '/api/archivos/subir';
      
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        body: formData
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const result = await response.json();

      if (result.success) {
        showSuccess(result.message);
        
        // Callback con los archivos subidos
        if (onFileUploaded) {
          onFileUploaded(result.data);
        }

        // Limpiar input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        showError(result.message || 'Error subiendo archivo(s)');
      }

    } catch (error) {
      console.error('Error subiendo archivos:', error);
      showError('Error de conexión al subir archivo(s)');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // 🎯 Manejar selección de archivos
  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (files) {
      uploadFiles(files);
    }
  };

  // 🎯 Manejar drag & drop
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      uploadFiles(e.dataTransfer.files);
    }
  };

  // 📱 Obtener icono según tipo de archivo
  const getFileIcon = () => {
    if (accept.includes('image')) return '🖼️';
    if (accept.includes('pdf')) return '📄';
    if (accept.includes('video')) return '🎥';
    return '📁';
  };

  return (
    <div className="file-upload-container">
      {/* Zona de drop */}
      <div
        className={`file-drop-zone ${dragActive ? 'drag-active' : ''} ${uploading ? 'uploading' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="file-drop-content">
          <div className="file-icon">
            {uploading ? '⏳' : getFileIcon()}
          </div>
          
          {uploading ? (
            <div className="upload-progress">
              <p>Subiendo archivo(s)... {uploadProgress}%</p>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          ) : (
            <>
              <h3>
                {multiple ? 'Subir Archivos' : 'Subir Archivo'}
              </h3>
              <p>
                Arrastra y suelta {multiple ? 'archivos' : 'un archivo'} aquí<br />
                o <span className="click-text">haz clic para seleccionar</span>
              </p>
              <div className="file-info">
                <small>
                  Tamaño máximo: {maxSize}MB<br />
                  Tipos permitidos: {acceptedTypes[accept]?.join(', ') || 'Todos'}
                </small>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Input oculto */}
      <input
        ref={fileInputRef}
        type="file"
        multiple={multiple}
        accept={accept}
        onChange={handleFileSelect}
        style={{ display: 'none' }}
        disabled={uploading}
      />
    </div>
  );
};

export default FileUpload;