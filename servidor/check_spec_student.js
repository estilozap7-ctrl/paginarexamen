const StudentExamAttempt = require('./models/StudentExamAttempt');
const User = require('./models/User');

async function check() {
    try {
        const studentId = '909618b0e8c845b7969da8a777dbe525';
        const attempts = await StudentExamAttempt.findAll({
            where: { student_id: studentId },
            raw: true
        });
        
        console.log(`--- ATTEMPTS FOR STUDENT ${studentId} ---`);
        console.log(JSON.stringify(attempts, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
