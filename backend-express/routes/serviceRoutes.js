const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const serviceController = require('../controllers/serviceController');

router.get('/', auth, serviceController.getAllServices); // Public
router.get('/me', auth, serviceController.getMyServices); // Pro
router.post('/', auth, serviceController.createService); // Création
router.delete('/:id', auth, serviceController.deleteService); // Suppression (NOUVEAU)

module.exports = router;