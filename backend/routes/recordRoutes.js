const express = require('express');
const router = express.Router();
const recordController = require('../controllers/recordController');
const { authenticate, authorize } = require('../middleware/auth');

// Protected routes
router.post('/add', authenticate, authorize(['doctor', 'admin']), recordController.addRecord);
router.get('/patient/:nida', authenticate, recordController.getPatientRecords);
router.get('/verify/:recordId', recordController.verifyRecord);

module.exports = router;