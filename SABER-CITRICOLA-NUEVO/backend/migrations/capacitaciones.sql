-- 🎓 migration_capacitaciones.sql - Migración para módulos de capacitación
-- Sistema de capacitación estructurada para Saber Citrícola

-- 📚 Tabla de módulos de capacitación
CREATE TABLE IF NOT EXISTS modulos_capacitacion (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo TEXT NOT NULL,
    descripcion TEXT,
    objetivo TEXT,
    nivel TEXT NOT NULL DEFAULT 'principiante', -- principiante, intermedio, avanzado
    duracion_estimada INTEGER NOT NULL DEFAULT 0, -- minutos
    icono TEXT NOT NULL DEFAULT '🎓',
    color TEXT NOT NULL DEFAULT '#3b82f6',
    imagen_portada TEXT,
    categoria_id INTEGER,
    autor_id INTEGER NOT NULL,
    estado TEXT NOT NULL DEFAULT 'borrador', -- borrador, publicado, archivado
    requisitos TEXT, -- prerrequisitos como JSON
    tags TEXT, -- tags separados por comas
    orden_visualizacion INTEGER NOT NULL DEFAULT 0,
    es_obligatorio INTEGER NOT NULL DEFAULT 0,
    certificado_disponible INTEGER NOT NULL DEFAULT 1,
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_publicacion DATETIME,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id),
    FOREIGN KEY (autor_id) REFERENCES usuarios(id)
);

-- 📖 Tabla de lecciones dentro de los módulos
CREATE TABLE IF NOT EXISTS lecciones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    modulo_id INTEGER NOT NULL,
    titulo TEXT NOT NULL,
    descripcion TEXT,
    contenido TEXT, -- contenido HTML de la lección
    tipo TEXT DEFAULT 'texto', -- texto, video, audio, interactivo
    url_recurso TEXT, -- URL de video, audio, etc.
    duracion_minutos INTEGER DEFAULT 5,
    orden INTEGER NOT NULL,
    es_obligatoria INTEGER DEFAULT 1,
    puntos_otorgados INTEGER DEFAULT 10,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (modulo_id) REFERENCES modulos_capacitacion(id) ON DELETE CASCADE
);

-- 🎯 Tabla de evaluaciones por lección
CREATE TABLE IF NOT EXISTS evaluaciones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    leccion_id INTEGER,
    modulo_id INTEGER,
    titulo TEXT NOT NULL,
    descripcion TEXT,
    tipo TEXT DEFAULT 'quiz', -- quiz, ensayo, practica
    tiempo_limite INTEGER, -- minutos, NULL = sin límite
    intentos_permitidos INTEGER DEFAULT 3,
    puntuacion_minima REAL DEFAULT 70.00, -- porcentaje mínimo para aprobar
    es_obligatoria INTEGER DEFAULT 1,
    orden INTEGER DEFAULT 0,
    instrucciones TEXT,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (leccion_id) REFERENCES lecciones(id) ON DELETE CASCADE,
    FOREIGN KEY (modulo_id) REFERENCES modulos_capacitacion(id) ON DELETE CASCADE
);

-- ❓ Tabla de preguntas para evaluaciones
CREATE TABLE IF NOT EXISTS preguntas_evaluacion (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    evaluacion_id INTEGER NOT NULL,
    pregunta TEXT NOT NULL,
    tipo TEXT DEFAULT 'multiple_choice', -- multiple_choice, verdadero_falso, texto_libre, completar
    opciones TEXT, -- JSON con opciones para multiple choice
    respuesta_correcta TEXT, -- respuesta correcta o criterios de evaluación
    puntos REAL DEFAULT 1.00,
    explicacion TEXT, -- explicación de la respuesta correcta
    orden INTEGER DEFAULT 0,
    es_obligatoria INTEGER DEFAULT 1,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (evaluacion_id) REFERENCES evaluaciones(id) ON DELETE CASCADE
);

-- 📊 Tabla de progreso de usuarios en módulos
CREATE TABLE IF NOT EXISTS progreso_modulos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL,
    modulo_id INTEGER NOT NULL,
    fecha_inicio DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_ultima_actividad DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_completado DATETIME,
    porcentaje_completado REAL DEFAULT 0.00,
    tiempo_total_minutos INTEGER DEFAULT 0,
    puntuacion_total REAL DEFAULT 0.00,
    puntuacion_maxima REAL DEFAULT 0.00,
    estado TEXT DEFAULT 'en_progreso', -- no_iniciado, en_progreso, completado, abandonado
    certificado_obtenido INTEGER DEFAULT 0,
    fecha_certificado DATETIME,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (modulo_id) REFERENCES modulos_capacitacion(id) ON DELETE CASCADE,
    UNIQUE(usuario_id, modulo_id)
);

