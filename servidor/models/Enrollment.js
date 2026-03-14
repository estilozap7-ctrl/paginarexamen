const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');
const User = require('./User');
const Course = require('./Course');

const Enrollment = sequelize.define('Enrollment', {
  id: {
    type: DataTypes.STRING(36),
    primaryKey: true
  },
  student_id: {
    type: DataTypes.STRING(36),
    references: { model: User, key: 'id' }
  },
  course_id: {
    type: DataTypes.STRING(36),
    references: { model: Course, key: 'id' }
  },
  enrollment_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'enrollments',
  timestamps: false
});

// Relaciones
Enrollment.belongsTo(User, { foreignKey: 'student_id' });
Enrollment.belongsTo(Course, { foreignKey: 'course_id' });
User.hasMany(Enrollment, { foreignKey: 'student_id' });
Course.hasMany(Enrollment, { foreignKey: 'course_id' });

module.exports = Enrollment;
