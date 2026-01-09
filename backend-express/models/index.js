const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

// 1. Importation des modèles
const User = require('./User');
const Service = require('./Service');
const Appointment = require('./Appointment');

// 2. Définition des Relations (On les a déplacées ici)
Service.hasMany(Appointment, { foreignKey: 'serviceId' });
Appointment.belongsTo(Service, { foreignKey: 'serviceId' });

User.hasMany(Appointment, { foreignKey: 'clientId' });
Appointment.belongsTo(User, { foreignKey: 'clientId' });

User.hasMany(Service, { foreignKey: 'userId' });
Service.belongsTo(User, { foreignKey: 'userId' });

// 3. Exportation groupée
module.exports = {
    sequelize,
    User,
    Service,
    Appointment
};