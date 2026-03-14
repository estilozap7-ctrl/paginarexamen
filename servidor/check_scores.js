const User = require('./models/User');
const Exam = require('./models/Exam');
const StudentExamAttempt = require('./models/StudentExamAttempt');

async function check() {
    try {
        const attempts = await StudentExamAttempt.findAll({
            include: [
                { model: User, attributes: ['id', 'full_name', 'email'] },
                { model: Exam, attributes: ['id', 'title'] }
            ],
            order: [['started_at', 'ASC']]
        });
        
        console.log('--- ALL ATTEMPTS ---');
        attempts.forEach(a => {
            console.log(`ID: ${a.id} | Student: ${a.User?.full_name} (${a.student_id}) | Exam: ${a.Exam?.title} | Score: ${a.final_score} | Status: ${a.status} | Started: ${a.started_at}`);
        });
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
