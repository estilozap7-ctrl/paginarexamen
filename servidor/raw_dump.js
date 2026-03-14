const StudentExamAttempt = require('./models/StudentExamAttempt');
const User = require('./models/User');

async function check() {
    try {
        const attempts = await StudentExamAttempt.findAll({ raw: true });
        console.log('--- RAW ATTEMPTS ---');
        console.log(JSON.stringify(attempts, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
