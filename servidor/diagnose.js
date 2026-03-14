const { sequelize } = require('./db');
const User = require('./models/User');
const Exam = require('./models/Exam');
const Question = require('./models/Question');
const StudentExamAttempt = require('./models/StudentExamAttempt');
const StudentAnswer = require('./models/StudentAnswer');

async function check() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connection stable.');
    
    const tables = await sequelize.getQueryInterface().showAllTables();
    console.log('Existing tables:', tables);
    
    if (!tables.includes('student_answers')) {
      console.log('⚠️ student_answers table MISSING! Attempting to sync...');
      await StudentAnswer.sync({ alter: true });
      console.log('✅ student_answers synced.');
    } else {
      console.log('✅ student_answers table exists.');
    }
    
    // Check if we can query Exam with Questions
    const exam = await Exam.findOne({ include: [{ model: Question, as: 'Questions' }] });
    console.log('✅ Exam query test passed.');
    
  } catch (err) {
    console.error('❌ Diagnostic error:', err);
  } finally {
    process.exit();
  }
}

check();
