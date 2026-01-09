const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const paymentController = require('../controllers/paymentController');

router.post('/create-intent', auth, paymentController.createPaymentIntent);

module.exports = router;