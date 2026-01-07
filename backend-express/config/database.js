const { Sequelize } = require('sequelize');

// On crée la connexion à un fichier SQLite local (database.sqlite)
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite', // Le fichier sera créé à la racine
  logging: false // Mettre à true si tu veux voir les requêtes SQL dans la console
});

module.exports = sequelize;