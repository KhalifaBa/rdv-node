const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Service = sequelize.define('Service', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  duration: {
    type: DataTypes.INTEGER, // En minutes (ex: 30)
    allowNull: false
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  userId: { // La Clé Étrangère (Lien vers le User qui a créé le service)
    type: DataTypes.INTEGER,
    allowNull: false
  }
});

module.exports = Service;