const User = require('./models/User');
const StudentExamAttempt = require('./models/StudentExamAttempt');

async function check() {
    try {
        const user = await User.findOne({ where: { email: 'labc.1021@gmail.com' } });
        if (!user) {
            console.log('User not found');
            process.exit(1);
        }
        
        const attempts = await StudentExamAttempt.findAll({
            where: { student_id: user.id },
            order: [['started_at', 'ASC']]
        });
        
        console.log(`--- ATTEMPTS FOR ${user.full_name} (${user.id}) ---`);
        attempts.forEach(a => {
            console.log(`ID: ${a.id} | ExamID: ${a.exam_id} | Score: ${a.final_score} | Status: ${a.status} | Started: ${a.started_at}`);
        });
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
