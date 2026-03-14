const StudentAnswer = require('./models/StudentAnswer');
const Question = require('./models/Question');

async function check() {
    try {
        const attemptId = '51a9456119d245fda495fec09270b5a8';
        const answers = await StudentAnswer.findAll({
            where: { attempt_id: attemptId }
        });
        
        console.log(`--- ANSWERS FOR ATTEMPT ${attemptId} ---`);
        let total = 0;
        answers.forEach(ans => {
            console.log(`QuestionID: ${ans.question_id} | Points: ${ans.points_earned} | Correct: ${ans.is_correct}`);
            total += parseFloat(ans.points_earned || 0);
        });
        console.log(`TOTAL RAW SCORE: ${total}`);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
