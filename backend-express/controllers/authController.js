const bcrypt = require('bcryptjs');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    // 1. Récupérer les infos du body
    const { email, password, role } = req.body;

    // 2. Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé.' });
    }

    // 3. Hasher le mot de passe (10 tours de sel)
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Créer l'utilisateur dans la BDD
    const newUser = await User.create({
      email,
      password: hashedPassword,
      role: role || 'CLIENT' // Par défaut CLIENT si pas précisé
    });

    // 5. Répondre (IMPORTANT : ne jamais renvoyer le mot de passe)
    res.status(201).json({
      message: 'Utilisateur créé avec succès !',
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur lors de l\'inscription' });
  }
};


exports.login = async (req, res) => {
    try {
      const { email, password } = req.body;
  
      // 1. Chercher l'utilisateur
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
      }
  
      // 2. Vérifier le mot de passe
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
      }
  
      // 3. Générer le Token (Le passeport)
      // SECRET_KEY devrait être dans un .env en production, ici on fait simple
      const token = jwt.sign(
        { userId: user.id, role: user.role }, 
        'MA_SUPER_CLE_SECRETE', 
        { expiresIn: '24h' }
      );
  
      res.json({
        message: 'Connexion réussie !',
        token, // Le front devra stocker ce token
        user: {
          id: user.id,
          email: user.email,
          role: user.role
        }
      });
  
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erreur lors de la connexion' });
    }
  };