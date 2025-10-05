-- 💬 migration_comentarios.sql - Sistema de comentarios para documentos
-- Permite comentarios anidados, likes, moderación y notificaciones

-- 💬 Tabla principal de comentarios
CREATE TABLE IF NOT EXISTS comentarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    documento_id INTEGER NOT NULL,
    usuario_id INTEGER NOT NULL,
    contenido TEXT NOT NULL,
    comentario_padre_id INTEGER, -- Para respuestas anidadas
    nivel_anidacion INTEGER DEFAULT 0, -- Para limitar niveles de respuesta
    estado TEXT DEFAULT 'activo', -- activo, oculto, moderado, eliminado
    es_destacado INTEGER DEFAULT 0, -- Para comentarios importantes
    posicion_texto INTEGER, -- Posición en el texto del documento (para comentarios inline)
    seleccion_texto TEXT, -- Texto seleccionado al comentar
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_eliminacion DATETIME,
    ip_usuario TEXT,
    user_agent TEXT,
    moderado_por INTEGER, -- ID del moderador si fue moderado
    razon_moderacion TEXT,
    FOREIGN KEY (documento_id) REFERENCES documentos(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (comentario_padre_id) REFERENCES comentarios(id) ON DELETE CASCADE,
    FOREIGN KEY (moderado_por) REFERENCES usuarios(id)
);

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

-- 🔗 Tabla de menciones en comentarios (@usuario)
CREATE TABLE IF NOT EXISTS menciones_comentarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    comentario_id INTEGER NOT NULL,
    usuario_mencionado_id INTEGER NOT NULL,
    posicion_inicio INTEGER DEFAULT 0,
    posicion_fin INTEGER DEFAULT 0,
    texto_mencion TEXT,
    notificacion_enviada INTEGER DEFAULT 0,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (comentario_id) REFERENCES comentarios(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_mencionado_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- 📝 Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_comentarios_documento ON comentarios(documento_id, fecha_creacion DESC);
CREATE INDEX IF NOT EXISTS idx_comentarios_usuario ON comentarios(usuario_id);
CREATE INDEX IF NOT EXISTS idx_comentarios_padre ON comentarios(comentario_padre_id);
CREATE INDEX IF NOT EXISTS idx_comentarios_estado ON comentarios(estado);
CREATE INDEX IF NOT EXISTS idx_reacciones_comentario ON reacciones_comentarios(comentario_id);
CREATE INDEX IF NOT EXISTS idx_reacciones_usuario ON reacciones_comentarios(usuario_id);
CREATE INDEX IF NOT EXISTS idx_notificaciones_usuario ON notificaciones_comentarios(usuario_destinatario_id, leida);
CREATE INDEX IF NOT EXISTS idx_reportes_estado ON reportes_comentarios(estado);
CREATE INDEX IF NOT EXISTS idx_menciones_usuario ON menciones_comentarios(usuario_mencionado_id);

-- 🎲 Datos de ejemplo
INSERT OR IGNORE INTO comentarios (
    id, documento_id, usuario_id, contenido, nivel_anidacion, estado
) VALUES
(1, 1, 2, 'Excelente documento sobre citricultura. Muy útil para principiantes.', 0, 'activo'),
(2, 1, 3, '¿Podrían agregar información sobre variedades de limón específicas para Tucumán?', 0, 'activo'),
(3, 1, 1, 'Gracias por el feedback. Vamos a incluir esa información en la próxima actualización.', 1, 'activo'),
(4, 2, 2, 'Las técnicas de poda mostradas aquí me ayudaron mucho en mi plantación.', 0, 'activo')

-- Respuesta anidada
UPDATE comentarios SET comentario_padre_id = 2 WHERE id = 3

-- Reacciones de ejemplo
INSERT OR IGNORE INTO reacciones_comentarios (
    comentario_id, usuario_id, tipo_reaccion
) VALUES
(1, 1, 'like'),
(1, 3, 'like'),
(2, 1, 'like'),
(4, 1, 'love'),
(4, 3, 'like')

-- Estadísticas iniciales
INSERT OR IGNORE INTO estadisticas_comentarios (
    documento_id, total_comentarios, total_respuestas, total_likes, ultimo_comentario_fecha
) VALUES
(1, 3, 1, 3, datetime('now')),
(2, 1, 0, 2, datetime('now'))