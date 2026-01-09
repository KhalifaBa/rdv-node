const Appointment = require('../models/Appointment');
const Service = require('../models/Service');
const User = require('../models/User');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { differenceInHours } = require('date-fns');

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
      isPaid: isPaid || false,
      stripePaymentId: stripePaymentId || null, // On stocke l'ID Stripe ici
      price: service.price,
      status: 'confirmed' // On initialise un statut par défaut
    });

    res.status(201).json({ message: 'RDV Confirmé', appointment: newAppointment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de la réservation' });
  }
};

// 2. Voir MES RDV (Client)
exports.getMyAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.findAll({
      where: { clientId: req.user.userId },
      include: [
        { 
          model: Service, 
          attributes: ['name', 'price', 'duration'] 
        }
      ],
      order: [['date', 'ASC']]
    });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Erreur récupération des RDV' });
  }
};

// 3. Voir l'Agenda (Pro)
exports.getProAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.findAll({
      include: [
        {
          model: Service,
          where: { userId: req.user.userId }, // Uniquement les services de ce Pro
          attributes: ['name', 'price', 'duration']
        },
        { model: User, attributes: ['email', 'firstName', 'lastName'] } // Infos du client
      ],
      order: [['date', 'ASC']]
    });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Erreur récupération agenda' });
  }
};

// 4. Annuler un RDV (CLIENT)
exports.cancelByClient = async (req, res) => {
  try {
    const { id } = req.params;
    const clientId = req.user.userId;

    // CORRECTION ICI : On a retiré "as: 'Pro'" car votre modèle ne le connaît pas.
    const appointment = await Appointment.findOne({
      where: { id, clientId },
      include: [
        {
          model: Service,
          include: [{ model: User }] // <--- Juste "model: User", sans alias.
        }
      ]
    });

    if (!appointment) return res.status(404).json({ message: "RDV introuvable ou non autorisé" });

    // Si déjà annulé
    if (appointment.status && appointment.status.includes('cancelled')) {
        return res.status(400).json({ message: "RDV déjà annulé" });
    }

    const now = new Date();
    const apptDate = new Date(appointment.date);

    // Calcul des heures restantes
    // Assurez-vous d'avoir importé differenceInHours en haut du fichier (ex: date-fns)
    // const { differenceInHours } = require('date-fns');
    const hoursBeforeAppt = differenceInHours(apptDate, now);

    // On récupère la règle du Pro
    // Comme on a retiré l'alias 'Pro' plus haut, .User fonctionne parfaitement ici
    const proConfig = appointment.Service.User || {}; 
    const limitHours = proConfig.cancellationDelay || 24; 

    let refundStatus = 'no_refund';

    // SI le client est dans les temps
    if (hoursBeforeAppt >= limitHours) {
        if (appointment.stripePaymentId) {
            try {
                await stripe.refunds.create({
                    payment_intent: appointment.stripePaymentId,
                });
                refundStatus = 'refunded';
            } catch (err) {
                console.error("Erreur Stripe Refund Client:", err);
            }
        }
    }

    // Mise à jour du statut
    appointment.status = refundStatus === 'refunded' ? 'cancelled_refunded' : 'cancelled_no_refund';
    await appointment.save();

    res.json({
        message: refundStatus === 'refunded' 
            ? "RDV annulé et remboursé." 
            : `RDV annulé hors délai (moins de ${limitHours}h). Pas de remboursement.`,
        refunded: refundStatus === 'refunded'
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// 5. Annuler un RDV (PRO) - Remboursement forcé
exports.cancelByPro = async (req, res) => {
  try {
    const { id } = req.params;
    const proId = req.user.userId;

    // 1. Trouver le RDV et vérifier qu'il appartient bien à un service de CE pro
    const appointment = await Appointment.findByPk(id, {
        include: [{ model: Service }]
    });

    if (!appointment) return res.status(404).json({ message: "RDV introuvable" });

    // Sécurité : Vérifier que le service appartient au Pro connecté
    if (appointment.Service.userId !== proId) {
        return res.status(403).json({ message: "Vous n'avez pas le droit d'annuler ce RDV" });
    }

    // 2. Remboursement Stripe AUTOMATIQUE (Le pro annule = on rend l'argent)
    if (appointment.stripePaymentId) {
      try {
        await stripe.refunds.create({
          payment_intent: appointment.stripePaymentId,
        });
        console.log(`💰 Remboursement effectué pour le RDV ${id}`);
      } catch (stripeError) {
        console.error("Erreur Stripe Pro:", stripeError);
      }
    }

    // 3. Mise à jour statut
    appointment.status = 'cancelled_by_pro';
    await appointment.save();

    res.json({ message: "RDV annulé par le professionnel et client remboursé." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};