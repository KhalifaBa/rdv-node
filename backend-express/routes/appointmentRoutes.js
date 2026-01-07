const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const appointmentController = require('../controllers/appointmentController');

// POST /api/appointments -> Réserver
router.post('/', auth, appointmentController.bookAppointment);

// GET /api/appointments -> Voir mes RDV
router.get('/', auth, appointmentController.getMyAppointments);

// DELETE /api/appointments/:id -> Annuler un RDV
router.delete('/:id', auth, appointmentController.cancelAppointment);

module.exports = router;