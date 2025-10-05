-- 📚 migration_versiones.sql - Sistema de historial de versiones para documentos
-- Permite tracking de cambios, comparación de versiones y restauración

-- 📄 Tabla de versiones de documentos
CREATE TABLE IF NOT EXISTS versiones_documentos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    documento_id INTEGER NOT NULL,
    numero_version TEXT NOT NULL, -- v1.0, v1.1, v2.0, etc.
    usuario_id INTEGER NOT NULL, -- Quien hizo la modificación
    tipo_cambio TEXT DEFAULT 'edicion', -- creacion, edicion, restauracion, bifurcacion
    
    -- Contenido de la versión
    titulo TEXT NOT NULL,
    descripcion TEXT,
    contenido TEXT,
    keywords TEXT,
    tags TEXT,
    nivel_acceso TEXT DEFAULT 'publico',
    estado TEXT DEFAULT 'activo',
    
    -- Metadatos de la versión
    tamano_contenido INTEGER DEFAULT 0, -- Tamaño en caracteres
    hash_contenido TEXT, -- Hash para detectar cambios
    comentario_version TEXT, -- Descripción del cambio realizado
    cambios_principales TEXT, -- JSON con resumen de cambios
    
    -- Archivo asociado (si tiene)
    archivo_url TEXT,
    archivo_nombre_original TEXT,
    archivo_mimetype TEXT,
    archivo_tamano INTEGER,
    archivo_hash TEXT,
    
    -- Control de tiempo
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_publicacion DATETIME,
    es_version_actual INTEGER DEFAULT 0, -- Solo una versión puede ser actual
    es_borrador INTEGER DEFAULT 0,
    
    -- Estadísticas de la versión
    vistas INTEGER DEFAULT 0,
    descargas INTEGER DEFAULT 0,
    tiempo_edicion INTEGER DEFAULT 0, -- Tiempo empleado en editar (en minutos)
    
    -- Metadatos adicionales
    ip_usuario TEXT,
    user_agent TEXT,
    ubicacion_geografica TEXT,
    
    FOREIGN KEY (documento_id) REFERENCES documentos(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    UNIQUE(documento_id, numero_version)
);

