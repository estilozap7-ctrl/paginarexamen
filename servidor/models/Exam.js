const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');
const Course = require('./Course');

const Exam = sequelize.define('Exam', {
  id: {
    type: DataTypes.STRING(36),
    primaryKey: true
  },
  course_id: {
    type: DataTypes.STRING(36),
    references: { model: Course, key: 'id' }
  },
  title: {
    type: DataTypes.STRING(150),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  activity_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  question_org: {
    type: DataTypes.ENUM('LINEAR', 'RANDOM'),
    defaultValue: 'LINEAR'
  },
  answer_org: {
    type: DataTypes.ENUM('LINEAR', 'RANDOM'),
    defaultValue: 'LINEAR'
  },
  duration_minutes: {
    type: DataTypes.INTEGER,
    defaultValue: 60
  },
  is_published: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  questions_limit: {
    type: DataTypes.INTEGER,
    defaultValue: 0 // 0 means show all
  }
}, {
  tableName: 'exams',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

// Relación
Exam.belongsTo(Course, { foreignKey: 'course_id' });
Course.hasMany(Exam, { foreignKey: 'course_id' });

module.exports = Exam;
