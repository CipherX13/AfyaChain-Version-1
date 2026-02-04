/**
 * Grant consent to a doctor
 */
exports.grantConsent = async (req, res) => {
  try {
    const { nida, doctorId, expiryDays } = req.body;
    const patientWallet = req.user?.walletAddress; // From auth middleware
    
    // Validate patient owns the NIDA
    const blockchainNida = await patientRegistry.getNidaByWallet(patientWallet);
    if (blockchainNida !== nida) {
      return res.status(403).json({ 
        error: 'You can only grant consent for your own records' 
      });
    }
    
    // Grant consent on blockchain
    const tx = await consentManager.grantConsent(
      nida,
      doctorId,
      expiryDays || 30 // Default 30 days
    );
    
    await tx.wait();
    
    res.json({
      success: true,
      message: 'Consent granted successfully',
      transactionHash: tx.hash,
      consent: {
        nida,
        doctorId,
        grantedBy: patientWallet,
        expiryDays: expiryDays || 30,
        grantedAt: new Date()
      }
    });
    
  } catch (error) {
    console.error('Grant consent error:', error);
    res.status(500).json({ 
      error: 'Failed to grant consent', 
      details: error.message 
    });
  }
};

/**
 * Revoke consent from a doctor
 */
exports.revokeConsent = async (req, res) => {
  try {
    const { nida, doctorId } = req.body;
    const patientWallet = req.user?.walletAddress;
    
    // Validate patient owns the NIDA
    const blockchainNida = await patientRegistry.getNidaByWallet(patientWallet);
    if (blockchainNida !== nida) {
      return res.status(403).json({ 
        error: 'You can only revoke consent for your own records' 
      });
    }
    
    // Revoke consent on blockchain
    const tx = await consentManager.revokeConsent(nida, doctorId);
    await tx.wait();
    
    res.json({
      success: true,
      message: 'Consent revoked successfully',
      transactionHash: tx.hash,
      consent: {
        nida,
        doctorId,
        revokedBy: patientWallet,
        revokedAt: new Date()
      }
    });
    
  } catch (error) {
    console.error('Revoke consent error:', error);
    res.status(500).json({ 
      error: 'Failed to revoke consent', 
      details: error.message 
    });
  }
};

/**
 * Check if doctor has consent
 */
exports.checkConsent = async (req, res) => {
  try {
    const { nida, doctorId } = req.query;
    
    const hasAccess = await consentManager.hasConsent(nida, doctorId);
    
    res.json({
      success: true,
      hasConsent: hasAccess,
      nida,
      doctorId,
      checkedAt: new Date()
    });
    
  } catch (error) {
    console.error('Check consent error:', error);
    res.status(500).json({ 
      error: 'Failed to check consent', 
      details: error.message 
    });
  }
};

/**
 * Get all doctors with consent for a patient
 */
exports.getConsentedDoctors = async (req, res) => {
  try {
    const { nida } = req.params;
    
    const doctorIds = await consentManager.getConsentedDoctors(nida);
    
    // In production, you'd fetch doctor details from database
    const doctors = doctorIds.map(id => ({
      doctorId: id,
      hasAccess: true,
      // Additional doctor info would come from database
      name: `Dr. ${id}`,
      specialty: 'General Medicine'
    }));
    
    res.json({
      success: true,
      count: doctors.length,
      doctors
    });
    
  } catch (error) {
    console.error('Get consented doctors error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch consented doctors', 
      details: error.message 
    });
  }
};