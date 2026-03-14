const StudentExamAttempt = require('./models/StudentExamAttempt');
const User = require('./models/User');

async function check() {
    try {
        const attemptId = '3725867338b644fca3831c45b63c92...'; // I'll use a partial id search or just list all
        const attempts = await StudentExamAttempt.findAll({
            include: [{ model: User }]
        });
        
        console.log('--- ALL ATTEMPTS ---');
        attempts.forEach(a => {
            console.log(`ID: ${a.id} | User: ${a.User?.full_name} | Score: ${a.final_score}`);
        });
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