-- 📖 Tabla de progreso en lecciones específicas
CREATE TABLE IF NOT EXISTS progreso_lecciones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL,
    leccion_id INTEGER NOT NULL,
    modulo_id INTEGER NOT NULL,
    fecha_inicio DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_completado DATETIME,
    tiempo_invertido_minutos INTEGER DEFAULT 0,
    puntuacion REAL DEFAULT 0.00,
    estado TEXT DEFAULT 'no_iniciado', -- no_iniciado, en_progreso, completado
    intentos INTEGER DEFAULT 0,
    ultima_posicion INTEGER DEFAULT 0, -- para reanudar donde se quedó
    notas_usuario TEXT, -- notas personales del usuario
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (leccion_id) REFERENCES lecciones(id) ON DELETE CASCADE,
    FOREIGN KEY (modulo_id) REFERENCES modulos_capacitacion(id) ON DELETE CASCADE,
    UNIQUE(usuario_id, leccion_id)
);

-- 🎯 Tabla de resultados de evaluaciones
CREATE TABLE IF NOT EXISTS resultados_evaluaciones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL,
    evaluacion_id INTEGER NOT NULL,
    leccion_id INTEGER,
    modulo_id INTEGER NOT NULL,
    fecha_inicio DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_finalizacion DATETIME,
    puntuacion_obtenida REAL DEFAULT 0.00,
    puntuacion_maxima REAL DEFAULT 0.00,
    porcentaje REAL DEFAULT 0.00,
    tiempo_empleado INTEGER DEFAULT 0, -- minutos
    aprobado INTEGER DEFAULT 0,
    intento_numero INTEGER DEFAULT 1,
    respuestas TEXT, -- JSON con las respuestas del usuario
    retroalimentacion TEXT,
    estado TEXT DEFAULT 'en_progreso', -- en_progreso, completado, abandonado
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (evaluacion_id) REFERENCES evaluaciones(id) ON DELETE CASCADE,
    FOREIGN KEY (leccion_id) REFERENCES lecciones(id) ON DELETE SET NULL,
    FOREIGN KEY (modulo_id) REFERENCES modulos_capacitacion(id) ON DELETE CASCADE
);

-- 🏆 Tabla de certificados obtenidos
CREATE TABLE IF NOT EXISTS certificados (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL,
    modulo_id INTEGER NOT NULL,
    fecha_emision DATETIME DEFAULT CURRENT_TIMESTAMP,
    codigo_verificacion TEXT UNIQUE NOT NULL,
    puntuacion_final REAL DEFAULT 0.00,
    tiempo_total_horas REAL DEFAULT 0.00,
    valido_hasta DATETIME,
    url_certificado TEXT, -- URL del PDF generado
    datos_adicionales TEXT, -- JSON con información extra
    estado TEXT DEFAULT 'activo', -- activo, revocado, expirado
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (modulo_id) REFERENCES modulos_capacitacion(id) ON DELETE CASCADE,
    UNIQUE(usuario_id, modulo_id)
);

-- 📈 Tabla de estadísticas de capacitación
CREATE TABLE IF NOT EXISTS estadisticas_capacitacion (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    modulo_id INTEGER NOT NULL,
    total_inscripciones INTEGER DEFAULT 0,
    total_completados INTEGER DEFAULT 0,
    total_abandonados INTEGER DEFAULT 0,
    promedio_tiempo_completion REAL DEFAULT 0.00,
    promedio_puntuacion REAL DEFAULT 0.00,
    tasa_aprobacion REAL DEFAULT 0.00,
    ultima_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (modulo_id) REFERENCES modulos_capacitacion(id) ON DELETE CASCADE,
    UNIQUE(modulo_id)
);

-- 🔗 Tabla de prerrequisitos entre módulos
CREATE TABLE IF NOT EXISTS prerrequisitos_modulos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    modulo_id INTEGER NOT NULL, -- módulo que tiene prerrequisito
    prerrequisito_modulo_id INTEGER NOT NULL, -- módulo requerido
    es_obligatorio INTEGER DEFAULT 1,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (modulo_id) REFERENCES modulos_capacitacion(id) ON DELETE CASCADE,
    FOREIGN KEY (prerrequisito_modulo_id) REFERENCES modulos_capacitacion(id) ON DELETE CASCADE,
    UNIQUE(modulo_id, prerrequisito_modulo_id)
);

-- 📝 Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_modulos_estado ON modulos_capacitacion(estado);
CREATE INDEX IF NOT EXISTS idx_modulos_categoria ON modulos_capacitacion(categoria_id);
CREATE INDEX IF NOT EXISTS idx_modulos_autor ON modulos_capacitacion(autor_id);
CREATE INDEX IF NOT EXISTS idx_lecciones_modulo ON lecciones(modulo_id, orden);
CREATE INDEX IF NOT EXISTS idx_progreso_usuario ON progreso_modulos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_progreso_modulo ON progreso_modulos(modulo_id);
CREATE INDEX IF NOT EXISTS idx_progreso_lecciones_usuario ON progreso_lecciones(usuario_id, modulo_id);
CREATE INDEX IF NOT EXISTS idx_resultados_usuario ON resultados_evaluaciones(usuario_id, modulo_id);
CREATE INDEX IF NOT EXISTS idx_certificados_usuario ON certificados(usuario_id);
CREATE INDEX IF NOT EXISTS idx_evaluaciones_leccion ON evaluaciones(leccion_id);

