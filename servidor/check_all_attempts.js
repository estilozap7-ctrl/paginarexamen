const StudentExamAttempt = require('./models/StudentExamAttempt');
const User = require('./models/User');

async function check() {
    try {
        const attempts = await StudentExamAttempt.findAll({
            include: [{ model: User, attributes: ['full_name', 'email'] }]
        });
        
        console.log('--- ALL ATTEMPTS IN DB ---');
        attempts.forEach(a => {
            console.log(`Student: ${a.User?.full_name} | Email: ${a.User?.email} | Score: ${a.final_score} | Status: ${a.status}`);
        });
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
