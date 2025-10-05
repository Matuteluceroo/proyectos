-- 🔔 migration_notificaciones.sql - Sistema de notificaciones push y internas
-- Manejo completo de notificaciones en tiempo real con Web Push API

-- 🔔 Tabla principal de notificaciones
CREATE TABLE IF NOT EXISTS notificaciones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_destinatario_id INTEGER NOT NULL,
    usuario_emisor_id INTEGER, -- Puede ser NULL para notificaciones del sistema
    
    -- Contenido de la notificación
    titulo TEXT NOT NULL,
    mensaje TEXT NOT NULL,
    tipo TEXT DEFAULT 'info', -- info, success, warning, error, sistema, comentario, version, documento
    categoria TEXT DEFAULT 'general', -- general, documentos, comentarios, versiones, sistema, usuario
    
    -- Datos adicionales en JSON
    datos_adicionales TEXT, -- JSON con información extra (IDs, URLs, etc.)
    icono TEXT DEFAULT '🔔', -- Emoji o URL del icono
    imagen_url TEXT, -- URL de imagen para la notificación
    
    -- URLs de acción
    url_accion TEXT, -- URL a la que dirigir cuando se hace click
    url_imagen TEXT, -- URL de imagen para mostrar en la notificación
    accion_principal TEXT, -- Texto del botón principal (ej: "Ver documento")
    accion_secundaria TEXT, -- Texto del botón secundario (ej: "Marcar como leída")
    
    -- Estado de la notificación
    leida INTEGER DEFAULT 0, -- 0 = no leída, 1 = leída
    enviada_push INTEGER DEFAULT 0, -- 0 = no enviada por push, 1 = enviada
    estado TEXT DEFAULT 'activa', -- activa, eliminada, archivada
    
    -- Configuración de envío
    enviar_push INTEGER DEFAULT 1, -- Si debe enviarse por push
    enviar_email INTEGER DEFAULT 0, -- Si debe enviarse por email
    prioridad TEXT DEFAULT 'normal', -- baja, normal, alta, urgente
    
    -- Metadatos de tiempo
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_envio_push DATETIME, -- Cuándo se envió la notificación push
    fecha_lectura DATETIME, -- Cuándo fue leída
    fecha_expiracion DATETIME, -- Cuándo expira (para limpiar automáticamente)
    
    -- Información técnica
    device_token TEXT, -- Token del dispositivo para push
    push_response TEXT, -- Respuesta del servicio push (JSON)
    intentos_envio INTEGER DEFAULT 0, -- Número de intentos de envío
    ultimo_error TEXT, -- Último error en el envío
    
    FOREIGN KEY (usuario_destinatario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_emisor_id) REFERENCES usuarios(id) ON DELETE SET NULL
);

-- 📱 Tabla de suscripciones push
CREATE TABLE IF NOT EXISTS suscripciones_push (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL,
    
    -- Datos de la suscripción (Web Push API)
    endpoint TEXT NOT NULL, -- URL del endpoint del servicio push
    p256dh_key TEXT NOT NULL, -- Clave pública para encriptación
    auth_key TEXT NOT NULL, -- Clave de autenticación
    
    -- Información del dispositivo/navegador
    user_agent TEXT, -- User agent del navegador
    dispositivo TEXT, -- Tipo de dispositivo (desktop, mobile, tablet)
    navegador TEXT, -- Navegador (Chrome, Firefox, Safari, etc.)
    so TEXT, -- Sistema operativo
    
    -- Configuración de la suscripción
    activa INTEGER DEFAULT 1, -- Si la suscripción está activa
    tipos_permitidos TEXT DEFAULT '["todos"]', -- JSON con tipos de notificaciones permitidas
    categorias_permitidas TEXT DEFAULT '["todos"]', -- JSON con categorías permitidas
    
    -- Configuración de horarios
    notificar_fuera_horario INTEGER DEFAULT 0, -- Si notificar fuera de horario laboral
    hora_inicio TEXT DEFAULT '09:00', -- Hora de inicio para notificaciones
    hora_fin TEXT DEFAULT '18:00', -- Hora de fin para notificaciones
    dias_permitidos TEXT DEFAULT '["lunes","martes","miercoles","jueves","viernes"]', -- Días permitidos
    
    -- Metadatos
    fecha_suscripcion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_ultima_notificacion DATETIME, -- Última vez que se envió una notificación
    fecha_desactivacion DATETIME, -- Cuándo se desactivó (si aplica)
    total_notificaciones_enviadas INTEGER DEFAULT 0,
    
    -- Control de errores
    errores_consecutivos INTEGER DEFAULT 0, -- Errores consecutivos (para desactivar automáticamente)
    ultimo_error DATETIME, -- Fecha del último error
    
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    UNIQUE(usuario_id, endpoint) -- Un usuario puede tener múltiples dispositivos pero no duplicar endpoints
);

