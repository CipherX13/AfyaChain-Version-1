const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const { authenticate, authorize } = require('../middleware/auth');

// Public routes
router.post('/register', patientController.registerPatient);
router.get('/:nida', patientController.getPatient);

// Protected routes (admin only)
router.get('/', authenticate, authorize(['admin']), patientController.getAllPatients);

module.exports = router;