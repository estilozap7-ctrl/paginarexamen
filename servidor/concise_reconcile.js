const { sequelize } = require('./db');

async function check() {
    try {
        const [results] = await sequelize.query(`
            SELECT a.id, a.student_id, a.final_score 
            FROM student_exam_attempts a 
            WHERE a.final_score > 0 OR a.final_score < 1 -- Just show everything non-zero or interesting
        `);
        
        console.log('--- ALL NON-EMPTY SCORES ---');
        results.forEach(r => {
            console.log(`Attempt: ${r.id} | StudentID: ${r.student_id} | Score: ${r.final_score}`);
        });
        process.exit(0);
    } catch (err) {
        process.exit(1);
    }
}

check();
