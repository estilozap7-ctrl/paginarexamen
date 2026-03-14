const StudentExamAttempt = require('./models/StudentExamAttempt');
const User = require('./models/User');

async function check() {
    try {
        const attempts = await StudentExamAttempt.findAll({
            include: [{ model: User }]
        });
        
        console.log('--- ATTEMPT TO USER MAPPING ---');
        attempts.forEach(a => {
            console.log(`Attempt ID: ${a.id} | User Name: ${a.User?.full_name} | User ID: ${a.User?.id} | Email: ${a.User?.email} | Score: ${a.final_score}`);
        });
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
