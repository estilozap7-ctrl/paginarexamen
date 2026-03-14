// Configuración centralizada para la base de datos
// Estos datos se cargan desde el .env de la carpeta cliente
export const dbConfig = {
  host: import.meta.env.VITE_DB_HOST,
  user: import.meta.env.VITE_DB_USER,
  password: import.meta.env.VITE_DB_PASS,
  database: import.meta.env.VITE_DB_NAME,
  port: parseInt(import.meta.env.VITE_DB_PORT) || 3306,
};
