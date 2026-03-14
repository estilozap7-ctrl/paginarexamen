const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');
const Exam = require('./Exam');

const Question = sequelize.define('Question', {
  id: {
    type: DataTypes.STRING(36),
    primaryKey: true
  },
  exam_id: {
    type: DataTypes.STRING(36),
    references: { model: Exam, key: 'id' }
  },
  body: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  order_position: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  type: {
    type: DataTypes.ENUM('MULTIPLE_CHOICE', 'SINGLE_CHOICE', 'MATCHING', 'TEXT_DEVELOPMENT'),
    defaultValue: 'SINGLE_CHOICE'
  },
  points: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0.00
  },
  options: {
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      const rawValue = this.getDataValue('options');
      if (!rawValue) return [];
      if (typeof rawValue === 'object') return rawValue;
      try {
        return JSON.parse(rawValue);
      } catch (e) {
        console.error('Error parsing Question options:', e);
        return [];
      }
    },
    set(value) {
      if (value) {
        this.setDataValue('options', JSON.stringify(value));
      }
    }
  }
}, {
  tableName: 'questions',
  timestamps: false
});

// Relación
Question.belongsTo(Exam, { foreignKey: 'exam_id' });
Exam.hasMany(Question, { foreignKey: 'exam_id', as: 'Questions' });

module.exports = Question;
