\c postgres

DROP DATABASE IF EXISTS uv_alert;
CREATE DATABASE uv_alert;

\c uv_alert;

CREATE EXTENSION IF NOT EXISTS btree_gist;

-- ============================================
-- Table: uv_ranges (catalog)
-- `code` is used by the code/logic (English, stable).
-- `name` is shown to the end user (Spanish).
-- ============================================
CREATE TABLE uv_ranges (
    id        SERIAL PRIMARY KEY,
    code      VARCHAR(30)  NOT NULL UNIQUE,
    name      VARCHAR(50)  NOT NULL,
    min_value DECIMAL(4,2) NOT NULL,
    max_value DECIMAL(4,2) NOT NULL,

    CONSTRAINT uv_ranges_no_overlap
        EXCLUDE USING gist (numrange(min_value, max_value, '[]') WITH &&)
);

INSERT INTO uv_ranges (code, name, min_value, max_value) VALUES
    ('NONE',          'Sin UV',        0.00,  0.49),
    ('LOW',           'Bajo',          0.50,  2.99),
    ('MODERATE',      'Moderado',      3.00,  5.99),
    ('HIGH',          'Alto',          6.00,  7.99),
    ('VERY_HIGH',     'Muy alto',      8.00, 10.99),
    ('EXTREME',       'Extremo',      11.00, 13.99),
    ('EXTREME_HIGH',  'Extremo alto', 14.00, 20.00);

-- ============================================
-- Table: skin_types (catalog)
-- ============================================
CREATE TABLE skin_types (
    id                  SERIAL PRIMARY KEY,
    scale               VARCHAR(10)  NOT NULL,
    name                VARCHAR(100) NOT NULL,
    description         TEXT,
    sensitivity_factor  DECIMAL(3,2) NOT NULL DEFAULT 1.00
);

INSERT INTO skin_types (scale, name, description, sensitivity_factor) VALUES
    ('I',   'Piel muy clara',    'Siempre se quema, nunca se broncea. Pecas frecuentes.', 2.50),
    ('II',  'Piel clara',        'Se quema con facilidad, broncea mínimamente.',          2.00),
    ('III', 'Piel media',        'Se quema moderadamente, broncea gradualmente.',         1.50),
    ('IV',  'Piel morena clara', 'Se quema poco, broncea con facilidad.',                 1.00),
    ('V',   'Piel morena',       'Rara vez se quema, se broncea intensamente.',           0.75),
    ('VI',  'Piel oscura',       'Nunca se quema, muy pigmentada.',                       0.50);

-- ============================================
-- Table: users
-- ============================================
CREATE TABLE users (
    id            SERIAL PRIMARY KEY,
    firebase_uid  VARCHAR(128) NOT NULL UNIQUE,
    first_name    VARCHAR(100) NOT NULL,
    last_name     VARCHAR(150),
    skin_type_id  INTEGER,
    registered_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_users_skin_type
        FOREIGN KEY (skin_type_id)
        REFERENCES skin_types(id)
        ON DELETE SET NULL
);

CREATE INDEX idx_users_skin_type_id ON users(skin_type_id);

-- ============================================
-- Table: devices
-- ============================================
CREATE TABLE devices (
    id          SERIAL PRIMARY KEY,
    user_id     INTEGER NOT NULL,
    fcm_token   VARCHAR(255) NOT NULL,

    latitude    DECIMAL(10,7) NOT NULL,
    longitude   DECIMAL(10,7) NOT NULL,
    city        VARCHAR(100),

    current_uv  DECIMAL(4,2),
    uv_range_id INTEGER,

    updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_devices_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_devices_uv_range
        FOREIGN KEY (uv_range_id)
        REFERENCES uv_ranges(id)
        ON DELETE SET NULL,

    CONSTRAINT uq_devices_fcm_token
        UNIQUE (fcm_token)
);

-- Useful indexes for the cronjob (iterating devices) and lookups by user
CREATE INDEX idx_devices_user_id     ON devices(user_id);
CREATE INDEX idx_devices_uv_range_id ON devices(uv_range_id);