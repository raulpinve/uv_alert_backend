\c postgres

DROP DATABASE IF EXISTS uv_alert;
CREATE DATABASE uv_alert;

\c uv_alert;

-- ============================================
-- Tabla: rangos_uv (catálogo)
-- ============================================
CREATE TABLE rangos_uv (
    id         SERIAL PRIMARY KEY,
    nombre     VARCHAR(50) NOT NULL,
    valor_min  DECIMAL(4,2) NOT NULL,
    valor_max  DECIMAL(4,2) NOT NULL
);

-- ============================================
-- Tabla: usuarios
-- ============================================
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    firebase_uid VARCHAR(128) NOT NULL UNIQUE,
    nombre VARCHAR(100) NOT NULL,
    apellidos VARCHAR(150),
    fecha_registro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- Tabla: dispositivos
-- ============================================
CREATE TABLE dispositivos (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL,
    fcm_token VARCHAR(255) NOT NULL,

    latitud DECIMAL(10,7) NOT NULL,
    longitud DECIMAL(10,7) NOT NULL,
    ciudad VARCHAR(100),

    uv_actual DECIMAL(4,2),
    rango_uv_id INTEGER,

    fecha_actualizacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_dispositivos_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_dispositivos_rango_uv
        FOREIGN KEY (rango_uv_id)
        REFERENCES rangos_uv(id)
        ON DELETE SET NULL,

    CONSTRAINT uq_dispositivos_fcm_token
        UNIQUE (fcm_token)
);
-- Índices útiles para el cronjob (recorrer dispositivos) y búsquedas por usuario
CREATE INDEX idx_dispositivos_usuario_id ON dispositivos(usuario_id);
CREATE INDEX idx_dispositivos_rango_uv_id ON dispositivos(rango_uv_id);

INSERT INTO rangos_uv (nombre, valor_min, valor_max) VALUES
    ('Sin UV',       0.00,  0.49),
    ('Bajo',         0.50,  2.99),
    ('Moderado',     3.00,  5.99),
    ('Alto',         6.00,  7.99),
    ('Muy alto',     8.00, 10.99),
    ('Extremo',      11.00, 13.99),
    ('Extremo alto', 14.00, 20.00);