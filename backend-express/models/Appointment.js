const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Appointment = sequelize.define('Appointment', {
  date: {
    type: DataTypes.DATE, // Sequelize gère les dates JS standard
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'CONFIRMED' // Pour l'instant, on confirme direct
  },
  clientId: { // L'utilisateur qui réserve
    type: DataTypes.INTEGER,
    allowNull: false
  },
  serviceId: { // Le service réservé
    type: DataTypes.INTEGER,
    allowNull: false
  }
});

module.exports = Appointment;