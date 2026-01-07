const Service = require('../models/Service');

exports.createService = async (req, res) => {
  try {
    // Grâce au middleware, on sait qui fait la requête : req.user
    // Sécurité : On vérifie si c'est bien un PRO (Optionnel mais recommandé)
    /* if (req.user.role !== 'PRO') {
       return res.status(403).json({ message: "Accès réservé aux pros" });
    } */

    const { name, duration, price } = req.body;

    const newService = await Service.create({
      name,
      duration,
      price,
      userId: req.user.userId // On attache le service à l'utilisateur connecté
    });

    res.status(201).json({ message: 'Service créé !', service: newService });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur création service' });
  }
};

exports.getAllServices = async (req, res) => {
    try {
        const services = await Service.findAll(); // <--- JUSTE findAll()
        res.status(200).json(services);
    } catch (error) {
        res.status(500).json({ message: 'Erreur récupération' });
    }
};