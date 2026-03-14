const { sequelize } = require('./db');

async function fix() {
    try {
        console.log('--- CLEANING UP DUPLICATE ATTEMPTS ---');
        
        // Find students with multiple attempts for the same exam
        const [duplicates] = await sequelize.query(`
            SELECT student_id, exam_id, COUNT(*) as count
            FROM student_exam_attempts
            GROUP BY student_id, exam_id
            HAVING count > 1
        `);
        
        for (const dup of duplicates) {
            console.log(`Found ${dup.count} attempts for Student: ${dup.student_id} on Exam: ${dup.exam_id}`);
            
            // Get all attempts for this student/exam
            const [attempts] = await sequelize.query(`
                SELECT id, final_score, status, started_at 
                FROM student_exam_attempts 
                WHERE student_id = ? AND exam_id = ?
                ORDER BY final_score DESC, started_at DESC
            `, { replacements: [dup.student_id, dup.exam_id] });
            
            // Keep the one with the highest score (or the first one if all are 0)
            const keepId = attempts[0].id;
            const deleteIds = attempts.slice(1).map(a => a.id);
            
            console.log(`Keeping Attempt ID: ${keepId} (Score: ${attempts[0].final_score})`);
            console.log(`Deleting Attempt IDs: ${deleteIds.join(', ')}`);
            
            if (deleteIds.length > 0) {
                // Delete answers of the attempts to be deleted
                await sequelize.query('DELETE FROM student_answers WHERE attempt_id IN (?)', {
                    replacements: [deleteIds]
                });
                
                // Delete the attempts
                await sequelize.query('DELETE FROM student_exam_attempts WHERE id IN (?)', {
                    replacements: [deleteIds]
                });
            }
        }
        
        console.log('Cleanup complete.');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

fix();
