const Appointment = require('../models/Appointment');
const Service = require('../models/Service');

// 1. Réserver un créneau
exports.bookAppointment = async (req, res) => {
  try {
    const clientId = req.user.userId;
    const { serviceId, date } = req.body;

    // Vérif si le service existe
    const service = await Service.findByPk(serviceId);
    if (!service) {
      return res.status(404).json({ message: 'Service introuvable' });
    }

    // Vérif doublon (Même service, même heure)
    const existing = await Appointment.findOne({
      where: { serviceId, date }
    });

    if (existing) {
      return res.status(409).json({ message: 'Ce créneau est déjà réservé !' });
    }

    const newAppointment = await Appointment.create({
      date,
      clientId,
      serviceId
    });

    res.status(201).json({ message: 'Rendez-vous confirmé !', appointment: newAppointment });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de la réservation' });
  }
};

// 2. Voir MES rendez-vous (NOUVEAU)
exports.getMyAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.findAll({
      where: { clientId: req.user.userId }, // Filtre par l'ID du token
      include: [Service], // Jointure pour avoir le nom du service et le prix
      order: [['date', 'ASC']] // Tri par date croissante
    });
    res.json(appointments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur récupération' });
  }
};

// 3. Annuler un rendez-vous (NOUVEAU)
exports.cancelAppointment = async (req, res) => {
  try {
    const appointmentId = req.params.id;

    // Suppression sécurisée : On vérifie que le RDV appartient bien au client connecté
    const deleted = await Appointment.destroy({
      where: { 
        id: appointmentId,
        clientId: req.user.userId 
      }
    });

    if (!deleted) {
      return res.status(404).json({ message: 'RDV introuvable ou vous n\'êtes pas le propriétaire' });
    }

    res.json({ message: 'Rendez-vous annulé' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur annulation' });
  }
};