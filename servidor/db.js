const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'mysql',
        logging: false, // Opcional: poner true para ver las queries en consola
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
);

const testConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Conexión con Sequelize establecida correctamente a AlwaysData.');
    } catch (error) {
        console.error('❌ No se pudo conectar a la base de datos:', error);
    }
};

module.exports = { sequelize, testConnection };
