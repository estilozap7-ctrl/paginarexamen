# Sistema de Evaluación de Razonamiento Lógico - estilozap7-ctrl

Este proyecto es una plataforma web integral diseñada para la gestión y realización de evaluaciones académicas, con un enfoque particular en el razonamiento lógico. Permite a docentes administrar cursos y exámenes, y a estudiantes realizar pruebas con diversos tipos de preguntas y obtener resultados detallados.

## 🚀 Características Principales

### 👤 Gestión de Usuarios y Roles
- **Super Administrador:** Control total sobre usuarios, roles y configuración global.
- **Docente (Admin de Curso):** Gestión de cursos, estudiantes inscritos y creación/calificación de exámenes.
- **Estudiantes:** Acceso a cursos inscritos, resolución de exámenes y consulta de calificaciones.

### 📚 Administración Académica
- Gestión de **Semestres** y **Cursos**.
- Control de **Inscripciones** de estudiantes a cursos específicos.

### 📝 Sistema de Exámenes Dinámico
- Creación de exámenes con título, descripción, fecha de actividad y duración.
- **Tipos de Preguntas Soportados:**
    - `SINGLE_CHOICE`: Selección única.
    - `MULTIPLE_CHOICE`: Selección múltiple.
    - `MATCHING`: Emparejamiento de conceptos.
    - `TEXT_DEVELOPMENT`: Respuesta abierta (requiere calificación manual).

### 📊 Calificación y Seguimiento
- **Calificación Automática:** Para preguntas de opción múltiple y emparejamiento.
- **Calificación Manual:** Interfaz para que el docente califique respuestas abiertas.
- **Estadísticas de Rendimiento:** Resumen de notas promedio, tasa de aprobación y lista detallada de intentos por estudiante.
- **Seguridad en Intentos:** Control de tiempo y restricción de intentos una vez finalizados.

## 🛠️ Tecnologías Utilizadas

### Frontend
- ![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB) **React (Vite):** Biblioteca principal para la interfaz de usuario.
- ![Redux](https://img.shields.io/badge/redux-%23593d88.svg?style=for-the-badge&logo=redux&logoColor=white) **Redux & React-Redux:** Gestión del estado global (Autenticación y persistencia).
- ![React Router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white) **React Router Dom:** Enrutamiento dinámico y protección de rutas.
- ![Axios](https://img.shields.io/badge/axios-671ddf?style=for-the-badge&logo=axios&logoColor=white) **Axios:** Cliente para consumo de la API REST.
- ![Lucide](https://img.shields.io/badge/Lucide-React-F97316?style=for-the-badge&logo=react&logoColor=white) **Lucide-React:** Set de iconos premium y minimalistas.
- ![CSS3](https://img.shields.io/badge/css3-%231572B6.svg?style=for-the-badge&logo=css3&logoColor=white) **CSS3 (Custom):** Estilos avanzados con efectos de Glassmorphism, degradados dinámicos y diseño responsivo.

### Backend
- ![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white) **Node.js & Express.js:** Motor de ejecución y framework de servidor.
- ![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB) **Express.js:** Framework minimalista para APIs.
- ![Sequelize](https://img.shields.io/badge/Sequelize-52B0E7?style=for-the-badge&logo=Sequelize&logoColor=white) **Sequelize ORM:** Mapeo objeto-relacional para transacciones seguras.
- ![MySQL](https://img.shields.io/badge/mysql-%2300f.svg?style=for-the-badge&logo=mysql&logoColor=white) **MySQL (AlwaysData):** Motor de base de datos relacional para almacenamiento persistente.
- ![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens) **JWT (JSON Web Tokens):** Sistema de autenticación seguro.
- ![Bcrypt](https://img.shields.io/badge/Bcrypt-543B78?style=for-the-badge&logo=password&logoColor=white) **Bcryptjs:** Encriptación de contraseñas.
- ![Dotenv](https://img.shields.io/badge/Dotenv-ECD53F?style=for-the-badge&logo=dotenv&logoColor=black) **Dotenv:** Gestión de variables de entorno seguras.

## 📐 Modelos de Datos

### Modelo Entidad-Relación (ER)
A continuación se presenta la representación gráfica de las entidades y sus relaciones:

```mermaid
erDiagram
    ROLE ||--o{ USER : "define"
    USER ||--o{ COURSE : "administra (docente)"
    SEMESTER ||--o{ COURSE : "pertenece"
    USER ||--o{ ENROLLMENT : "se inscribe (estudiante)"
    COURSE ||--o{ ENROLLMENT : "recibe"
    COURSE ||--o{ EXAM : "contiene"
    EXAM ||--o{ QUESTION : "tiene"
    QUESTION ||--o{ ANSWER : "posee opciones"
    USER ||--o{ STUDENT_EXAM_ATTEMPT : "realiza (estudiante)"
    EXAM ||--o{ STUDENT_EXAM_ATTEMPT : "registra"
    STUDENT_EXAM_ATTEMPT ||--o{ STUDENT_ANSWER : "contiene"
    QUESTION ||--o{ STUDENT_ANSWER : "responde"
    ANSWER ||--o| STUDENT_ANSWER : "es seleccionada"
```

### Modelo Relacional (Estructura de Tablas)
- `users` (id, full_name, email, cc, password, role_id, ...)
- `roles` (id, name)
- `semesters` (id, code, name, dates)
- `courses` (id, name, semester_id, teacher_id)
- `enrollments` (id, student_id, course_id)
- `exams` (id, course_id, title, activity_date, duration, ...)
- `questions` (id, exam_id, body, type, points)
- `answers` (id, question_id, body, is_correct)
- `student_exam_attempts` (id, student_id, exam_id, score, status, ...)
- `student_answers` (id, attempt_id, question_id, selected_answer_id/text)

## 💻 Instalación y Uso

1. **Clonar el repositorio:** `git clone <url_del_repo>`
2. **Backend:** 
   - `cd servidor`
   - `npm install`
   - Configurar `.env` con credenciales de base de datos.
   - `npm start`
3. **Frontend:**
   - `cd cliente`
   - `npm install`
---

© 2026 estilozap7-ctrl - Sistema de Evaluación de Razonamiento Lógico. Todos los derechos reservados.
