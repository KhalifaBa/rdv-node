const Appointment = require('../models/Appointment');
const Service = require('../models/Service');
const User = require('../models/User');

// 1. Réserver (Client)
exports.bookAppointment = async (req, res) => {
  try {
    const { serviceId, date, isPaid, stripePaymentId } = req.body; 
    const clientId = req.user.userId;

    const service = await Service.findByPk(serviceId);
    if (!service) return res.status(404).json({ message: 'Service introuvable' });

    // Vérif doublon
    const existing = await Appointment.findOne({ where: { serviceId, date } });
    if (existing) return res.status(409).json({ message: 'Créneau déjà réservé !' });

    const newAppointment = await Appointment.create({
      date,
      clientId,
      serviceId,
      isPaid: isPaid || false, // <--- Nouveau
      stripePaymentId: stripePaymentId || null, // <--- Nouveau
      price: service.price // <--- On fige le prix
    });
    res.status(201).json({ message: 'Confirmé', appointment: newAppointment });
  } catch (error) {
    res.status(500).json({ message: 'Erreur réservation' });
  }
};

// 2. Voir MES RDV (Client)
exports.getMyAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.findAll({
      where: { clientId: req.user.userId },
      include: [Service],
      order: [['date', 'ASC']]
    });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Erreur récupération' });
  }
};

// 3. Annuler MON RDV (Client)
exports.cancelAppointment = async (req, res) => {
  try {
    const deleted = await Appointment.destroy({
      where: { id: req.params.id, clientId: req.user.userId }
    });
    if (!deleted) return res.status(404).json({ message: 'Introuvable' });
    res.json({ message: 'Annulé' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur annulation' });
  }
};

// 4. Voir l'Agenda (Pro)
exports.getProAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.findAll({
      include: [
        {
            model: Service,
            where: { userId: req.user.userId },
            attributes: ['name', 'price', 'duration']
        },
        { model: User, attributes: ['email'] }
      ],
      order: [['date', 'ASC']]
    });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Erreur agenda' });
  }
};

// 5. Annuler un RDV Client (Pro) - (NOUVEAU)
exports.cancelAppointmentPro = async (req, res) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id, { include: [Service] });
    
    if (!appointment) return res.status(404).json({ message: 'RDV introuvable' });
    
    // Vérifier que le service appartient bien au Pro connecté
    if (appointment.Service.userId !== req.user.userId) {
      return res.status(403).json({ message: 'Accès interdit' });
    }

    await appointment.destroy();
    res.json({ message: 'Rendez-vous annulé par le pro' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur annulation pro' });
  }
};