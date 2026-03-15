const { Sequelize } = require('sequelize');
const bcrypt = require('bcryptjs');

const sequelize = new Sequelize(
    'admingemcrak_l',
    'admingemcrak',
    'Geminis12345*.+',
    {
        host: 'mysql-admingemcrak.alwaysdata.net',
        dialect: 'mysql',
        logging: false
    }
);

async function resetLuisPassword() {
    try {
        const hash = await bcrypt.hash('admin123', 10);
        const [results] = await sequelize.query(
            "UPDATE users SET password = :hash WHERE email = 'luisbuelvasc@correo.unicordoba.edu.co'",
            { replacements: { hash } }
        );
        
        console.log('✅ Contraseña de Luis Buelvas actualizada a: admin123');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error al actualizar:', err);
        process.exit(1);
    }
}

resetLuisPassword();
