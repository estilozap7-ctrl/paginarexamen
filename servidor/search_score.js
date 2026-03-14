const { sequelize } = require('./db');

async function check() {
    try {
        console.log('--- SEARCHING FOR 3.8 IN THE DATABASE ---');
        
        // Search in student_exam_attempts
        const [attempts] = await sequelize.query('SELECT * FROM student_exam_attempts WHERE final_score > 0');
        console.log('Attempts with non-zero score:', JSON.stringify(attempts, null, 2));

        // Search in student_answers
        const [answers] = await sequelize.query('SELECT * FROM student_answers WHERE points_earned > 0');
        console.log('Answers with non-zero points:', JSON.stringify(answers, null, 2));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
