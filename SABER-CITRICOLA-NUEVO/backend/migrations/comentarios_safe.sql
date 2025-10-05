-- 💬 migration_comentarios_safe.sql - Crear solo las tablas complementarias
-- Esta migración asume que la tabla comentarios ya fue modificada

-- 👍 Tabla de reacciones a comentarios (likes, dislikes, etc.)
CREATE TABLE IF NOT EXISTS reacciones_comentarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    comentario_id INTEGER NOT NULL,
    usuario_id INTEGER NOT NULL,
    tipo_reaccion TEXT DEFAULT 'like', -- like, dislike, love, laugh, angry
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (comentario_id) REFERENCES comentarios(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    UNIQUE(comentario_id, usuario_id) -- Un usuario solo puede reaccionar una vez por comentario
);

-- 🔔 Tabla de notificaciones de comentarios
CREATE TABLE IF NOT EXISTS notificaciones_comentarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_destinatario_id INTEGER NOT NULL,
    comentario_id INTEGER NOT NULL,
    tipo_notificacion TEXT DEFAULT 'nuevo_comentario', -- nuevo_comentario, respuesta, mencion, reaccion
    leida INTEGER DEFAULT 0,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_lectura DATETIME,
    datos_adicionales TEXT, -- JSON con información extra
    FOREIGN KEY (usuario_destinatario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (comentario_id) REFERENCES comentarios(id) ON DELETE CASCADE
);

-- 📊 Tabla de estadísticas de comentarios por documento
CREATE TABLE IF NOT EXISTS estadisticas_comentarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    documento_id INTEGER NOT NULL,
    total_comentarios INTEGER DEFAULT 0,
    total_respuestas INTEGER DEFAULT 0,
    total_likes INTEGER DEFAULT 0,
    total_dislikes INTEGER DEFAULT 0,
    ultimo_comentario_fecha DATETIME,
    comentarios_activos INTEGER DEFAULT 0,
    comentarios_moderados INTEGER DEFAULT 0,
    promedio_reacciones REAL DEFAULT 0.0,
    ultima_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (documento_id) REFERENCES documentos(id) ON DELETE CASCADE,
    UNIQUE(documento_id)
);

-- 🚫 Tabla de reportes de comentarios
CREATE TABLE IF NOT EXISTS reportes_comentarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    comentario_id INTEGER NOT NULL,
    usuario_reportante_id INTEGER NOT NULL,
    razon TEXT NOT NULL, -- spam, contenido_inapropiado, acoso, desinformacion, otro
    descripcion TEXT,
    estado TEXT DEFAULT 'pendiente', -- pendiente, revisado, resuelto, rechazado
    revisado_por INTEGER, -- ID del moderador
    fecha_reporte DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_revision DATETIME,
    accion_tomada TEXT, -- ninguna, comentario_oculto, usuario_advertido, usuario_suspendido
    notas_moderador TEXT,
    FOREIGN KEY (comentario_id) REFERENCES comentarios(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_reportante_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (revisado_por) REFERENCES usuarios(id)
);

-- 🔧 Tabla de configuración de comentarios
CREATE TABLE IF NOT EXISTS configuracion_comentarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    clave TEXT UNIQUE NOT NULL,
    valor TEXT NOT NULL,
    descripcion TEXT,
    tipo TEXT DEFAULT 'string', -- string, number, boolean, json
    categoria TEXT DEFAULT 'general',
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 🛡️ Tabla de moderación de comentarios
CREATE TABLE IF NOT EXISTS moderacion_comentarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    comentario_id INTEGER NOT NULL,
    moderador_id INTEGER NOT NULL,
    accion TEXT NOT NULL, -- ocultar, destacar, eliminar, restaurar, advertir
    razon TEXT,
    estado_anterior TEXT,
    estado_nuevo TEXT,
    fecha_accion DATETIME DEFAULT CURRENT_TIMESTAMP,
    notas_internas TEXT,
    FOREIGN KEY (comentario_id) REFERENCES comentarios(id) ON DELETE CASCADE,
    FOREIGN KEY (moderador_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- 📝 Índices para optimizar consultas (solo si no existen)
CREATE INDEX IF NOT EXISTS idx_comentarios_documento_safe ON comentarios(documento_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comentarios_usuario_safe ON comentarios(usuario_id);
CREATE INDEX IF NOT EXISTS idx_comentarios_padre_safe ON comentarios(comentario_padre_id);
CREATE INDEX IF NOT EXISTS idx_comentarios_estado_safe ON comentarios(estado);
CREATE INDEX IF NOT EXISTS idx_reacciones_comentario ON reacciones_comentarios(comentario_id);
CREATE INDEX IF NOT EXISTS idx_reacciones_usuario ON reacciones_comentarios(usuario_id);
CREATE INDEX IF NOT EXISTS idx_notificaciones_usuario_comentarios ON notificaciones_comentarios(usuario_destinatario_id, leida);
CREATE INDEX IF NOT EXISTS idx_reportes_estado ON reportes_comentarios(estado);
CREATE INDEX IF NOT EXISTS idx_moderacion_comentario ON moderacion_comentarios(comentario_id);

-- 📝 Configuración inicial (solo si no existe)
INSERT OR IGNORE INTO configuracion_comentarios (clave, valor, descripcion, tipo, categoria) VALUES 
('max_nivel_anidacion', '3', 'Máximo nivel de respuestas anidadas permitidas', 'number', 'limites'),
('comentarios_por_pagina', '10', 'Número de comentarios por página', 'number', 'paginacion'),
('moderacion_automatica', 'false', 'Activar moderación automática de comentarios', 'boolean', 'moderacion'),
('palabras_prohibidas', '[]', 'Lista de palabras prohibidas en comentarios', 'json', 'moderacion'),
('tiempo_edicion_limite', '300', 'Tiempo límite para editar comentarios (segundos)', 'number', 'limites'),
('notificaciones_activas', 'true', 'Activar notificaciones de comentarios', 'boolean', 'notificaciones');

-- 📊 Inicializar estadísticas para documentos existentes (solo si no existen)
INSERT OR IGNORE INTO estadisticas_comentarios (documento_id, total_comentarios, comentarios_activos, ultimo_comentario_fecha)
SELECT DISTINCT documento_id, 
       COUNT(*) as total_comentarios,
       COUNT(*) as comentarios_activos,
       MAX(created_at) as ultimo_comentario_fecha
FROM comentarios 
WHERE (estado = 'activo' OR estado IS NULL)
GROUP BY documento_id;