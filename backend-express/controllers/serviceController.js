const Service = require('../models/Service');

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
    console.error(error);
    res.status(500).json({ message: 'Erreur création service' });
  }
};

exports.getAllServices = async (req, res) => {
    try {
        const services = await Service.findAll(); 
        res.status(200).json(services);
    } catch (error) {
        res.status(500).json({ message: 'Erreur récupération' });
    }
};