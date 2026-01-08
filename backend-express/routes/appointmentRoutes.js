const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const appointmentController = require('../controllers/appointmentController');

// Routes Client
router.post('/', auth, appointmentController.bookAppointment);
router.get('/', auth, appointmentController.getMyAppointments);
router.delete('/:id', auth, appointmentController.cancelAppointment);

// Routes Pro
router.get('/pro', auth, appointmentController.getProAppointments);
router.delete('/pro/:id', auth, appointmentController.cancelAppointmentPro); // (NOUVEAU)

module.exports = router;