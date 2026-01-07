const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const sequelize = require('./config/database');
const Appointment = require('./models/Appointment');
const serviceRoutes = require('./routes/serviceRoutes');
const Service = require('./models/Service');
const User = require('./models/User'); // On importe pour que Sequelize le connaisse
const appointmentRoutes = require('./routes/appointmentRoutes');

const app = express();

app.use(express.json());
app.use(cors());

// 1. Un Service a plusieurs RDV, et un RDV appartient à un Service
Service.hasMany(Appointment, { foreignKey: 'serviceId' });
Appointment.belongsTo(Service, { foreignKey: 'serviceId' });

// 2. Un Utilisateur (Client) a plusieurs RDV
User.hasMany(Appointment, { foreignKey: 'clientId' });
Appointment.belongsTo(User, { foreignKey: 'clientId' });

// 3. Un Utilisateur (Pro) a plusieurs Services
User.hasMany(Service, { foreignKey: 'userId' });
Service.belongsTo(User, { foreignKey: 'userId' });

app.get('/', (req, res) => {
  res.send('API Saas Rendez-vous (Sequelize) fonctionne ! 🚀');
});
app.use('/api/services', serviceRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);
// Synchronisation de la BDD et lancement du serveur
const PORT = 3000;

// { force: true } efface la BDD à chaque redémarrage (bien pour le dev au début)
// { alter: true } modifie la table si tu changes le modèle
sequelize.sync({ force: false }).then(() => {
  console.log('Base de données synchronisée !');
  app.listen(PORT, () => {
    console.log(`Serveur lancé sur http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('Impossible de se connecter à la BDD:', err);
});