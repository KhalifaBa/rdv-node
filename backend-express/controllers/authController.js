const bcrypt = require('bcryptjs');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {

    const { email, password, role } = req.body;


    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé.' });
    }


    const hashedPassword = await bcrypt.hash(password, 10);


    const newUser = await User.create({
      email,
      password: hashedPassword,
      role: role || 'CLIENT' 
    });


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
  

      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
      }
  

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
      }
  

      const token = jwt.sign(
        { userId: user.id, role: user.role }, 
        'MA_SUPER_CLE_SECRETE', 
        { expiresIn: '24h' }
      );
  
      res.json({
        message: 'Connexion réussie !',
        token, 
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