-- 📊 Tabla de plantillas de notificaciones
CREATE TABLE IF NOT EXISTS plantillas_notificaciones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    -- Identificación de la plantilla
    codigo TEXT UNIQUE NOT NULL, -- Código único para identificar la plantilla
    nombre TEXT NOT NULL,
    descripcion TEXT,
    categoria TEXT DEFAULT 'general',
    
    -- Contenido de la plantilla
    titulo_template TEXT NOT NULL, -- Plantilla del título con variables {{variable}}
    mensaje_template TEXT NOT NULL, -- Plantilla del mensaje con variables {{variable}}
    icono_default TEXT DEFAULT '🔔',
    imagen_url_template TEXT, -- URL de imagen con variables
    
    -- Configuración por defecto
    tipo_default TEXT DEFAULT 'info',
    prioridad_default TEXT DEFAULT 'normal',
    enviar_push_default INTEGER DEFAULT 1,
    enviar_email_default INTEGER DEFAULT 0,
    url_accion_template TEXT, -- Template de URL de acción
    
    -- Variables esperadas (JSON)
    variables_esperadas TEXT, -- JSON con lista de variables que acepta la plantilla
    ejemplo_variables TEXT, -- JSON con ejemplo de variables para testing
    
    -- Estado y metadatos
    activa INTEGER DEFAULT 1,
    version INTEGER DEFAULT 1,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    creado_por INTEGER,
    
    FOREIGN KEY (creado_por) REFERENCES usuarios(id) ON DELETE SET NULL
);

-- 📈 Tabla de estadísticas de notificaciones
CREATE TABLE IF NOT EXISTS estadisticas_notificaciones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fecha DATE NOT NULL, -- Fecha de las estadísticas (YYYY-MM-DD)
    
    -- Contadores generales
    total_enviadas INTEGER DEFAULT 0,
    total_leidas INTEGER DEFAULT 0,
    total_push_exitosas INTEGER DEFAULT 0,
    total_push_fallidas INTEGER DEFAULT 0,
    total_emails_enviados INTEGER DEFAULT 0,
    
    -- Por tipo
    total_info INTEGER DEFAULT 0,
    total_success INTEGER DEFAULT 0,
    total_warning INTEGER DEFAULT 0,
    total_error INTEGER DEFAULT 0,
    total_sistema INTEGER DEFAULT 0,
    
    -- Por categoría
    total_documentos INTEGER DEFAULT 0,
    total_comentarios INTEGER DEFAULT 0,
    total_versiones INTEGER DEFAULT 0,
    total_usuarios INTEGER DEFAULT 0,
    
    -- Métricas de engagement
    tasa_lectura REAL DEFAULT 0.0, -- Porcentaje de notificaciones leídas
    tiempo_promedio_lectura INTEGER DEFAULT 0, -- Tiempo promedio hasta lectura (minutos)
    suscripciones_activas INTEGER DEFAULT 0,
    suscripciones_nuevas INTEGER DEFAULT 0,
    suscripciones_canceladas INTEGER DEFAULT 0,
    
    -- Información de rendimiento
    tiempo_promedio_envio INTEGER DEFAULT 0, -- Tiempo promedio de envío (milisegundos)
    errores_por_dispositivo TEXT, -- JSON con errores agrupados por tipo de dispositivo
    
    fecha_calculo DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(fecha)
);

