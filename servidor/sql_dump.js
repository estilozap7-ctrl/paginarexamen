const { sequelize } = require('./db');

async function check() {
    try {
        const [results] = await sequelize.query('SELECT * FROM student_exam_attempts');
        console.log('--- RAW SQL DUMP ---');
        console.log(JSON.stringify(results, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
