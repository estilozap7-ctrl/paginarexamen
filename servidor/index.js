const express = require('express');
const { Op } = require('sequelize');
const { sequelize, testConnection } = require('./db');
const User = require('./models/User');
const Role = require('./models/Role');
const Course = require('./models/Course');
const Enrollment = require('./models/Enrollment');
const Semester = require('./models/Semester');
const Exam = require('./models/Exam');
const Question = require('./models/Question');
const StudentExamAttempt = require('./models/StudentExamAttempt');
const StudentAnswer = require('./models/StudentAnswer');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const fs = require('fs');
require('dotenv').config();

const generateId = () => {
    try {
        return crypto.randomUUID().replace(/-/g, '');
    } catch (e) {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }
};


const logError = (msg, err) => {
    const timestamp = new Date().toISOString();
    const errorLine = `[${timestamp}] ${msg}: ${err.message}\n${err.stack}\n\n`;
    fs.appendFileSync('errors.log', errorLine);
    console.error(msg, err);
};

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Probar conexión a la base de datos al arrancar
testConnection();
sequelize.sync({ alter: true }).then(() => console.log('✅ Tablas sincronizadas')).catch(err => console.error('❌ Error sincronizando:', err));

// Middleware de autenticación simple (por ahora)
const authenticate = (req, res, next) => {
    const userId = req.headers['x-user-id'];
    const userRole = req.headers['x-user-role'];
    
    if (!userId) {
        console.log('⚠️ Intento de acceso sin ID de usuario');
        return res.status(401).json({ message: 'No autorizado' });
    }
    
    req.user = { id: userId, role: userRole };
    next();
};

// Middleware de autorización para ADMIN
const isAdmin = (req, res, next) => {
    if (String(req.user.role).toUpperCase() !== 'ADMIN') {
        console.log(`🚫 Acceso denegado para rol: ${req.user.role}`);
        return res.status(403).json({ message: 'Acceso denegado: Se requiere rol de Administrador' });
    }
    next();
};

// --- RUTAS DE USUARIOS (ADMIN) ---

