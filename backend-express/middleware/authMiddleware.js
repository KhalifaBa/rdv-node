const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    // 1. Récupérer le token du header (Format: "Bearer eyJhbG...")
    const token = req.headers.authorization.split(' ')[1];
    
    // 2. Vérifier le token
    const decodedToken = jwt.verify(token, 'MA_SUPER_CLE_SECRETE');
    
    // 3. Ajouter l'ID de l'utilisateur à la requête pour la suite
    req.user = { 
        userId: decodedToken.userId,
        role: decodedToken.role 
    };
    
    // 4. Passer à la suite
    next();
  } catch (error) {
    res.status(401).json({ message: 'Authentification requise !' });
  }
};