const Exam = require('./models/Exam');

async function check() {
    try {
        const exams = await Exam.findAll();
        console.log('--- ALL EXAMS ---');
        exams.forEach(e => {
            console.log(`${e.title} | ${e.id} | Course: ${e.course_id}`);
        });
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
