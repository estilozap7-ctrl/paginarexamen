const StudentExamAttempt = require('./models/StudentExamAttempt');
const Exam = require('./models/Exam');

async function check() {
    try {
        const attempts = await StudentExamAttempt.findAll({
            include: [{ model: Exam }]
        });
        
        console.log('--- ATTEMPT TO EXAM ID MAPPING ---');
        attempts.forEach(a => {
            console.log(`Attempt ID: ${a.id} | Exam Name: ${a.Exam?.title} | Exam ID: ${a.exam_id} | Score: ${a.final_score}`);
        });
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
