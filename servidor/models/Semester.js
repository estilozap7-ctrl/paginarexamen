const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');

const Semester = sequelize.define('Semester', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  code: {
    type: DataTypes.STRING(10),
    allowNull: false,
    unique: true
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  start_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  end_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  }
}, {
  tableName: 'semesters',
  timestamps: false
});

module.exports = Semester;
