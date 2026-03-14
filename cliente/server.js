import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar variables de entorno desde el .env que está en la misma carpeta
dotenv.config();

const app = express();
// AlwaysData proporciona estas variables automáticamente
const PORT = process.env.PORT || 5000;
const HOST = process.env.IP || '0.0.0.0'; 

app.use(cors());
app.use(express.json());

// Crear conexión a la base de datos de AlwaysData
const dbConfig = {
    host: process.env.VITE_DB_HOST,
    user: process.env.VITE_DB_USER,
    password: process.env.VITE_DB_PASS,
    database: process.env.VITE_DB_NAME,
    port: parseInt(process.env.VITE_DB_PORT) || 3306,
};

// Configuración de pool de conexiones para mejor rendimiento
const pool = mysql.createPool({
    ...dbConfig,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// 1. Ruta de prueba: Verificar si el servidor llega a AlwaysData
app.get('/api/test-db', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT 1 + 1 AS result');
        res.json({ message: 'Conexión exitosa con AlwaysData', result: rows[0].result });
    } catch (error) {
        console.error('Error de conexión:', error);
        res.status(500).json({ error: 'No se pudo conectar a AlwaysData', details: error.message });
    }
});

// 2. Ruta de Login: Autenticación de usuarios
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    
    console.log(`Intentando login para: ${email}`);

    try {
        const [rows] = await pool.execute(
            'SELECT * FROM users WHERE email = ? AND password = ?',
            [email, password]
        );

        if (rows.length > 0) {
            const user = rows[0];
            delete user.password;
            res.json({ message: 'Login exitoso', user: user });
        } else {
            res.status(401).json({ message: 'Credenciales inválidas' });
        }
    } catch (error) {
        console.error('Error en DB:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// 3. Gestión: Obtener todos los usuarios
app.get('/api/admin/users', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT id, full_name, email, cc FROM users');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 4. Gestión: Obtener cursos registrados
app.get('/api/admin/courses', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM courses');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, HOST, () => {
    console.log(`Servidor corriendo en http://${HOST}:${PORT}`);
    console.log(`Conectado a la base de datos: ${dbConfig.host}`);
});
