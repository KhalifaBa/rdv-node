const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const appointmentController = require('../controllers/appointmentController');


router.post('/', auth, appointmentController.bookAppointment);


router.get('/', auth, appointmentController.getMyAppointments);


router.delete('/:id', auth, appointmentController.cancelAppointment);

module.exports = router;