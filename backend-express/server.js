const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

// MODIFICATION ICI : On importe sequelize depuis le dossier models (qui contient maintenant les relations)
const { sequelize } = require('./models'); 

const app = express();

// --- CONFIGURATION CORS ---
const allowedOrigins = [
  'http://localhost:5173', 
  'https://rdv-node.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    // console.log("🔍 Origin reçue :", origin); // Décommentez pour débugger si besoin
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'Not allowed by CORS';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

// --- MIDDLEWARES ---
app.use(express.json());
app.set('trust proxy', 1);
app.use(cookieParser());

// --- ROUTES ---
// Plus besoin d'importer les modèles ici, les routes s'en chargent
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/services', require('./routes/serviceRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));
app.use('/api/payment', require('./routes/paymentRoutes'));

// --- DÉMARRAGE ---
const PORT = process.env.PORT || 3000;

// On utilise le sequelize importé de ./models, qui contient déjà toutes les relations chargées
sequelize.sync({ alter: true })
    .then(() => {
        console.log('✅ Base de données synchronisée et relations établies');
        app.listen(PORT, () => console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`));
    })
    .catch(err => console.log('❌ Erreur BDD:', err));