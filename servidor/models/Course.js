const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');
const Semester = require('./Semester');
const User = require('./User');

const Course = sequelize.define('Course', {
  id: {
    type: DataTypes.STRING(36),
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  subject_code: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  semester_id: {
    type: DataTypes.INTEGER,
    references: { model: Semester, key: 'id' }
  },
  course_admin_id: {
    type: DataTypes.STRING(36),
    references: { model: User, key: 'id' }
  }
}, {
  tableName: 'courses',
  timestamps: false
});

// Relaciones
Course.belongsTo(Semester, { foreignKey: 'semester_id' });
Course.belongsTo(User, { as: 'Admin', foreignKey: 'course_admin_id' });

module.exports = Course;
