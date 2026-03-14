const { sequelize } = require('./db');
const StudentAnswer = require('./models/StudentAnswer');
const Question = require('./models/Question');

async function check() {
    try {
        const attemptId = '3725867338b644fca3831c45b63c92';
        const answers = await StudentAnswer.findAll({
            where: { attempt_id: attemptId },
            include: [{ model: Question }]
        });
        
        console.log(`--- DETAIL FOR ATTEMPT ${attemptId} ---`);
        answers.forEach(ans => {
            console.log(`Qid: ${ans.question_id} | QType: ${ans.Question?.type} | Earned: ${ans.points_earned} | Max: ${ans.Question?.points}`);
        });
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
