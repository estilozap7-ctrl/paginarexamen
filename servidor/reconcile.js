const { sequelize } = require('./db');
const StudentExamAttempt = require('./models/StudentExamAttempt');
const User = require('./models/User');

async function check() {
    try {
        const [results] = await sequelize.query(`
            SELECT 
                a.id as attempt_id, 
                u.full_name, 
                a.final_score, 
                a.status,
                SUM(ans.points_earned) as total_answer_points
            FROM student_exam_attempts a
            JOIN users u ON a.student_id = u.id
            LEFT JOIN student_answers ans ON a.id = ans.attempt_id
            GROUP BY a.id, u.full_name, a.final_score, a.status
        `);
        
        console.log('--- ATTEMPT RECONCILIATION ---');
        console.log(JSON.stringify(results, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
