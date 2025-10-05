-- 💬 migration_comentarios_upgrade.sql - Actualización de sistema de comentarios para documentos
-- Actualiza la tabla comentarios existente y crea las tablas complementarias

-- 🔄 Modificar la tabla comentarios existente para agregar los campos necesarios
ALTER TABLE comentarios ADD COLUMN comentario_padre_id INTEGER DEFAULT NULL;
ALTER TABLE comentarios ADD COLUMN nivel_anidacion INTEGER DEFAULT 0;
ALTER TABLE comentarios ADD COLUMN estado TEXT DEFAULT 'activo';
ALTER TABLE comentarios ADD COLUMN es_destacado INTEGER DEFAULT 0;
ALTER TABLE comentarios ADD COLUMN posicion_texto INTEGER DEFAULT NULL;
ALTER TABLE comentarios ADD COLUMN seleccion_texto TEXT DEFAULT NULL;
ALTER TABLE comentarios ADD COLUMN fecha_modificacion DATETIME DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE comentarios ADD COLUMN fecha_eliminacion DATETIME DEFAULT NULL;
ALTER TABLE comentarios ADD COLUMN ip_usuario TEXT DEFAULT NULL;
ALTER TABLE comentarios ADD COLUMN user_agent TEXT DEFAULT NULL;
ALTER TABLE comentarios ADD COLUMN moderado_por INTEGER DEFAULT NULL;
ALTER TABLE comentarios ADD COLUMN razon_moderacion TEXT DEFAULT NULL;

-- 🔄 Agregar alias para compatibilidad: fecha_creacion = created_at
-- Esto se maneja en el modelo, no necesitamos ALTER para esto

-- 🔄 Agregar alias para compatibilidad: contenido = comentario  
-- Esto se maneja en el modelo, no necesitamos ALTER para esto

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

-- 📝 Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_comentarios_documento_upgraded ON comentarios(documento_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comentarios_usuario_upgraded ON comentarios(usuario_id);
CREATE INDEX IF NOT EXISTS idx_comentarios_padre_upgraded ON comentarios(comentario_padre_id);
CREATE INDEX IF NOT EXISTS idx_comentarios_estado_upgraded ON comentarios(estado);
CREATE INDEX IF NOT EXISTS idx_reacciones_comentario ON reacciones_comentarios(comentario_id);
CREATE INDEX IF NOT EXISTS idx_reacciones_usuario ON reacciones_comentarios(usuario_id);
CREATE INDEX IF NOT EXISTS idx_notificaciones_usuario ON notificaciones_comentarios(usuario_destinatario_id, leida);
CREATE INDEX IF NOT EXISTS idx_reportes_estado ON reportes_comentarios(estado);
CREATE INDEX IF NOT EXISTS idx_moderacion_comentario ON moderacion_comentarios(comentario_id);

-- 📝 Configuración inicial
INSERT OR IGNORE INTO configuracion_comentarios (clave, valor, descripcion, tipo, categoria) VALUES 
('max_nivel_anidacion', '3', 'Máximo nivel de respuestas anidadas permitidas', 'number', 'limites'),
('comentarios_por_pagina', '10', 'Número de comentarios por página', 'number', 'paginacion'),
('moderacion_automatica', 'false', 'Activar moderación automática de comentarios', 'boolean', 'moderacion'),
('palabras_prohibidas', '[]', 'Lista de palabras prohibidas en comentarios', 'json', 'moderacion'),
('tiempo_edicion_limite', '300', 'Tiempo límite para editar comentarios (segundos)', 'number', 'limites'),
('notificaciones_activas', 'true', 'Activar notificaciones de comentarios', 'boolean', 'notificaciones');

-- 🎲 Datos de ejemplo compatibles con la estructura existente
-- Solo insertamos si no hay comentarios existentes
INSERT OR IGNORE INTO comentarios (
    documento_id, usuario_id, comentario, comentario_padre_id, nivel_anidacion, estado
) 
SELECT 1, 1, 'Excelente documento sobre citricultura. Muy útil para principiantes.', NULL, 0, 'activo'
WHERE NOT EXISTS (SELECT 1 FROM comentarios LIMIT 1);

INSERT OR IGNORE INTO comentarios (
    documento_id, usuario_id, comentario, comentario_padre_id, nivel_anidacion, estado
) 
SELECT 1, 2, '¿Podrían agregar información sobre variedades de limón específicas para Tucumán?', NULL, 0, 'activo'
WHERE NOT EXISTS (SELECT 1 FROM comentarios WHERE documento_id = 1 AND usuario_id = 2);

-- 📊 Inicializar estadísticas para documentos existentes
INSERT OR IGNORE INTO estadisticas_comentarios (documento_id, total_comentarios, comentarios_activos)
SELECT DISTINCT documento_id, 
       COUNT(*) as total_comentarios,
       COUNT(*) as comentarios_activos
FROM comentarios 
WHERE estado = 'activo'
GROUP BY documento_id;