const { sequelize } = require('./db');

async function check() {
    try {
        const [results] = await sequelize.query('SELECT * FROM student_exam_attempts WHERE final_score > 0');
        console.log('--- ALL POSITIVE SCORES ---');
        console.log(JSON.stringify(results, null, 2));
        process.exit(0);
    } catch (err) {
        process.exit(1);
    }
}

check();