-- 🔄 Tabla de cola de notificaciones (para procesamiento asíncrono)
CREATE TABLE IF NOT EXISTS cola_notificaciones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    notificacion_id INTEGER NOT NULL,
    
    -- Estado de procesamiento
    estado TEXT DEFAULT 'pendiente', -- pendiente, procesando, enviada, fallida, reintentando
    prioridad INTEGER DEFAULT 1, -- 1 = baja, 2 = normal, 3 = alta, 4 = urgente
    
    -- Control de reintentos
    intentos INTEGER DEFAULT 0,
    max_intentos INTEGER DEFAULT 3,
    proximo_intento DATETIME,
    
    -- Información de procesamiento
    fecha_cola DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_procesamiento DATETIME,
    fecha_completado DATETIME,
    worker_id TEXT, -- ID del worker que está procesando
    
    -- Datos del error (si aplica)
    codigo_error TEXT,
    mensaje_error TEXT,
    stack_trace TEXT,
    
    FOREIGN KEY (notificacion_id) REFERENCES notificaciones(id) ON DELETE CASCADE
);

-- 🎯 Tabla de acciones de notificaciones (tracking de clicks)
CREATE TABLE IF NOT EXISTS acciones_notificaciones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    notificacion_id INTEGER NOT NULL,
    usuario_id INTEGER NOT NULL,
    
    -- Información de la acción
    tipo_accion TEXT NOT NULL, -- click, view, dismiss, action_primary, action_secondary
    timestamp_accion DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    -- Contexto de la acción
    url_destino TEXT, -- URL a la que se dirigió el usuario
    tiempo_en_notificacion INTEGER, -- Tiempo que estuvo visible la notificación (ms)
    dispositivo TEXT, -- Dispositivo desde el que se realizó la acción
    ubicacion_click TEXT, -- Dónde hizo click (título, mensaje, botón, etc.)
    
    -- Datos adicionales
    datos_contexto TEXT, -- JSON con información adicional
    user_agent TEXT,
    ip_usuario TEXT,
    
    FOREIGN KEY (notificacion_id) REFERENCES notificaciones(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- 📝 Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_notificaciones_usuario ON notificaciones(usuario_destinatario_id, fecha_creacion DESC);
CREATE INDEX IF NOT EXISTS idx_notificaciones_leida ON notificaciones(leida, fecha_creacion DESC);
CREATE INDEX IF NOT EXISTS idx_notificaciones_tipo ON notificaciones(tipo, categoria);
CREATE INDEX IF NOT EXISTS idx_notificaciones_estado ON notificaciones(estado, prioridad);
CREATE INDEX IF NOT EXISTS idx_suscripciones_usuario ON suscripciones_push(usuario_id);
CREATE INDEX IF NOT EXISTS idx_suscripciones_activa ON suscripciones_push(activa, fecha_suscripcion DESC);
CREATE INDEX IF NOT EXISTS idx_cola_estado ON cola_notificaciones(estado, prioridad DESC, fecha_cola);
CREATE INDEX IF NOT EXISTS idx_cola_reintentos ON cola_notificaciones(estado, proximo_intento);
CREATE INDEX IF NOT EXISTS idx_estadisticas_fecha ON estadisticas_notificaciones(fecha DESC);
CREATE INDEX IF NOT EXISTS idx_acciones_notificacion ON acciones_notificaciones(notificacion_id, tipo_accion);

-- 🎲 Plantillas de notificaciones por defecto
INSERT OR IGNORE INTO plantillas_notificaciones (
    codigo, nombre, descripcion, categoria, titulo_template, mensaje_template, 
    icono_default, tipo_default, variables_esperadas, ejemplo_variables
) VALUES 
('nuevo_comentario', 'Nuevo Comentario', 'Notificación cuando alguien comenta en un documento', 'comentarios',
 'Nuevo comentario en {{documento_titulo}}', '{{usuario_nombre}} ha comentado: "{{comentario_preview}}"',
 '💬', 'info', '["documento_titulo", "usuario_nombre", "comentario_preview", "documento_id"]',
 '{"documento_titulo": "Guía de Citricultura", "usuario_nombre": "Juan Pérez", "comentario_preview": "Excelente información...", "documento_id": "123"}'),

('respuesta_comentario', 'Respuesta a Comentario', 'Notificación cuando alguien responde a tu comentario', 'comentarios',
 'Respuesta a tu comentario', '{{usuario_nombre}} respondió a tu comentario en {{documento_titulo}}',
 '↩️', 'info', '["documento_titulo", "usuario_nombre", "documento_id", "comentario_id"]',
 '{"documento_titulo": "Técnicas de Poda", "usuario_nombre": "María García", "documento_id": "124", "comentario_id": "456"}'),

('nueva_version', 'Nueva Versión de Documento', 'Notificación cuando se actualiza un documento', 'versiones',
 'Nueva versión: {{documento_titulo}}', 'Se ha creado la versión {{numero_version}} del documento {{documento_titulo}}',
 '📄', 'info', '["documento_titulo", "numero_version", "usuario_editor", "documento_id"]',
 '{"documento_titulo": "Manual de Fertilización", "numero_version": "v2.1", "usuario_editor": "Dr. López", "documento_id": "125"}'),

('documento_restaurado', 'Documento Restaurado', 'Notificación cuando se restaura una versión de documento', 'versiones',
 'Documento restaurado: {{documento_titulo}}', 'Se ha restaurado la versión {{version_restaurada}} del documento {{documento_titulo}}',
 '🔙', 'warning', '["documento_titulo", "version_restaurada", "usuario_restaurador", "documento_id"]',
 '{"documento_titulo": "Guía de Plagas", "version_restaurada": "v1.5", "usuario_restaurador": "Admin", "documento_id": "126"}'),

('nuevo_documento', 'Nuevo Documento', 'Notificación cuando se publica un nuevo documento', 'documentos',
 'Nuevo documento disponible', 'Se ha publicado: {{documento_titulo}} en la categoría {{categoria}}',
 '📄', 'success', '["documento_titulo", "categoria", "autor_nombre", "documento_id"]',
 '{"documento_titulo": "Control de Enfermedades", "categoria": "Fitosanidad", "autor_nombre": "Ing. Rodríguez", "documento_id": "127"}'),

('sistema_mantenimiento', 'Mantenimiento del Sistema', 'Notificación de mantenimiento programado', 'sistema',
 'Mantenimiento programado', 'El sistema estará en mantenimiento el {{fecha_mantenimiento}} de {{hora_inicio}} a {{hora_fin}}',
 '⚙️', 'warning', '["fecha_mantenimiento", "hora_inicio", "hora_fin", "duracion_estimada"]',
 '{"fecha_mantenimiento": "25 de octubre", "hora_inicio": "02:00", "hora_fin": "04:00", "duracion_estimada": "2 horas"}');

-- 🎲 Datos de ejemplo
INSERT OR IGNORE INTO notificaciones (
    usuario_destinatario_id, usuario_emisor_id, titulo, mensaje, tipo, categoria,
    datos_adicionales, url_accion, icono, prioridad
) VALUES 
(1, 2, 'Nuevo comentario en documento', 'Juan Pérez ha comentado en "Guía de Citricultura Básica"', 
 'info', 'comentarios', '{"documento_id": 1, "comentario_id": 1}', '/documento/1#comentarios', '💬', 'normal'),

(2, 1, 'Nueva versión disponible', 'Se ha actualizado el documento "Técnicas de Poda" a la versión v1.1',
 'success', 'versiones', '{"documento_id": 2, "version_id": 3}', '/documento/2/versiones', '📄', 'normal'),

(1, NULL, 'Bienvenido al sistema', 'Te damos la bienvenida a Saber Citrícola. Explora los documentos disponibles.',
 'success', 'sistema', '{}', '/dashboard', '🎉', 'baja');

-- Estadísticas iniciales
INSERT OR IGNORE INTO estadisticas_notificaciones (
    fecha, total_enviadas, total_leidas, total_push_exitosas, suscripciones_activas
) VALUES 
(date('now'), 3, 1, 2, 0);