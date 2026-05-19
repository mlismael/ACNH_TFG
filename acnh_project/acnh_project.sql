-- Base de datos ACNH Project
-- Animal Crossing: New Horizons - Sistema de gestión de isla, aldeanos y coleccionables

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
SET COLLATION_CONNECTION = 'utf8mb4_unicode_ci';

-- Crear base de datos
CREATE DATABASE IF NOT EXISTS acnh_project;
USE acnh_project;

-- ===== TABLA: USUARIO =====
CREATE TABLE IF NOT EXISTS USUARIO (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    img_perfil VARCHAR(100),
    nombre_isla VARCHAR(100),
    color_tema VARCHAR(7) DEFAULT '#B2F2BB',
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar usuario admin con contraseña hasheada ('admin')
INSERT INTO `USUARIO` (`id`, `username`, `email`, `password`, `nombre_isla`, `fecha_registro`, `fecha_actualizacion`, `activo`) VALUES
(1, 'admin', '', '$2y$10$f1DXudU29uu1TUxzUJXxVuQqsnKoenwW7hrcEnlRpOMmlZBe/FF2q', NULL, '2026-03-29 19:19:49', '2026-03-29 19:19:49', 1);



-- ===== TABLA: TIPO_COLECCIONABLE =====
CREATE TABLE IF NOT EXISTS TIPO_COLECCIONABLE (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tipo VARCHAR(50) NOT NULL UNIQUE,
    url_api VARCHAR(255),
    descripcion VARCHAR(255),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===== TABLA: ALDEANOS_USUARIO =====
CREATE TABLE IF NOT EXISTS ALDEANOS_USUARIO (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_api INT NOT NULL,
    url_api VARCHAR(255),
    nombre_aldeano VARCHAR(100) NOT NULL,
    imagen_aldeano VARCHAR(255),
    personalidad VARCHAR(50),
    fecha_incorporacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES USUARIO(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===== TABLA: COLECCIONABLES_USUARIO =====
CREATE TABLE IF NOT EXISTS COLECCIONABLES_USUARIO (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_tipo INT NOT NULL,
    id_api INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    imagen VARCHAR(255),
    fecha_captura TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES USUARIO(id) ON DELETE CASCADE,
    FOREIGN KEY (id_tipo) REFERENCES TIPO_COLECCIONABLE(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===== ÍNDICES PARA MEJOR RENDIMIENTO =====
CREATE INDEX idx_usuario_username ON USUARIO(username);
CREATE INDEX idx_aldeanos_usuario ON ALDEANOS_USUARIO(id_usuario);
CREATE INDEX idx_coleccionables_usuario ON COLECCIONABLES_USUARIO(id_usuario);
CREATE INDEX idx_coleccionables_tipo ON COLECCIONABLES_USUARIO(id_tipo);

-- ===== DATOS INICIALES =====
INSERT INTO TIPO_COLECCIONABLE (tipo, url_api, descripcion) VALUES 
('Bichos', 'https://api.nookipedia.com/bugs', 'Insectos y bichos del juego'),
('Peces', 'https://api.nookipedia.com/fish', 'Peces de agua dulce y salada'),
('Criaturas Marinas', 'https://api.nookipedia.com/sea', 'Criaturas marinas y submarinas');
