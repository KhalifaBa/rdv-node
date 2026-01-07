const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware'); // On importe le gardien
const serviceController = require('../controllers/serviceController');

// POST /api/services -> Protégé par "auth"
router.post('/', auth, serviceController.createService);

// GET /api/services -> Protégé par "auth" (pour voir SES services)
router.get('/', auth, serviceController.getAllServices);

module.exports = router;