-- 🎲 Datos de ejemplo para desarrollo
INSERT OR IGNORE INTO modulos_capacitacion (
    id, titulo, descripcion, objetivo, nivel, duracion_estimada, icono, color, 
    autor_id, estado, tags, orden_visualizacion, es_obligatorio
) VALUES
(1, 'Introducción a la Citricultura', 
 'Conceptos básicos sobre el cultivo de cítricos en Tucumán', 
 'Comprender los fundamentos de la producción citrícola',
 'principiante', 120, '🍊', '#f97316', 1, 'publicado', 
 'básico,introducción,cítricos', 1, 1),

(2, 'Manejo de Plagas en Cítricos', 
 'Identificación y control de las principales plagas que afectan los cítricos',
 'Aprender a identificar y controlar plagas de manera efectiva',
 'intermedio', 180, '🐛', '#ef4444', 1, 'publicado',
 'plagas,control,fitosanitario', 2, 1),

(3, 'Técnicas de Poda y Mantenimiento',
 'Métodos correctos de poda para optimizar la producción',
 'Dominar las técnicas de poda para maximizar el rendimiento',
 'intermedio', 150, '✂️', '#10b981', 1, 'publicado',
 'poda,mantenimiento,técnicas', 3, 0),

(4, 'Cosecha y Post-Cosecha',
 'Procesos de recolección y manejo post-cosecha de cítricos',
 'Optimizar los procesos de cosecha y conservación',
 'avanzado', 200, '📦', '#8b5cf6', 1, 'borrador',
 'cosecha,post-cosecha,calidad', 4, 0);

-- Lecciones para el módulo 1
INSERT OR IGNORE INTO lecciones (
    modulo_id, titulo, descripcion, contenido, tipo, duracion_minutos, orden
) VALUES
(1, 'Historia de la Citricultura en Tucumán', 
 'Evolución histórica del cultivo de cítricos en la provincia',
 '<h2>Historia de la Citricultura</h2><p>Tucumán es líder en producción citrícola...</p>',
 'texto', 20, 1),

(1, 'Tipos de Cítricos Cultivados', 
 'Variedades principales: naranjas, limones, pomelos y mandarinas',
 '<h2>Variedades de Cítricos</h2><p>Las principales variedades cultivadas son...</p>',
 'texto', 25, 2),

(1, 'Clima y Suelo Ideal', 
 'Condiciones ambientales óptimas para el cultivo',
 '<h2>Condiciones Ideales</h2><p>El clima subtropical húmedo...</p>',
 'texto', 30, 3),

(1, 'Video: Recorrido por una Plantación', 
 'Tour virtual por una plantación citrícola moderna',
 '<p>Video educativo mostrando una plantación en funcionamiento</p>',
 'video', 25, 4),

(1, 'Evaluación Final del Módulo', 
 'Evaluación de conocimientos adquiridos',
 '<p>Pon a prueba lo aprendido en este módulo</p>',
 'evaluacion', 20, 5);

-- Evaluación para el módulo 1
INSERT OR IGNORE INTO evaluaciones (
    leccion_id, modulo_id, titulo, descripcion, tiempo_limite, puntuacion_minima
) VALUES
(5, 1, 'Evaluación: Introducción a la Citricultura',
 'Evaluación de conceptos básicos del módulo introductorio',
 30, 75.00);

-- Preguntas para la evaluación
INSERT OR IGNORE INTO preguntas_evaluacion (
    evaluacion_id, pregunta, tipo, opciones, respuesta_correcta, puntos, explicacion, orden
) VALUES
(1, '¿Cuál es la principal provincia productora de cítricos en Argentina?',
 'multiple_choice', 
 '["Tucumán", "Mendoza", "Buenos Aires", "Córdoba"]',
 'Tucumán', 2.0,
 'Tucumán es la principal provincia citrícola de Argentina, especialmente en limones.',
 1),

(1, '¿Qué tipo de clima es ideal para la citricultura?',
 'multiple_choice',
 '["Subtropical húmedo", "Árido", "Templado frío", "Tropical seco"]',
 'Subtropical húmedo', 2.0,
 'El clima subtropical húmedo proporciona las condiciones ideales de temperatura y humedad.',
 2),

(1, 'Los cítricos necesitan suelos con buen drenaje',
 'verdadero_falso',
 '["Verdadero", "Falso"]',
 'Verdadero', 1.0,
 'El drenaje adecuado es fundamental para evitar enfermedades radiculares.',
 3);

-- Progreso de ejemplo (opcional para desarrollo)
INSERT OR IGNORE INTO progreso_modulos (
    usuario_id, modulo_id, porcentaje_completado, estado, tiempo_total_minutos
) VALUES
(1, 1, 100.00, 'completado', 95),
(1, 2, 60.00, 'en_progreso', 45);