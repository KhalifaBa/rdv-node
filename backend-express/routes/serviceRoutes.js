const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware'); 
const serviceController = require('../controllers/serviceController');


router.post('/', auth, serviceController.createService);


router.get('/', auth, serviceController.getAllServices);

module.exports = router;