-- 🔄 Tabla de comparaciones entre versiones
CREATE TABLE IF NOT EXISTS comparaciones_versiones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    version_origen_id INTEGER NOT NULL,
    version_destino_id INTEGER NOT NULL,
    usuario_solicitante_id INTEGER NOT NULL,
    
    -- Resultados de la comparación
    diferencias_titulo TEXT, -- JSON con diferencias en título
    diferencias_descripcion TEXT, -- JSON con diferencias en descripción
    diferencias_contenido TEXT, -- JSON con diferencias línea por línea
    diferencias_metadata TEXT, -- JSON con cambios en metadatos
    diferencias_archivo TEXT, -- JSON con información del archivo
    
    -- Estadísticas de la comparación
    total_adiciones INTEGER DEFAULT 0,
    total_eliminaciones INTEGER DEFAULT 0,
    total_modificaciones INTEGER DEFAULT 0,
    porcentaje_cambio REAL DEFAULT 0.0,
    similitud_contenido REAL DEFAULT 0.0,
    
    -- Procesamiento
    estado_procesamiento TEXT DEFAULT 'pendiente', -- pendiente, procesando, completado, error
    tiempo_procesamiento INTEGER DEFAULT 0, -- Tiempo en milisegundos
    
    fecha_solicitud DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_completado DATETIME,
    
    FOREIGN KEY (version_origen_id) REFERENCES versiones_documentos(id) ON DELETE CASCADE,
    FOREIGN KEY (version_destino_id) REFERENCES versiones_documentos(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_solicitante_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- 🔙 Tabla de restauraciones de versiones
CREATE TABLE IF NOT EXISTS restauraciones_versiones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    documento_id INTEGER NOT NULL,
    version_restaurada_id INTEGER NOT NULL,
    version_anterior_id INTEGER NOT NULL,
    usuario_id INTEGER NOT NULL,
    
    -- Información de la restauración
    razon_restauracion TEXT,
    mantener_version_anterior INTEGER DEFAULT 1, -- Si crear backup de la versión actual
    tipo_restauracion TEXT DEFAULT 'completa', -- completa, parcial, experimental
    
    -- Estado de la restauración
    estado TEXT DEFAULT 'completado', -- completado, revertido, fallido
    backup_creado INTEGER DEFAULT 0,
    conflictos_detectados TEXT, -- JSON con conflictos encontrados
    
    -- Metadatos
    fecha_restauracion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_reversion DATETIME, -- Si se revierte la restauración
    ip_usuario TEXT,
    notas_adicionales TEXT,
    
    FOREIGN KEY (documento_id) REFERENCES documentos(id) ON DELETE CASCADE,
    FOREIGN KEY (version_restaurada_id) REFERENCES versiones_documentos(id) ON DELETE CASCADE,
    FOREIGN KEY (version_anterior_id) REFERENCES versiones_documentos(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- 📊 Tabla de estadísticas de versiones por documento
CREATE TABLE IF NOT EXISTS estadisticas_versiones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    documento_id INTEGER NOT NULL,
    
    -- Contadores generales
    total_versiones INTEGER DEFAULT 0,
    total_borradores INTEGER DEFAULT 0,
    total_restauraciones INTEGER DEFAULT 0,
    total_comparaciones INTEGER DEFAULT 0,
    
    -- Versión actual
    version_actual_id INTEGER,
    numero_version_actual TEXT,
    fecha_ultima_modificacion DATETIME,
    ultimo_editor_id INTEGER,
    
    -- Estadísticas de actividad
    promedio_tiempo_entre_versiones REAL DEFAULT 0.0, -- En horas
    version_mas_vista_id INTEGER,
    version_mas_descargada_id INTEGER,
    total_editores_unicos INTEGER DEFAULT 0,
    
    -- Análisis de contenido
    crecimiento_contenido_total INTEGER DEFAULT 0, -- Diferencia entre primera y última versión
    version_mas_grande_id INTEGER,
    version_mas_pequena_id INTEGER,
    promedio_cambios_por_version REAL DEFAULT 0.0,
    
    -- Control de calidad
    versiones_con_errores INTEGER DEFAULT 0,
    tiempo_total_edicion INTEGER DEFAULT 0, -- En minutos
    frecuencia_edicion TEXT DEFAULT 'baja', -- baja, media, alta
    
    ultima_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (documento_id) REFERENCES documentos(id) ON DELETE CASCADE,
    FOREIGN KEY (version_actual_id) REFERENCES versiones_documentos(id) ON DELETE SET NULL,
    FOREIGN KEY (ultimo_editor_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (version_mas_vista_id) REFERENCES versiones_documentos(id) ON DELETE SET NULL,
    FOREIGN KEY (version_mas_descargada_id) REFERENCES versiones_documentos(id) ON DELETE SET NULL,
    FOREIGN KEY (version_mas_grande_id) REFERENCES versiones_documentos(id) ON DELETE SET NULL,
    FOREIGN KEY (version_mas_pequena_id) REFERENCES versiones_documentos(id) ON DELETE SET NULL,
    UNIQUE(documento_id)
);

-- 🏷️ Tabla de etiquetas de versiones
CREATE TABLE IF NOT EXISTS etiquetas_versiones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    version_id INTEGER NOT NULL,
    etiqueta TEXT NOT NULL, -- stable, beta, draft, reviewed, approved, deprecated
    descripcion TEXT,
    color TEXT DEFAULT '#3b82f6', -- Color hex para mostrar en UI
    icono TEXT DEFAULT '🏷️', -- Emoji o clase de icono
    usuario_asignador_id INTEGER NOT NULL,
    fecha_asignacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_expiracion DATETIME, -- Para etiquetas temporales
    es_automatica INTEGER DEFAULT 0, -- Si fue asignada automáticamente
    
    FOREIGN KEY (version_id) REFERENCES versiones_documentos(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_asignador_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    UNIQUE(version_id, etiqueta)
);

-- 📝 Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_versiones_documento ON versiones_documentos(documento_id, fecha_creacion DESC);
CREATE INDEX IF NOT EXISTS idx_versiones_usuario ON versiones_documentos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_versiones_numero ON versiones_documentos(numero_version);
CREATE INDEX IF NOT EXISTS idx_versiones_actual ON versiones_documentos(documento_id, es_version_actual);
CREATE INDEX IF NOT EXISTS idx_versiones_hash ON versiones_documentos(hash_contenido);
CREATE INDEX IF NOT EXISTS idx_comparaciones_versiones ON comparaciones_versiones(version_origen_id, version_destino_id);
CREATE INDEX IF NOT EXISTS idx_restauraciones_documento ON restauraciones_versiones(documento_id, fecha_restauracion DESC);
CREATE INDEX IF NOT EXISTS idx_etiquetas_version ON etiquetas_versiones(version_id);

-- 🎲 Datos de ejemplo (crear versiones iniciales para documentos existentes)
INSERT OR IGNORE INTO versiones_documentos (
    documento_id, numero_version, usuario_id, tipo_cambio, titulo, descripcion, contenido, es_version_actual
) VALUES 
(1, 'v1.0', 1, 'creacion', 'Guía de Citricultura Básica', 'Conceptos fundamentales para el cultivo de cítricos', 'Contenido inicial del documento sobre citricultura...', 1),
(2, 'v1.0', 2, 'creacion', 'Técnicas de Poda', 'Métodos efectivos para la poda de árboles cítricos', 'Contenido sobre técnicas de poda...', 1);

-- Crear una segunda versión para el primer documento
INSERT OR IGNORE INTO versiones_documentos (
    documento_id, numero_version, usuario_id, tipo_cambio, titulo, descripcion, contenido, es_version_actual, comentario_version
) VALUES 
(1, 'v1.1', 1, 'edicion', 'Guía de Citricultura Básica', 'Conceptos fundamentales para el cultivo de cítricos - Actualizada', 'Contenido actualizado con nuevas técnicas de citricultura...', 0, 'Agregada información sobre variedades de limón específicas para Tucumán');

-- Actualizar la versión actual del primer documento
UPDATE versiones_documentos SET es_version_actual = 0 WHERE documento_id = 1 AND numero_version = 'v1.0';
UPDATE versiones_documentos SET es_version_actual = 1 WHERE documento_id = 1 AND numero_version = 'v1.1';

-- Estadísticas iniciales
INSERT OR IGNORE INTO estadisticas_versiones (
    documento_id, total_versiones, version_actual_id, numero_version_actual, fecha_ultima_modificacion, ultimo_editor_id
) VALUES 
(1, 2, 3, 'v1.1', datetime('now'), 1),
(2, 1, 2, 'v1.0', datetime('now'), 2);

-- Etiquetas de ejemplo
INSERT OR IGNORE INTO etiquetas_versiones (
    version_id, etiqueta, descripcion, color, icono, usuario_asignador_id
) VALUES 
(1, 'stable', 'Versión estable y probada', '#10b981', '✅', 1),
(2, 'stable', 'Versión estable y probada', '#10b981', '✅', 2),
(3, 'stable', 'Versión actualizada y estable', '#10b981', '✅', 1);