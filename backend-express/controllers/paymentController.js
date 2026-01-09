const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Service = require('../models/Service');

exports.createPaymentIntent = async (req, res) => {
  try {
    const { serviceId } = req.body;
    
    // 1. Debug : Voir ce qu'on reçoit
    console.log("--- TENTATIVE PAIEMENT ---");
    console.log("Service ID reçu :", serviceId);

    const service = await Service.findByPk(serviceId);

    if (!service) {
        console.log("❌ Service introuvable en base");
        return res.status(404).json({ message: 'Service introuvable' });
    }

    console.log("Service trouvé :", service.name, "| Prix :", service.price);

    // 2. Sécurité : Vérifier le prix
    if (!service.price || service.price <= 0) {
        console.log("❌ Prix invalide (0 ou null)");
        return res.status(400).json({ message: 'Le prix du service est invalide' });
    }

    // 3. Conversion en centimes (ESSENTIEL : Math.round)
    // Stripe plante s'il reçoit 1999.9999. Il veut 2000 pile.
    const amountInCents = Math.round(service.price * 100);

    // Vérification montant minimum Stripe (50 centimes environ)
    if (amountInCents < 50) {
        return res.status(400).json({ message: 'Le montant est trop faible pour Stripe' });
    }

    console.log("Montant envoyé à Stripe (cts) :", amountInCents);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'eur',
      automatic_payment_methods: { enabled: true },
    });

    console.log("✅ PaymentIntent créé :", paymentIntent.id);
    res.json({ clientSecret: paymentIntent.client_secret });

  } catch (error) {
    // C'EST ICI QUE L'ERREUR S'AFFICHE DANS TON TERMINAL
    console.error("❌ ERREUR STRIPE / SERVER :", error); 
    res.status(500).json({ message: error.message });
  }
};