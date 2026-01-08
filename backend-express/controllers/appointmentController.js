const Appointment = require('../models/Appointment');
const Service = require('../models/Service');


exports.bookAppointment = async (req, res) => {
  try {
    const clientId = req.user.userId;
    const { serviceId, date } = req.body;


    const service = await Service.findByPk(serviceId);
    if (!service) {
      return res.status(404).json({ message: 'Service introuvable' });
    }


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


exports.getMyAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.findAll({
      where: { clientId: req.user.userId }, 
      include: [Service], 
      order: [['date', 'ASC']] 
    });
    res.json(appointments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur récupération' });
  }
};


exports.cancelAppointment = async (req, res) => {
  try {
    const appointmentId = req.params.id;


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