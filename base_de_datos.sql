-- ============================================================
-- Base de datos para el Consultorio Psicológico
-- Motor: MySQL 8.x / MariaDB compatible
-- Codificación: utf8mb4
--
-- NOTA PARA RAILWAY:
-- Si ejecutas este script desde la consola SQL del servicio MySQL
-- de Railway, puedes crear la base de datos con este mismo script.
-- Luego configura DB_NAME con el nombre creado (consultorio_psicologico)
-- o cambia las instrucciones CREATE DATABASE y USE por la base de datos
-- que Railway haya asignado (normalmente "railway").
--
-- Si ya tienes una base de datos con la estructura anterior
-- (consultorio psiquiátrico), ejecuta el script
-- migracion_consultorio_psicologico.sql en lugar de este.
-- ============================================================

CREATE DATABASE IF NOT EXISTS consultorio_psicologico
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE consultorio_psicologico;

SET NAMES utf8mb4;

-- ============================================================
-- Tabla: consultorios
-- Espacios físicos o virtuales donde se atiende a los pacientes.
-- ============================================================
CREATE TABLE IF NOT EXISTS consultorios (
  id_consultorio INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  ubicacion VARCHAR(255) NOT NULL,
  telefono VARCHAR(20) NULL,
  estado ENUM('Disponible', 'Ocupado', 'Inactivo') NOT NULL DEFAULT 'Disponible',
  fecha_registro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_consultorio),
  UNIQUE KEY uq_consultorios_nombre (nombre)
) ENGINE = InnoDB
  DEFAULT CHARACTER SET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;

-- ============================================================
-- Tabla: pacientes
-- Personas que reciben atención psicológica.
-- El campo antecedentes almacena antecedentes psicológicos relevantes.
-- ============================================================
CREATE TABLE IF NOT EXISTS pacientes (
  id_paciente INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  fecha_nacimiento DATE NOT NULL,
  sexo ENUM('Masculino', 'Femenino', 'Otro') NOT NULL,
  telefono VARCHAR(20) NULL,
  correo VARCHAR(120) NULL,
  direccion VARCHAR(255) NULL,
  antecedentes TEXT NULL,
  fecha_registro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_paciente),
  KEY idx_pacientes_apellido_nombre (apellido, nombre),
  KEY idx_pacientes_correo (correo)
) ENGINE = InnoDB
  DEFAULT CHARACTER SET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;

-- ============================================================
-- Tabla: psicologos
-- Profesionales de la salud psicológica.
-- Relación: un consultorio puede tener varios psicólogos.
-- ============================================================
CREATE TABLE IF NOT EXISTS psicologos (
  id_psicologo INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  especialidad VARCHAR(100) NOT NULL,
  cedula_profesional VARCHAR(50) NOT NULL,
  telefono VARCHAR(20) NULL,
  correo VARCHAR(120) NOT NULL,
  enfoque_terapeutico VARCHAR(100) NULL,
  id_consultorio INT UNSIGNED NULL,
  fecha_registro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_psicologo),
  UNIQUE KEY uq_psicologos_cedula (cedula_profesional),
  UNIQUE KEY uq_psicologos_correo (correo),
  KEY idx_psicologos_consultorio (id_consultorio),
  CONSTRAINT fk_psicologos_consultorio
    FOREIGN KEY (id_consultorio)
    REFERENCES consultorios (id_consultorio)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE = InnoDB
  DEFAULT CHARACTER SET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;

-- ============================================================
-- Tabla: citas
-- Relaciona pacientes, psicólogos y consultorios.
-- La modalidad permite distinguir atención presencial o virtual.
-- ============================================================
CREATE TABLE IF NOT EXISTS citas (
  id_cita INT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_paciente INT UNSIGNED NOT NULL,
  id_psicologo INT UNSIGNED NOT NULL,
  id_consultorio INT UNSIGNED NOT NULL,
  fecha_cita DATE NOT NULL,
  hora_cita TIME NOT NULL,
  modalidad ENUM('Presencial', 'Virtual', 'Híbrida')
    NOT NULL DEFAULT 'Presencial',
  motivo VARCHAR(255) NULL,
  estado ENUM('Programada', 'Confirmada', 'Atendida', 'Cancelada')
    NOT NULL DEFAULT 'Programada',
  fecha_registro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_cita),
  KEY idx_citas_fecha_hora (fecha_cita, hora_cita),
  KEY idx_citas_paciente (id_paciente),
  KEY idx_citas_psicologo (id_psicologo),
  KEY idx_citas_consultorio (id_consultorio),
  KEY idx_citas_estado (estado),
  CONSTRAINT fk_citas_paciente
    FOREIGN KEY (id_paciente)
    REFERENCES pacientes (id_paciente)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT fk_citas_psicologo
    FOREIGN KEY (id_psicologo)
    REFERENCES psicologos (id_psicologo)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT fk_citas_consultorio
    FOREIGN KEY (id_consultorio)
    REFERENCES consultorios (id_consultorio)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE = InnoDB
  DEFAULT CHARACTER SET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;

-- ============================================================
-- Tabla: historial_clinico
-- Registro de la evolución psicológica del paciente.
-- Relación: cada cita puede tener un único registro clínico.
-- ============================================================
CREATE TABLE IF NOT EXISTS historial_clinico (
  id_historial INT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_cita INT UNSIGNED NOT NULL,
  diagnostico TEXT NOT NULL,
  tratamiento TEXT NULL,
  notas TEXT NULL,
  fecha_registro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_historial),
  UNIQUE KEY uq_historial_cita (id_cita),
  CONSTRAINT fk_historial_cita
    FOREIGN KEY (id_cita)
    REFERENCES citas (id_cita)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE = InnoDB
  DEFAULT CHARACTER SET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;

-- ============================================================
-- Verificación rápida de la estructura creada
-- ============================================================
SHOW TABLES;
