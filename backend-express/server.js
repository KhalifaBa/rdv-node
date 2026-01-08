const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser'); // <--- 1. IMPORT
const sequelize = require('./config/database');

// Import des modèles
const User = require('./models/User');
const Service = require('./models/Service');
const Appointment = require('./models/Appointment');

const app = express();

// --- BLOC CONFIGURATION (L'ORDRE COMPTE) ---

// 1. CORS : Autoriser le Frontend
app.use(cors({
  origin: 'http://localhost:5173', // Pas de slash à la fin !
  credentials: true // Autoriser les cookies
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


// Démarrage
sequelize.sync({ alter: true })
    .then(() => {
        console.log('Base de données synchronisée');
        app.listen(3000, () => console.log('Serveur lancé sur http://localhost:3000'));
    })
    .catch(err => console.log('Erreur BDD:', err));