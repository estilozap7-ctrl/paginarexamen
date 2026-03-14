const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');
const StudentExamAttempt = require('./StudentExamAttempt');
const Question = require('./Question');

const StudentAnswer = sequelize.define('StudentAnswer', {
  id: {
    type: DataTypes.STRING(36),
    primaryKey: true
  },
  attempt_id: {
    type: DataTypes.STRING(36),
    references: { model: StudentExamAttempt, key: 'id' }
  },
  question_id: {
    type: DataTypes.STRING(36),
    references: { model: Question, key: 'id' }
  },
  // We store the answer as a JSON string to handle different types (Single ID, Array of IDs, Matching map, or Text)
  answer_data: {
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      const rawValue = this.getDataValue('answer_data');
      if (!rawValue) return null;
      if (typeof rawValue === 'object') return rawValue;
      try {
        return JSON.parse(rawValue);
      } catch (e) {
        console.error('Error parsing StudentAnswer data:', e);
        return null;
      }
    },
    set(value) {
      if (value) {
        this.setDataValue('answer_data', JSON.stringify(value));
      }
    }
  },
  is_correct: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  points_earned: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0.00
  }
}, {
  tableName: 'student_answers',
  timestamps: false
});

// Relationships
StudentAnswer.belongsTo(StudentExamAttempt, { foreignKey: 'attempt_id' });
StudentExamAttempt.hasMany(StudentAnswer, { foreignKey: 'attempt_id', as: 'Answers' });

StudentAnswer.belongsTo(Question, { foreignKey: 'question_id' });

module.exports = StudentAnswer;
