const crypto = require('crypto');
const Record = require('../models/Record');

/**
 * Add a new health record
 * Medical data stored off-chain (MongoDB), hash stored on-chain
 */
exports.addRecord = async (req, res) => {
  try {
    const { 
      recordId, 
      nida, 
      recordData, 
      recordType, 
      facility, 
      doctorId 
    } = req.body;
    
    // Validate record data
    if (!recordData || typeof recordData !== 'object') {
      return res.status(400).json({ 
        error: 'Invalid record data' 
      });
    }
    
    // Encrypt sensitive data (simplified for demo)
    const encryptedData = encryptData(JSON.stringify(recordData));
    
    // Generate hash of encrypted data for blockchain
    const recordHash = crypto
      .createHash('sha256')
      .update(encryptedData)
      .digest('hex');
    
    // Store on blockchain (only hash)
    const tx = await healthRecord.addRecord(
      recordId,
      nida,
      recordHash,
      recordType,
      facility,
      doctorId
    );
    
    await tx.wait();
    
    // Store full encrypted data in MongoDB
    const record = new Record({
      recordId,
      nida,
      encryptedData,
      recordType,
      facility,
      doctorId,
      addedBy: req.user?.id || 'system',
      timestamp: new Date(),
      isActive: true,
      // Store the hash for verification
      blockchainHash: recordHash
    });
    
    await record.save();
    
    res.status(201).json({
      success: true,
      message: 'Health record added successfully',
      transactionHash: tx.hash,
      recordId,
      recordHash,
      timestamp: new Date()
    });
    
  } catch (error) {
    console.error('Add record error:', error);
    res.status(500).json({ 
      error: 'Failed to add record', 
      details: error.message 
    });
  }
};

/**
 * Get health records for a patient
 * Checks consent before returning data
 */
exports.getPatientRecords = async (req, res) => {
  try {
    const { nida } = req.params;
    const { doctorId } = req.query; // Doctor requesting access
    
    // Check consent if doctor is requesting
    if (doctorId) {
      const hasAccess = await consentManager.hasConsent(nida, doctorId);
      if (!hasAccess) {
        return res.status(403).json({ 
          error: 'Access denied. No valid consent found.' 
        });
      }
    }
    
    // Get record IDs from blockchain
    const recordIds = await healthRecord.getPatientRecordIds(nida);
    
    // Get full records from MongoDB
    const records = await Record.find({ 
      nida, 
      isActive: true 
    }).sort({ timestamp: -1 });
    
    // Decrypt data for authorized users
    const decryptedRecords = records.map(record => {
      const recordData = JSON.parse(decryptData(record.encryptedData));
      
      return {
        recordId: record.recordId,
        recordType: record.recordType,
        facility: record.facility,
        doctorId: record.doctorId,
        timestamp: record.timestamp,
        data: recordData,
        // Verify blockchain hash
        verified: verifyBlockchainHash(record.encryptedData, record.blockchainHash)
      };
    });
    
    res.json({
      success: true,
      count: decryptedRecords.length,
      records: decryptedRecords
    });
    
  } catch (error) {
    console.error('Get records error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch records', 
      details: error.message 
    });
  }
};

/**
 * Verify a record's integrity against blockchain
 */
exports.verifyRecord = async (req, res) => {
  try {
    const { recordId } = req.params;
    
    // Get record from MongoDB
    const record = await Record.findOne({ recordId });
    if (!record) {
      return res.status(404).json({ error: 'Record not found' });
    }
    
    // Verify on blockchain
    const isVerified = await healthRecord.verifyRecord(
      recordId, 
      record.blockchainHash
    );
    
    res.json({
      success: true,
      recordId,
      verified: isVerified,
      blockchainHash: record.blockchainHash,
      timestamp: record.timestamp
    });
    
  } catch (error) {
    console.error('Verify record error:', error);
    res.status(500).json({ 
      error: 'Verification failed', 
      details: error.message 
    });
  }
};

// Helper functions
function encryptData(data) {
  // In production, use proper encryption (AES-256)
  // This is simplified for demo purposes
  const cipher = crypto.createCipher('aes-256-cbc', process.env.ENCRYPTION_KEY || 'demo-key');
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

function decryptData(encryptedData) {
  const decipher = crypto.createDecipher('aes-256-cbc', process.env.ENCRYPTION_KEY || 'demo-key');
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

function verifyBlockchainHash(data, storedHash) {
  const calculatedHash = crypto
    .createHash('sha256')
    .update(data)
    .digest('hex');
  return calculatedHash === storedHash;
}