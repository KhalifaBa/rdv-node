const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const appointmentController = require('../controllers/appointmentController');

// Routes Client
router.post('/', auth, appointmentController.bookAppointment);
router.get('/', auth, appointmentController.getMyAppointments);
router.post('/cancel-client/:id', auth, appointmentController.cancelByClient);

// Routes Pro
router.get('/pro', auth, appointmentController.getProAppointments);
router.post('/cancel-pro/:id', auth, appointmentController.cancelByPro);

module.exports = router;