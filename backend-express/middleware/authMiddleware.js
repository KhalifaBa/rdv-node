const jwt = require('jsonwebtoken');

// On reprend la MÊME clé que dans le contrôleur
const JWT_SECRET = process.env.JWT_SECRET || 'SECRET_TEMPORAIRE';

module.exports = (req, res, next) => {
  try {
    // 1. On cherche le token dans les cookies
    // (Grâce à cookie-parser configuré dans server.js)
    const token = req.cookies.token;

    // Console log pour debug si besoin (tu pourras l'enlever après)
    // console.log("Middleware Auth - Cookies reçus :", req.cookies);

    if (!token) {
      return res.status(401).json({ message: 'Non authentifié (Cookie manquant)' });
    }

    // 2. Vérification de la signature
    const decodedToken = jwt.verify(token, JWT_SECRET);
    
    // 3. On attache l'utilisateur à la requête pour la suite
    req.user = decodedToken;
    
    next(); // On passe à la suite (le contrôleur)
  } catch (error) {
    console.error("Erreur Auth:", error.message);
    res.status(401).json({ message: 'Token invalide ou expiré' });
  }
};