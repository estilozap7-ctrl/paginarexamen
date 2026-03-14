-- ==========================================================
-- SCRIPT CORREGIDO PARA UniCórdoba
-- Motor: MySQL 8.0+ / MariaDB
-- Base de datos: admingemcrak_l
-- ==========================================================

USE admingemcrak_l;

-- Desactivamos checks de llaves foráneas temporalmente para evitar errores de orden
SET FOREIGN_KEY_CHECKS = 0;

-- 1. Tabla de Roles
DROP TABLE IF EXISTS roles;

CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(20) NOT NULL UNIQUE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

-- 2. Tabla de Usuarios
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    cc VARCHAR(20) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role_id INT NOT NULL,
    reset_password_token VARCHAR(255) DEFAULT NULL,
    reset_password_expires DATETIME DEFAULT NULL,
    last_login DATETIME DEFAULT NULL,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

-- 3. Tabla de Semestres
DROP TABLE IF EXISTS semesters;

CREATE TABLE semesters (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(10) NOT NULL UNIQUE,
    name VARCHAR(50) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

-- 4. Tabla de Cursos
DROP TABLE IF EXISTS courses;

CREATE TABLE courses (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    subject_code VARCHAR(20) NOT NULL,
    semester_id INT NOT NULL,
    course_admin_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (semester_id) REFERENCES semesters (id),
    FOREIGN KEY (course_admin_id) REFERENCES users (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

-- 5. Tabla de Inscripciones
DROP TABLE IF EXISTS enrollments;

CREATE TABLE enrollments (
    id VARCHAR(36) PRIMARY KEY,
    student_id VARCHAR(36) NOT NULL,
    course_id VARCHAR(36) NOT NULL,
    enrollment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY (student_id, course_id),
    FOREIGN KEY (student_id) REFERENCES users (id),
    FOREIGN KEY (course_id) REFERENCES courses (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

-- 6. Tabla de Exámenes
DROP TABLE IF EXISTS exams;

CREATE TABLE exams (
    id VARCHAR(36) PRIMARY KEY,
    course_id VARCHAR(36) NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    activity_date DATETIME NOT NULL,
    question_org ENUM('LINEAR', 'RANDOM') DEFAULT 'LINEAR',
    answer_org ENUM('LINEAR', 'RANDOM') DEFAULT 'LINEAR',
    duration_minutes INT DEFAULT 60,
    is_published TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

-- 7. Tabla de Preguntas
DROP TABLE IF EXISTS questions;

CREATE TABLE questions (
    id VARCHAR(36) PRIMARY KEY,
    exam_id VARCHAR(36) NOT NULL,
    body TEXT NOT NULL,
    order_position INT NOT NULL DEFAULT 0,
    type ENUM('QUESTION', 'MESSAGE') DEFAULT 'QUESTION',
    points DECIMAL(5, 2) DEFAULT 0.00,
    FOREIGN KEY (exam_id) REFERENCES exams (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

-- 8. Tabla de Respuestas
DROP TABLE IF EXISTS answers;

CREATE TABLE answers (
    id VARCHAR(36) PRIMARY KEY,
    question_id VARCHAR(36) NOT NULL,
    body TEXT NOT NULL,
    is_correct TINYINT(1) DEFAULT 0,
    order_position INT NOT NULL DEFAULT 0,
    FOREIGN KEY (question_id) REFERENCES questions (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

-- 9. Tabla de Intentos de Examen
DROP TABLE IF EXISTS student_exam_attempts;

CREATE TABLE student_exam_attempts (
    id VARCHAR(36) PRIMARY KEY,
    student_id VARCHAR(36) NOT NULL,
    exam_id VARCHAR(36) NOT NULL,
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    finished_at DATETIME NULL,
    final_score DECIMAL(5, 2) DEFAULT 0.00,
    status ENUM(
        'IN_PROGRESS',
        'COMPLETED',
        'EXPIRED'
    ) DEFAULT 'IN_PROGRESS',
    FOREIGN KEY (student_id) REFERENCES users (id),
    FOREIGN KEY (exam_id) REFERENCES exams (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

-- 10. Tabla de Respuestas Marcadas
DROP TABLE IF EXISTS student_answers;

CREATE TABLE student_answers (
    id VARCHAR(36) PRIMARY KEY,
    attempt_id VARCHAR(36) NOT NULL,
    question_id VARCHAR(36) NOT NULL,
    selected_answer_id VARCHAR(36) NOT NULL,
    FOREIGN KEY (attempt_id) REFERENCES student_exam_attempts (id),
    FOREIGN KEY (question_id) REFERENCES questions (id),
    FOREIGN KEY (selected_answer_id) REFERENCES answers (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

-- Reactivamos los checks de llaves foráneas
SET FOREIGN_KEY_CHECKS = 1;

-- ==========================================================
-- DATA INICIAL Y OPTIMIZACIÓN
-- ==========================================================

INSERT INTO
    roles (name)
VALUES ('ADMIN'),
    ('COURSE_ADMIN'),
    ('STUDENT');

INSERT INTO
    users (
        id,
        full_name,
        email,
        cc,
        password,
        role_id
    )
VALUES (
        REPLACE (UUID(), '-', ''),
            'Super Administrador',
            'admin@unicordoba.edu.co',
            '12345678',
            'hash_simulado',
            1
    );

INSERT INTO
    semesters (
        code,
        name,
        start_date,
        end_date
    )
VALUES (
        '2024-1',
        'Primer Semestre 2024',
        '2024-02-01',
        '2024-06-30'
    );

-- ÍNDICES
CREATE INDEX idx_user_auth ON users (email, cc);

CREATE INDEX idx_exams_active ON exams (course_id, is_published);

CREATE INDEX idx_attempts_tracking ON student_exam_attempts (student_id, exam_id, status);