const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const sequelize = require('./config/database');
const Appointment = require('./models/Appointment');
const serviceRoutes = require('./routes/serviceRoutes');
const Service = require('./models/Service');
const User = require('./models/User');
const appointmentRoutes = require('./routes/appointmentRoutes');

const app = express();

app.use(express.json());
app.use(cors());

Service.hasMany(Appointment, { foreignKey: 'serviceId' });
Appointment.belongsTo(Service, { foreignKey: 'serviceId' });

User.hasMany(Appointment, { foreignKey: 'clientId' });
Appointment.belongsTo(User, { foreignKey: 'clientId' });


User.hasMany(Service, { foreignKey: 'userId' });
Service.belongsTo(User, { foreignKey: 'userId' });

app.get('/', (req, res) => {
  res.send('API Saas Rendez-vous (Sequelize) fonctionne ! 🚀');
});
app.use('/api/services', serviceRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);

const PORT = 3000;


sequelize.sync({ force: false }).then(() => {
  console.log('Base de données synchronisée !');
  app.listen(PORT, () => {
    console.log(`Serveur lancé sur http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('Impossible de se connecter à la BDD:', err);
});