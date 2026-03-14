const StudentExamAttempt = require('./models/StudentExamAttempt');
const User = require('./models/User');

async function check() {
    try {
        const attempts = await StudentExamAttempt.findAll({
            where: { final_score: 3.8 },
            include: [{ model: User }]
        });
        
        console.log('--- OWNER OF 3.8 ATTEMPT ---');
        attempts.forEach(a => {
            console.log(`Attempt ID: ${a.id} | User Name: ${a.User?.full_name} | User ID: ${a.User?.id} | Email: ${a.User?.email}`);
        });
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
