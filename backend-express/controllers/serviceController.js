const Service = require('../models/Service');
const User = require('../models/User');
// 1. Créer un service
exports.createService = async (req, res) => {
  try {
    const { name, duration, price } = req.body;
    const newService = await Service.create({
      name,
      duration,
      price,
      userId: req.user.userId
    });
    res.status(201).json({ message: 'Service créé !', service: newService });
  } catch (error) {
    res.status(500).json({ message: 'Erreur création service' });
  }
};

// 2. Voir TOUS les services (Pour le Client)
exports.getAllServices = async (req, res) => {
    try {
        const services = await Service.findAll();
        res.status(200).json(services);
    } catch (error) {
        res.status(500).json({ message: 'Erreur récupération' });
    }
};

// 3. Voir MES services (Pour le Pro)
exports.getMyServices = async (req, res) => {
    try {
        const services = await Service.findAll({ where: { userId: req.user.userId } });
        res.status(200).json(services);
    } catch (error) {
        res.status(500).json({ message: 'Erreur récupération' });
    }
};

// 4. Supprimer un service (NOUVEAU)
exports.deleteService = async (req, res) => {
  try {
    const deleted = await Service.destroy({
      where: { 
        id: req.params.id,
        userId: req.user.userId // Sécurité : seul le créateur peut supprimer
      }
    });

    if (!deleted) return res.status(404).json({ message: 'Service introuvable ou interdit' });
    res.json({ message: 'Service supprimé' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur suppression' });
  }
};

exports.getAllServices = async (req, res) => {
  try {
      const services = await Service.findAll({
          // On inclut le User (le Pro) pour avoir ses horaires
          include: [{
              model: User,
              attributes: ['openingHour', 'closingHour'] 
          }]
      });
      res.status(200).json(services);
  } catch (error) {
      res.status(500).json({ message: 'Erreur récupération' });
  }
};