const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Appointment = sequelize.define('Appointment', {
    date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    // --- AJOUTS ---
    isPaid: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    price: { // On stocke le prix payé pour les stats du Pro
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0
    },
    stripePaymentId: {
        type: DataTypes.STRING,
        allowNull: true
    },
    stripePaymentIntentId: {
        type: DataTypes.STRING,
        allowNull: true
      }

    // --------------
});

module.exports = Appointment;