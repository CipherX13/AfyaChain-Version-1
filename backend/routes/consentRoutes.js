const express = require('express');
const router = express.Router();
const consentController = require('../controllers/consentController');
const { authenticate } = require('../middleware/auth');

// Protected routes (patients only)
router.post('/grant', authenticate, consentController.grantConsent);
router.post('/revoke', authenticate, consentController.revokeConsent);
router.get('/check', consentController.checkConsent);
router.get('/patient/:nida/doctors', authenticate, consentController.getConsentedDoctors);

module.exports = router;