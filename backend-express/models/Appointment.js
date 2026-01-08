const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Appointment = sequelize.define('Appointment', {
  date: {
    type: DataTypes.DATE, 
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'CONFIRMED' 
  },
  clientId: { 
    type: DataTypes.INTEGER,
    allowNull: false
  },
  serviceId: { 
    type: DataTypes.INTEGER,
    allowNull: false
  }
});

module.exports = Appointment;