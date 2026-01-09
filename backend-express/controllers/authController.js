const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// On définit la clé ici pour être sûr qu'elle est identique partout
const JWT_SECRET = process.env.JWT_SECRET || 'SECRET_TEMPORAIRE';

const isProduction = process.env.NODE_ENV === 'production';

exports.register = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Par défaut, le rôle est 'CLIENT' si non précisé
    const newUser = await User.create({ 
      email, 
      password: hashedPassword, 
      role: role || 'CLIENT' 
    });

    res.status(201).json({ message: 'Utilisateur créé !', user: newUser });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de l\'inscription', error });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) return res.status(404).json({ message: 'Utilisateur inconnu' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Mot de passe incorrect' });

    // Création du Token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Envoi du Cookie
    res.cookie('token', token, {
      httpOnly: true, // Empêche le JS côté client de lire le cookie (Sécurité)
      secure: isProduction,  // FALSE pour localhost (http), TRUE en production (https)
      sameSite: isProduction ? 'none' : 'lax', // Nécessaire pour que le cookie passe sur localhost
      maxAge: 24 * 60 * 60 * 1000 // 24 heures
    });

    res.json({ 
      message: 'Connexion réussie', 
      user: { id: user.id, email: user.email, role: user.role }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.logout = (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Déconnecté avec succès' });
};
exports.updateProfile = async (req, res) => {
  try {
    const { openingHour, closingHour } = req.body;
    
    // On met à jour l'utilisateur connecté
    await User.update(
      { openingHour, closingHour },
      { where: { id: req.user.userId } }
    );

    // On renvoie les nouvelles infos
    const updatedUser = await User.findByPk(req.user.userId, {
        attributes: ['id', 'email', 'role', 'openingHour', 'closingHour']
    });

    res.json({ message: 'Horaires mis à jour !', user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: 'Erreur mise à jour' });
  }
};