app.get('/api/admin/users', authenticate, isAdmin, async (req, res) => {
    try {
        const users = await User.findAll({
            include: [{ model: Role, attributes: ['name', 'id'] }],
            attributes: { exclude: ['password'] }
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/admin/users', authenticate, isAdmin, async (req, res) => {
    console.log('🚀 Iniciando creación de usuario:', req.body.email);
    try {
        const { full_name, email, cc, password, role_id } = req.body;
        
        if (!password) {
            return res.status(400).json({ message: 'La contraseña es obligatoria' });
        }

        console.log('🔐 Hasheando contraseña...');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        console.log('🆔 Generando ID...');
        const id = crypto.randomUUID().replace(/-/g, '');

        console.log('💾 Guardando en BD...');
        const newUser = await User.create({
            id,
            full_name,
            email,
            cc,
            password: hashedPassword,
            role_id: parseInt(role_id)
        });
        
        console.log('✅ Usuario creado con éxito');
        const userJson = newUser.toJSON();
        delete userJson.password;
        res.status(201).json(userJson);
    } catch (error) {
        console.error('❌ Error fatal al crear usuario:', error);
        res.status(500).json({ 
            message: 'Error al crear usuario',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// ... (Resto de rutas simplificadas por brevedad para asegurar que no se rompa nada)
app.put('/api/admin/users/:id', authenticate, isAdmin, async (req, res) => {
    try {
        const { full_name, email, cc, role_id, is_active } = req.body;
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ message: 'No encontrado' });
        await user.update({ full_name, email, cc, role_id, is_active });
        res.json({ message: 'Actualizado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/admin/users/:id', authenticate, isAdmin, async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ message: 'No encontrado' });
        await user.destroy();
        res.json({ message: 'Eliminado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/admin/roles', authenticate, isAdmin, async (req, res) => {
    try {
        const roles = await Role.findAll();
        res.json(roles);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- RUTAS DE CURSOS ---
app.get('/api/admin/courses', authenticate, isAdmin, async (req, res) => {
    try {
        const courses = await Course.findAll({
            include: [
                { model: Semester, attributes: ['name', 'code'] },
                { model: User, as: 'Admin', attributes: ['id', 'full_name', 'email'] }
            ]
        });
        res.json(courses);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/admin/semesters', authenticate, isAdmin, async (req, res) => {
    try {
        const semesters = await Semester.findAll({ order: [['start_date', 'DESC']] });
        res.json(semesters);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/admin/exams', authenticate, isAdmin, async (req, res) => {
    try {
        const exams = await Exam.findAll({
            include: [
                { model: Question, as: 'Questions' },
                { model: Course, include: [{ model: User, as: 'Admin', attributes: ['id', 'full_name'] }] }
            ],
            order: [['created_at', 'DESC']]
        });
        res.json(exams);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


app.post('/api/admin/courses', authenticate, isAdmin, async (req, res) => {
    console.log('📦 Creando curso con datos:', req.body);
    try {
        const { name, subject_code, semester_code, course_admin_id } = req.body;
        
        if (!semester_code) {
            console.error('❌ Error: semester_code es obligatorio');
            return res.status(400).json({ error: 'Falta el código del semestre' });
        }

        // Buscar o Crear el semestre automáticamente
        let semester = await Semester.findOne({ where: { code: semester_code } });
        
        if (!semester) {
            console.log(`🔍 No se encontró el semestre ${semester_code}, intentando crear...`);
            const [year, type] = semester_code.split('-');
            const semesterName = `${type === '1' ? 'Primer' : 'Segundo'} Semestre ${year}`;
            const start_date = `${year}-${type === '1' ? '02' : '08'}-01`;
            const end_date = `${year}-${type === '1' ? '06' : '12'}-15`;
            
            semester = await Semester.create({
                code: semester_code,
                name: semesterName,
                start_date,
                end_date
            });
            console.log(`✨ Nuevo periodo creado ID: ${semester.id}`);
        } else {
            console.log(`✅ Semestre encontrado ID: ${semester.id}`);
        }

        const id = Math.random().toString(36).substring(2, 11).toUpperCase();
        console.log(`🏗️ Datos a insertar: id=${id}, semester_id=${semester.id}, admin_id=${course_admin_id}`);
        
        const newCourse = await Course.create({ 
            id, 
            name, 
            subject_code, 
            semester_id: semester.id, 
            course_admin_id 
        }, { logging: console.log });
        
        res.status(201).json(newCourse);
    } catch (error) {
        console.error('❌ Error en POST /api/admin/courses:', error);
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/admin/courses/:id', authenticate, isAdmin, async (req, res) => {
    console.log(`📝 Intentando actualizar curso ID: ${req.params.id}`, req.body);
    try {
        const { name, subject_code, semester_code, course_admin_id } = req.body;
        const course = await Course.findByPk(req.params.id);
        
        if (!course) {
            console.warn(`❌ Curso no encontrado con ID: ${req.params.id}`);
            return res.status(404).json({ message: 'Curso no encontrado' });
        }
        console.log(`✅ Curso encontrado: ${course.name}`);

        let semesterId = course.semester_id;
        if (semester_code) {
            let semester = await Semester.findOne({ where: { code: semester_code } });
            if (!semester) {
                const [year, type] = semester_code.split('-');
                semester = await Semester.create({
                    code: semester_code,
                    name: `${type === '1' ? 'Primer' : 'Segundo'} Semestre ${year}`,
                    start_date: `${year}-${type === '1' ? '02' : '08'}-01`,
                    end_date: `${year}-${type === '1' ? '06' : '12'}-15`
                });
            }
            semesterId = semester.id;
        }

        await course.update({ name, subject_code, semester_id: semesterId, course_admin_id });
        res.json({ message: 'Curso actualizado con éxito' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/admin/courses/:id', authenticate, isAdmin, async (req, res) => {
    console.log(`🗑️ Intentando eliminar curso ID: ${req.params.id}`);
    try {
        const { id } = req.params;
        const course = await Course.findByPk(id);
        
        if (!course) {
            console.warn(`❌ Curso no encontrado con ID: ${id}`);
            return res.status(404).json({ message: 'Curso no encontrado' });
        }

        // 1. Obtener todos los exámenes del curso
        const exams = await Exam.findAll({ where: { course_id: id } });
        const examIds = exams.map(e => e.id);

        if (examIds.length > 0) {
            // 2. Obtener intentos de esos exámenes
            const attempts = await StudentExamAttempt.findAll({ where: { exam_id: examIds } });
            const attemptIds = attempts.map(a => a.id);

            // 3. Eliminar respuestas de esos intentos
            if (attemptIds.length > 0) {
                await StudentAnswer.destroy({ where: { attempt_id: attemptIds } });
            }

            // 4. Eliminar intentos y preguntas
            await StudentExamAttempt.destroy({ where: { exam_id: examIds } });
            await Question.destroy({ where: { exam_id: examIds } });
        }

        // 5. Eliminar exámenes
        await Exam.destroy({ where: { course_id: id } });

        // 6. Eliminar inscripciones
        await Enrollment.destroy({ where: { course_id: id } });

        // 7. Finalmente eliminar el curso
        await course.destroy();

        console.log(`✅ Curso ${id} eliminado con éxito`);
        res.json({ message: 'Curso y todos sus datos asociados eliminados con éxito' });
    } catch (error) {
        console.error('❌ Error fatal al eliminar curso:', error);
        res.status(500).json({ 
            message: 'Error al eliminar el curso',
            error: error.message 
        });
    }
});

app.get('/api/admin/instructors', authenticate, isAdmin, async (req, res) => {
    try {
        const instructors = await User.findAll({
            include: [{ model: Role, where: { name: ['ADMIN', 'COURSE_ADMIN'] } }],
            attributes: ['id', 'full_name', 'email']
        });
        res.json(instructors);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Middleware de autorización para DOCENTES
const isTeacher = (req, res, next) => {
    const role = String(req.user.role).toUpperCase();
    if (role !== 'COURSE_ADMIN' && role !== 'ADMIN') {
        return res.status(403).json({ message: 'Acceso denegado: Se requiere rol de Docente' });
    }
    next();
};

// --- RUTAS PARA DOCENTES ---

// Obtener cursos asignados al docente
app.get('/api/teacher/courses', authenticate, isTeacher, async (req, res) => {
    try {
        const currentYear = new Date().getFullYear();
        const courses = await Course.findAll({
            where: { course_admin_id: req.user.id },
            include: [
                { 
                    model: Semester, 
                    where: {
                        start_date: {
                            [Op.gte]: `${new Date().getFullYear()}-01-01`
                        }
                    },
                    attributes: ['name', 'code'] 
                },
                {
                    model: Exam
                }
            ]
        });
        res.json(courses);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Middleware de autorización para ESTUDIANTES
const isStudent = (req, res, next) => {
    const role = String(req.user.role).toUpperCase();
    if (role !== 'STUDENT' && role !== 'ADMIN') {
        return res.status(403).json({ message: 'Acceso denegado: Se requiere rol de Estudiante' });
    }
    next();
};

// Obtener cursos para el estudiante matriculado
app.get('/api/student/courses', authenticate, isStudent, async (req, res) => {
    try {
        const enrollments = await Enrollment.findAll({
            where: { student_id: req.user.id }
        });
        const courseIds = enrollments.map(e => e.course_id);
        const courses = await Course.findAll({
            where: { id: courseIds },
            include: [
                { model: Semester, attributes: ['name', 'code'] },
                { model: Exam }
            ]
        });
        res.json(courses);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Obtener exámenes de un curso específico para el estudiante (incluyendo sus intentos)
app.get('/api/student/courses/:courseId/exams', authenticate, isStudent, async (req, res) => {
    try {
        // Verificar inscripción primero
        const enrollment = await Enrollment.findOne({
            where: { student_id: req.user.id, course_id: req.params.courseId }
        });
        
        if (!enrollment) {
            return res.status(403).json({ message: 'No estás inscrito en este curso' });
        }

        const exams = await Exam.findAll({
            where: { course_id: req.params.courseId },
            include: [{
                model: StudentExamAttempt,
                as: 'StudentExamAttempts',
                required: false, // LEFT JOIN
                where: { student_id: req.user.id }
            }],
            order: [['activity_date', 'ASC']]
        });
        
        res.json(exams);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- RUTAS DE RESOLUCIÓN DE EXÁMENES (ESTUDIANTES) ---

// Iniciar o reanudar un examen
app.post('/api/student/exams/:examId/start', authenticate, isStudent, async (req, res) => {
    try {
        const { examId } = req.params;
        const exam = await Exam.findByPk(examId, { include: [{ model: Question, as: 'Questions' }] });
        if (!exam) return res.status(404).json({ message: 'Examen no encontrado' });

        // Verificar si la fecha del examen ya pasó (Deadline)
        const nowAtStart = new Date();
        const activityDate = new Date(exam.activity_date);
        // Permitimos entrar si es el mismo día o antes.
        if (nowAtStart > activityDate) {
            return res.status(403).json({ message: 'La fecha límite para este examen ha pasado.' });
        }

        // Verificar si ya tiene un intento
        let attempt = await StudentExamAttempt.findOne({
            where: { exam_id: examId, student_id: req.user.id }
        });

        if (attempt) {
            if (attempt.status === 'COMPLETED') {
                return res.status(403).json({ message: 'Ya has finalizado este examen.', attempt });
            }
            // Verificar si el tiempo expiró
            const now = new Date();
            const startedAt = new Date(attempt.started_at);
            const expiresAt = new Date(startedAt.getTime() + exam.duration_minutes * 60000);
            
            if (now > expiresAt && attempt.status === 'IN_PROGRESS') {
                await attempt.update({ status: 'EXPIRED', finished_at: expiresAt });
                return res.status(403).json({ message: 'El tiempo para este examen ha expirado.', attempt });
            }

            // ✅ FIX: Si este intento no tiene question_order pero el examen tiene un límite, asignarlo ahora
            if (!attempt.question_order && exam.questions_limit > 0 && exam.Questions.length > 0) {
                const allIds = exam.Questions.map(q => q.id);
                for (let i = allIds.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [allIds[i], allIds[j]] = [allIds[j], allIds[i]];
                }
                const selectedIds = allIds.slice(0, exam.questions_limit);
                await attempt.update({ question_order: JSON.stringify(selectedIds) });
                // Recargar el attempt actualizado
                attempt = await StudentExamAttempt.findByPk(attempt.id);
            }
        } else {
            // Crear nuevo intento e inicializar el orden de preguntas aleatorias si aplica
            const newAttemptId = crypto.randomUUID().replace(/-/g, '');
            let selectedIds = null;

            if (exam.questions_limit > 0 && exam.Questions.length > 0) {
                // Shuffle all available question IDs (Fisher-Yates)
                const allIds = exam.Questions.map(q => q.id);
                for (let i = allIds.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [allIds[i], allIds[j]] = [allIds[j], allIds[i]];
                }
                selectedIds = allIds.slice(0, exam.questions_limit);
            }

            attempt = await StudentExamAttempt.create({
                id: newAttemptId,
                student_id: req.user.id,
                exam_id: examId,
                status: 'IN_PROGRESS',
                started_at: new Date(),
                question_order: selectedIds ? JSON.stringify(selectedIds) : null
            });
        }

        // Filtrar las preguntas si hay un orden guardado
        if (attempt.question_order) {
            const order = JSON.parse(attempt.question_order);
            const orderedQuestions = order.map(id => exam.Questions.find(q => q.id === id)).filter(Boolean);
            exam.setDataValue('Questions', orderedQuestions);
        }

        // Obtener respuestas ya guardadas si las hay
        const savedAnswers = await StudentAnswer.findAll({
            where: { attempt_id: attempt.id }
        });

        res.json({ exam, attempt, savedAnswers });
    } catch (error) {
        logError('ERROR /api/student/exams/:examId/start', error);
        res.status(500).json({ error: error.message });
    }
});

// Guardar una respuesta individual (autoguardado)
app.post('/api/student/exams/:examId/save', authenticate, isStudent, async (req, res) => {
    try {
        const { examId } = req.params;
        const { questionId, answerData } = req.body;

        const attempt = await StudentExamAttempt.findOne({
            where: { exam_id: examId, student_id: req.user.id, status: 'IN_PROGRESS' }
        });

        if (!attempt) return res.status(403).json({ message: 'No hay un intento activo para este examen.' });

        const [answer, created] = await StudentAnswer.findOrCreate({
            where: { attempt_id: attempt.id, question_id: questionId },
            defaults: { 
                id: crypto.randomUUID().replace(/-/g, ''),
                answer_data: answerData
            }
        });

        if (!created) {
            await answer.update({ answer_data: answerData });
        }

        res.json({ success: true });
    } catch (error) {
        logError('ERROR /api/student/exams/:examId/save', error);
        res.status(500).json({ error: error.message });
    }
});

// Finalizar examen y calificar
app.post('/api/student/exams/:examId/finish', authenticate, isStudent, async (req, res) => {
    try {
        const { examId } = req.params;
        const attempt = await StudentExamAttempt.findOne({
            where: { exam_id: examId, student_id: req.user.id, status: 'IN_PROGRESS' }
        });

        if (!attempt) return res.status(404).json({ message: 'Intento no encontrado o ya finalizado.' });

        // Obtener SOLO las preguntas que le tocaron a este estudiante
        let questions;
        if (attempt.question_order) {
            const orderedIds = JSON.parse(attempt.question_order);
            questions = await Question.findAll({ where: { id: orderedIds } });
        } else {
            questions = await Question.findAll({ where: { exam_id: examId } });
        }
        const answers = await StudentAnswer.findAll({ where: { attempt_id: attempt.id } });
        
        let totalScore = 0;
        let totalMaxPoints = 0;
        
        // Calificación automática simple
        for (const q of questions) {
            totalMaxPoints += parseFloat(q.points);
            const studentAns = answers.find(a => a.question_id === q.id);
            if (!studentAns) continue;

            let isCorrect = false;
            let earnedPoints = 0;

            if (q.type === 'SINGLE_CHOICE') {
                const correctOpt = q.options.find(o => o.isCorrect);
                if (correctOpt && studentAns.answer_data === correctOpt.text) {
                    isCorrect = true;
                    earnedPoints = parseFloat(q.points);
                }
            } else if (q.type === 'MULTIPLE_CHOICE') {
                const correctOpts = q.options.filter(o => o.isCorrect).map(o => o.text);
                const studentOpts = Array.isArray(studentAns.answer_data) ? studentAns.answer_data : [];
                
                if (correctOpts.length === studentOpts.length && correctOpts.every(o => studentOpts.includes(o))) {
                    isCorrect = true;
                    earnedPoints = parseFloat(q.points);
                }
            } else if (q.type === 'MATCHING') {
                const studentPairs = studentAns.answer_data || {};
                let correctPairsCount = 0;
                const totalPairs = q.options.length;

                q.options.forEach(opt => {
                    if (studentPairs[opt.term] === opt.match) {
                        correctPairsCount++;
                    }
                });

                if (correctPairsCount === totalPairs) {
                    isCorrect = true;
                }
                
                earnedPoints = (correctPairsCount / totalPairs) * parseFloat(q.points);
            }
            
            await studentAns.update({ is_correct: isCorrect, points_earned: earnedPoints });
            totalScore += earnedPoints;
        }

        // Normalizar a escala 0.0 - 5.0
        let normalizedScore = totalMaxPoints > 0 ? (totalScore / totalMaxPoints) * 5.0 : 0;
        normalizedScore = Math.round(normalizedScore * 10) / 10; // Redondear a 1 decimal

        await attempt.update({
            status: 'COMPLETED',
            finished_at: new Date(),
            final_score: normalizedScore
        });

        res.json({ message: 'Examen finalizado', final_score: normalizedScore });
    } catch (error) {
        console.error('ERROR /api/student/exams/:examId/finish:', error);
        res.status(500).json({ error: error.message });
    }
});

// Obtener revisión detallada del examen (después de finalizar)
app.get('/api/student/exams/:examId/review', authenticate, isStudent, async (req, res) => {
    try {
        const { examId } = req.params;
        const attempt = await StudentExamAttempt.findOne({
            where: { exam_id: examId, student_id: req.user.id }
        });

        if (!attempt || attempt.status === 'IN_PROGRESS') {
            return res.status(403).json({ message: 'Aún no has finalizado este examen.' });
        }

        const exam = await Exam.findByPk(examId, { 
            include: [{ model: Question, as: 'Questions' }] 
        });

        const answers = await StudentAnswer.findAll({
            where: { attempt_id: attempt.id }
        });

        res.json({ exam, attempt, answers });
    } catch (error) {
        console.error('ERROR /api/student/exams/:examId/review:', error);
        res.status(500).json({ error: error.message });
    }
});

// Docente: Actualizar información de su curso (ej: descripción)
app.put('/api/teacher/courses/:courseId', authenticate, isTeacher, async (req, res) => {
    try {
        const { description } = req.body;
        const course = await Course.findByPk(req.params.courseId);
        
        if (!course) return res.status(404).json({ message: 'Curso no encontrado' });
        
        // Un profesor solo debe poder editar sus propios cursos a menos que sea ADMIN
        const role = String(req.user.role).toUpperCase();
        if (role !== 'ADMIN' && course.course_admin_id !== req.user.id) {
            return res.status(403).json({ message: 'Modificación no permitida. Este curso no te pertenece.' });
        }

        await course.update({ description });
        res.json({ message: 'Curso actualizado correctamente', course });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Obtener estudiantes de un curso específico
app.get('/api/teacher/courses/:courseId/students', authenticate, isTeacher, async (req, res) => {
    try {
        const enrollments = await Enrollment.findAll({
            where: { course_id: req.params.courseId },
            include: [{ 
                model: User, 
                attributes: ['id', 'full_name', 'email', 'cc'],
                include: [{ model: Role, attributes: ['name'] }]
            }],
            order: [[User, 'full_name', 'ASC']]
        });
        const students = enrollments.map(e => e.User);
        res.json(students);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Obtener listado de estudiantes (Admin o Docente)
app.get('/api/admin/students', authenticate, isTeacher, async (req, res) => {
    try {
        const students = await User.findAll({
            include: [{ 
                model: Role, 
                where: { name: 'STUDENT' } 
            }],
            attributes: ['id', 'full_name', 'email', 'cc'],
            order: [['full_name', 'ASC']]
        });
        res.json(students);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Asignar estudiante(s) a un curso
app.post('/api/teacher/courses/:courseId/students', authenticate, isTeacher, async (req, res) => {
    try {
        const { student_id, student_ids } = req.body;
        const course_id = req.params.courseId;
        
        // Normalizar a un array de IDs
        const idsToEnroll = Array.isArray(student_ids) ? student_ids : (student_id ? [student_id] : []);
        
        if (idsToEnroll.length === 0) {
            return res.status(400).json({ message: 'No se proporcionaron IDs de estudiantes' });
        }

        const results = {
            enrolled: [],
            alreadyEnrolled: [],
            errors: []
        };

        for (const sId of idsToEnroll) {
            try {
                // Verificar si ya está inscrito
                const existing = await Enrollment.findOne({ where: { student_id: sId, course_id } });
                if (existing) {
                    results.alreadyEnrolled.push(sId);
                    continue;
                }

                const enrollmentId = generateId();
                await Enrollment.create({ id: enrollmentId, student_id: sId, course_id });

                results.enrolled.push(sId);
            } catch (err) {
                results.errors.push({ id: sId, error: err.message });
            }
        }

        res.status(201).json({ 
            message: `Proceso completado: ${results.enrolled.length} matriculados, ${results.alreadyEnrolled.length} ya existentes.`,
            results 
        });
    } catch (error) {
        console.error('❌ Error fatal al asignar estudiantes:', error);
        res.status(500).json({ 
            message: 'Error interno al procesar matrícluas: ' + error.message,
            error: error.message 
        });

    }
});

// Retirar estudiante de un curso
app.delete('/api/teacher/courses/:courseId/students/:studentId', authenticate, isTeacher, async (req, res) => {
    try {
        const { courseId, studentId } = req.params;
        const enrollment = await Enrollment.findOne({ where: { student_id: studentId, course_id: courseId } });
        if (!enrollment) return res.status(404).json({ message: 'Inscripción no encontrada' });
        
        await enrollment.destroy();
        res.json({ message: 'Estudiante retirado del curso' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- RUTAS PARA GESTIÓN DE EXÁMENES (DOCENTES) ---
app.get('/api/teacher/courses/:courseId/exams', authenticate, isTeacher, async (req, res) => {
    try {
        const exams = await Exam.findAll({
            where: { course_id: req.params.courseId },
            include: [{ model: Question, as: 'Questions' }],
            order: [['created_at', 'ASC']]
        });
        res.json(exams);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/teacher/exams', authenticate, isTeacher, async (req, res) => {
    try {
        // Find courses of the teacher
        const courses = await Course.findAll({ where: { course_admin_id: req.user.id } });
        const courseIds = courses.map(c => c.id);
        
        const exams = await Exam.findAll({
            where: { course_id: courseIds },
            include: [{ model: Question, as: 'Questions' }, { model: Course }],
            order: [['created_at', 'DESC']]
        });
        res.json(exams);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


app.post('/api/teacher/courses/:courseId/exams', authenticate, isTeacher, async (req, res) => {
    try {
        const { title, description, activity_date, duration_minutes, questions_limit } = req.body;
        const id = crypto.randomUUID().replace(/-/g, '');
        const newExam = await Exam.create({
            id,
            course_id: req.params.courseId,
            title,
            description,
            activity_date,
            duration_minutes: duration_minutes || 60,
            questions_limit: questions_limit || 0
        });
        res.status(201).json(newExam);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/teacher/exams/:examId', authenticate, isTeacher, async (req, res) => {
    try {
        const { title, description, activity_date, duration_minutes, questions_limit } = req.body;
        const exam = await Exam.findByPk(req.params.examId);
        if (!exam) return res.status(404).json({ message: 'Examen no encontrado' });

        await exam.update({
            title: title || exam.title,
            description: description || exam.description,
            activity_date: activity_date || exam.activity_date,
            duration_minutes: duration_minutes || exam.duration_minutes,
            questions_limit: questions_limit !== undefined ? questions_limit : exam.questions_limit
        });

        res.json({ message: 'Examen actualizado', exam });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Eliminar un examen (el docente puede descartarlo si aún no es relevante)
app.delete('/api/teacher/exams/:examId', authenticate, isTeacher, async (req, res) => {
    try {
        const { examId } = req.params;

        // 1. Verificar que el examen existe
        const exam = await Exam.findByPk(examId, {
            include: [{ model: Course }]
        });
        if (!exam) return res.status(404).json({ message: 'Examen no encontrado' });

        // 2. Verificar que el docente es dueño del curso (o es ADMIN)
        const role = String(req.user.role).toUpperCase();
        if (role !== 'ADMIN' && exam.Course?.course_admin_id !== req.user.id) {
            return res.status(403).json({ message: 'No tienes permiso para eliminar este examen.' });
        }

        // 3. Obtener todos los intentos de este examen
        const attempts = await StudentExamAttempt.findAll({ where: { exam_id: examId } });
        const attemptIds = attempts.map(a => a.id);

        // 4. Eliminar respuestas de los estudiantes
        if (attemptIds.length > 0) {
            await sequelize.query(
                'DELETE FROM student_answers WHERE attempt_id IN (?)',
                { replacements: [attemptIds] }
            );
        }

        // 5. Eliminar intentos de los estudiantes
        await StudentExamAttempt.destroy({ where: { exam_id: examId } });

        // 6. Eliminar preguntas del examen
        await Question.destroy({ where: { exam_id: examId } });

        // 7. Eliminar el examen
        await exam.destroy();

        console.log(`🗑️ Examen ${examId} eliminado por docente ${req.user.id}`);
        res.json({ message: 'Examen eliminado correctamente junto con sus preguntas e intentos.' });

    } catch (error) {
        console.error('❌ Error al eliminar examen:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/teacher/exams/:examId/questions', authenticate, isTeacher, async (req, res) => {
    try {
        const { body, type, points, options } = req.body;
        const id = crypto.randomUUID().replace(/-/g, '');
        
        const count = await Question.count({ where: { exam_id: req.params.examId } });
        
        const newQ = await Question.create({
            id,
            exam_id: req.params.examId,
            body,
            type: type || 'SINGLE_CHOICE',
            points: points || 0,
            options: options || [],
            order_position: count + 1
        });
        res.status(201).json(newQ);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/teacher/exams/:examId/questions/:questionId', authenticate, isTeacher, async (req, res) => {
    try {
        const q = await Question.findByPk(req.params.questionId);
        if(!q) return res.status(404).json({message: 'Pregunta no encontrada'});
        await q.destroy();
        res.json({message: 'Pregunta eliminada'});
    } catch(err) {
        res.status(500).json({error: err.message});
    }
});

app.put('/api/teacher/exams/:examId/questions/:questionId', authenticate, isTeacher, async (req, res) => {
    try {
        const { body, type, points, options } = req.body;
        const q = await Question.findByPk(req.params.questionId);
        if(!q) return res.status(404).json({message: 'Pregunta no encontrada'});
        await q.update({ body, type, points, options });
        res.json({message: 'Pregunta modificada'});
    } catch (err) {
        res.status(500).json({error: err.message});
    }
});

app.delete('/api/teacher/exams/:examId/attempts/:studentId', authenticate, isTeacher, async (req, res) => {
    try {
        // Find existing attempt
        const attempt = await StudentExamAttempt.findOne({
            where: {
                exam_id: req.params.examId,
                student_id: req.params.studentId
            }
        });

        if (!attempt) {
            return res.status(404).json({ message: 'No se encontró un intento para este estudiante' });
        }

        // Delete associated answers if any (to enable an actual reset)
        // Usually you'd also delete StudentAnswers, but let's just delete the attempt, ON DELETE CASCADE should handle it if set, if not we delete manually
        // We will just delete the attempt
        await sequelize.query('DELETE FROM student_answers WHERE attempt_id = ?', {
            replacements: [attempt.id]
        });

        await attempt.destroy();

        res.json({ message: 'Intento reiniciado. El estudiante tiene una segunda oportunidad.' });
    } catch (error) {
        console.error('Error resetting attempt:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/teacher/exams/:examId/attempts', authenticate, isTeacher, async (req, res) => {
    try {
        const attempts = await StudentExamAttempt.findAll({
            where: { exam_id: req.params.examId },
            include: [{ model: User, attributes: ['id', 'full_name', 'email'] }]
        });
        res.json(attempts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Docente: Obtener detalle completo de un intento para calificar
app.get('/api/teacher/attempts/:attemptId/review', authenticate, isTeacher, async (req, res) => {
    try {
        const { attemptId } = req.params;
        const attempt = await StudentExamAttempt.findByPk(attemptId, {
            include: [{ model: User, attributes: ['full_name', 'email'] }]
        });

        if (!attempt) return res.status(404).json({ message: 'Intento no encontrado' });

        const exam = await Exam.findByPk(attempt.exam_id, {
            include: [{ model: Question, as: 'Questions' }]
        });

        const answers = await StudentAnswer.findAll({
            where: { attempt_id: attemptId }
        });

        res.json({ attempt, exam, answers });
    } catch (error) {
        logError('ERROR /api/teacher/attempts/:attemptId/review', error);
        res.status(500).json({ error: error.message });
    }
});

// Docente: Calificar/Corregir una respuesta manualmente
app.put('/api/teacher/attempts/:attemptId/answers/:answerId', authenticate, isTeacher, async (req, res) => {
    try {
        const { attemptId, answerId } = req.params;
        const { points_earned, is_correct } = req.body;

        const answer = await StudentAnswer.findByPk(answerId);
        if (!answer) return res.status(404).json({ message: 'Respuesta no encontrada' });

        // Actualizar respuesta
        await answer.update({ 
            points_earned: parseFloat(points_earned),
            is_correct: is_correct !== undefined ? is_correct : (parseFloat(points_earned) > 0)
        });

        // Recalcular nota final del intento
        const attempt = await StudentExamAttempt.findByPk(attemptId);
        const questions = await Question.findAll({ where: { exam_id: attempt.exam_id } });
        const allAnswers = await StudentAnswer.findAll({ where: { attempt_id: attemptId } });

        let totalScore = 0;
        let totalMaxPoints = 0;

        for (const q of questions) {
            totalMaxPoints += parseFloat(q.points);
            const ans = allAnswers.find(a => a.question_id === q.id);
            if (ans) {
                totalScore += parseFloat(ans.points_earned || 0);
            }
        }

        let normalizedScore = totalMaxPoints > 0 ? (totalScore / totalMaxPoints) * 5.0 : 0;
        normalizedScore = Math.round(normalizedScore * 10) / 10;

        await attempt.update({ final_score: normalizedScore });

        res.json({ message: 'Calificación actualizada', normalizedScore, answer });
    } catch (error) {
        logError('ERROR /api/teacher/attempts/:attemptId/answers/:answerId', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/', (req, res) => res.json({ message: 'Servidor UniCórdoba Funcionando' }));

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({
            where: { email },
            include: [{ model: Role, attributes: ['name'] }]
        });

        if (user) {
            // Comparación de password real con bcrypt
            const validPassword = await bcrypt.compare(password, user.password);
            if (!validPassword && password !== user.password) { // Backup para passwords planos de prueba
                return res.status(401).json({ message: 'Credenciales inválidas' });
            }

            const userJson = user.toJSON();
            delete userJson.password;
            res.json({
                message: 'Login exitoso',
                user: { ...userJson, role: userJson.Role.name },
                token: 'token_ficticio_admin_123'
            });
        } else {
            res.status(401).json({ message: 'Usuario no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const nodemailer = require('nodemailer');

app.post('/api/auth/forgot-password', async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: 'Si el correo está registrado, recibirás un enlace de recuperación.' });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const tokenExpires = new Date(Date.now() + 3600000); // 1 hora

        await user.update({
            reset_password_token: resetToken,
            reset_password_expires: tokenExpires
        });

        const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

        // Para evitar enviar el correo si no hay credenciales, saltamos nodemailer
        if (!process.env.EMAIL_USER) {
            console.log('🔗 Link de recuperación generado (Email no configurado):', resetLink);
            // IMPORTANTE: En entorno de desarrollo sin correo, devolvemos el token para que el frontend o el dev puedan probarlo. 
            // En producción esto es un hueco de seguridad gravísimo y no debe ir así.
            return res.status(200).json({ 
                message: 'Modo desarrollo: revisa la consola del servidor o copia el enlace de abajo.',
                dev_reset_link: resetLink
            });
        }

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER || 'no-reply@unicordoba.edu.co',
            to: user.email,
            subject: 'Recuperación de Contraseña - UniCórdoba',
            text: `Hola ${user.full_name},\n\nHas solicitado restablecer tu contraseña.\nPor favor, haz clic en el siguiente enlace para crear una nueva contraseña:\n\n${resetLink}\n\nEste enlace expirará en 1 hora. Si no solicitaste este cambio, ignora este correo.\n\nAtentamente,\nEquipo de Soporte UniCórdoba`,
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Si el correo está registrado, recibirás un enlace de recuperación.' });
    } catch (error) {
        console.error('Error en forgot-password:', error);
        res.status(500).json({ message: 'Error interno del servidor. Por favor intenta más tarde.' });
    }
});

app.post('/api/auth/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;
    try {
        const user = await User.findOne({ 
            where: { 
                reset_password_token: token,
                reset_password_expires: {
                    [Op.gt]: new Date()
                }
            } 
        });

        if (!user) {
            return res.status(400).json({ message: 'El token es inválido o ha expirado.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await user.update({
            password: hashedPassword,
            reset_password_token: null,
            reset_password_expires: null
        });

        res.status(200).json({ message: 'Contraseña restablecida exitosamente.' });
    } catch (error) {
        console.error('Error en reset-password:', error);
        res.status(500).json({ message: 'Error interno del servidor. Por favor intenta más tarde.' });
    }
});

app.listen(PORT, () => console.log(`🚀 Servidor en puerto ${PORT}`));
