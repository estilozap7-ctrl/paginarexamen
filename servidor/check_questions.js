const Question = require('./models/Question');

async function check() {
    try {
        const exams = ['b490a4307167453b92cdb7701849237f'];
        for (const examId of exams) {
            const questions = await Question.findAll({ where: { exam_id: examId } });
            console.log(`--- QUESTIONS FOR EXAM ${examId} ---`);
            questions.forEach(q => {
                console.log(`ID: ${q.id} | Type: ${q.type} | Points: ${q.points} | Body: ${q.body.substring(0, 30)}`);
            });
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
