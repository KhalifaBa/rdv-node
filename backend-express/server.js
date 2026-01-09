const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser'); // <--- 1. IMPORT
const sequelize = require('./config/database');
require('dotenv').config();
// Import des modèles
const User = require('./models/User');
const Service = require('./models/Service');
const Appointment = require('./models/Appointment');

const app = express();

// Remplace la config CORS actuelle par :
const allowedOrigins = [
  'http://localhost:5173', // Pour tes tests locaux
  'https://rdv-node.vercel.app/' // 👈 L'URL que Vercel vient de te donner
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// 2. Parser le JSON
app.use(express.json());

// 3. Parser les Cookies (INDISPENSABLE AVANT LES ROUTES)
app.use(cookieParser()); 

// --- FIN BLOC CONFIGURATION ---


// Relations BDD
Service.hasMany(Appointment, { foreignKey: 'serviceId' });
Appointment.belongsTo(Service, { foreignKey: 'serviceId' });
User.hasMany(Appointment, { foreignKey: 'clientId' });
Appointment.belongsTo(User, { foreignKey: 'clientId' });
User.hasMany(Service, { foreignKey: 'userId' });
Service.belongsTo(User, { foreignKey: 'userId' });


// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/services', require('./routes/serviceRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));
app.use('/api/payment', require('./routes/paymentRoutes'));

// Démarrage
sequelize.sync({ alter: true })
    .then(() => {
        console.log('Base de données synchronisée');
        app.listen(3000, () => console.log('Serveur lancé sur http://localhost:3000'));
    })
    .catch(err => console.log('Erreur BDD:', err));