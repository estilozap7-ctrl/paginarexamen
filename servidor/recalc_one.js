const Exam = require('./models/Exam');
const Question = require('./models/Question');
const StudentAnswer = require('./models/StudentAnswer');
const StudentExamAttempt = require('./models/StudentExamAttempt');

async function check() {
    try {
        const examId = 'b490a4307167453b92cdb7701849237f';
        const attemptId = '3725867338b644fca3831c45b63c92';
        
        const questions = await Question.findAll({ where: { exam_id: examId } });
        const answers = await StudentAnswer.findAll({ where: { attempt_id: attemptId } });
        
        let totalMax = 0;
        questions.forEach(q => totalMax += parseFloat(q.points));
        
        let totalEarned = 0;
        answers.forEach(a => totalEarned += parseFloat(a.points_earned));
        
        const normalized = totalMax > 0 ? (totalEarned / totalMax) * 5.0 : 0;
        
        console.log(`Exam: ${examId} | Total Max Points: ${totalMax}`);
        console.log(`Attempt: ${attemptId} | Total Earned: ${totalEarned}`);
        console.log(`CALCULATED SCORE (0-5): ${normalized.toFixed(1)}`);
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
