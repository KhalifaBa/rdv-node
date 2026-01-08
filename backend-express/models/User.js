const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    role: {
        type: DataTypes.STRING,
        defaultValue: 'CLIENT' 
    },
    // --- NOUVEAUX CHAMPS ---
    openingHour: {
        type: DataTypes.INTEGER,
        defaultValue: 9 // Par défaut 9h00
    },
    closingHour: {
        type: DataTypes.INTEGER,
        defaultValue: 19 // Par défaut 19h00
    }
    // -----------------------
});

module.exports = User;