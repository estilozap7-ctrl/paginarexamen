const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');
const User = require('./User');
const Exam = require('./Exam');

const StudentExamAttempt = sequelize.define('StudentExamAttempt', {
  id: {
    type: DataTypes.STRING(36),
    primaryKey: true
  },
  student_id: {
    type: DataTypes.STRING(36),
    references: { model: User, key: 'id' }
  },
  exam_id: {
    type: DataTypes.STRING(36),
    references: { model: Exam, key: 'id' }
  },
  started_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  finished_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  final_score: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0.00
  },
  status: {
    type: DataTypes.ENUM('IN_PROGRESS', 'COMPLETED', 'EXPIRED'),
    defaultValue: 'IN_PROGRESS'
  },
  question_order: {
    type: DataTypes.TEXT,
    allowNull: true // Stores JSON string of selected question IDs
  }
}, {
  tableName: 'student_exam_attempts',
  timestamps: false
});

// Relaciones
StudentExamAttempt.belongsTo(User, { foreignKey: 'student_id' });
StudentExamAttempt.belongsTo(Exam, { foreignKey: 'exam_id' });
User.hasMany(StudentExamAttempt, { foreignKey: 'student_id' });
Exam.hasMany(StudentExamAttempt, { foreignKey: 'exam_id', as: 'StudentExamAttempts' });

module.exports = StudentExamAttempt;
