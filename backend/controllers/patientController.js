const { ethers } = require('ethers');
const Patient = require('../models/Patient');
const contractAddresses = require('../contract-addresses.json');

// Connect to blockchain
const provider = new ethers.JsonRpcProvider('http://localhost:8545');
const privateKey = process.env.PRIVATE_KEY || '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'; // Hardhat default
const wallet = new ethers.Wallet(privateKey, provider);

// Load contract ABIs (these would be generated after compilation)
const patientRegistryABI = require('../abis/PatientRegistry.json');
const healthRecordABI = require('../abis/HealthRecord.json');
const consentManagerABI = require('../abis/ConsentManager.json');

// Create contract instances
const patientRegistry = new ethers.Contract(
  contractAddresses.patientRegistry,
  patientRegistryABI,
  wallet
);

const healthRecord = new ethers.Contract(
  contractAddresses.healthRecord,
  healthRecordABI,
  wallet
);

const consentManager = new ethers.Contract(
  contractAddresses.consentManager,
  consentManagerABI,
  wallet
);

/**
 * Register a new patient (on-chain and off-chain)
 */
exports.registerPatient = async (req, res) => {
  try {
    const { nida, fullName, email, phone, walletAddress, role } = req.body;
    
    // Validate NIDA (Tanzanian National ID format)
    if (!nida || nida.length < 15) {
      return res.status(400).json({ 
        error: 'Invalid NIDA number. Must be at least 15 digits.' 
      });
    }
    
    // Check if patient already exists in MongoDB
    const existingPatient = await Patient.findOne({ nida });
    if (existingPatient) {
      return res.status(400).json({ 
        error: 'Patient already registered' 
      });
    }
    
    // Register on blockchain (this would normally be signed by patient's wallet)
    const tx = await patientRegistry.registerPatient(
      nida,
      fullName,
      email,
      phone
    );
    
    await tx.wait();
    
    // Store additional details in MongoDB (off-chain)
    const patient = new Patient({
      nida,
      fullName,
      email,
      phone,
      walletAddress,
      role: role || 'patient',
      registrationDate: new Date(),
      isActive: true
    });
    
    await patient.save();
    
    res.status(201).json({
      success: true,
      message: 'Patient registered successfully',
      transactionHash: tx.hash,
      patient: {
        nida,
        fullName,
        email,
        walletAddress
      }
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      error: 'Registration failed', 
      details: error.message 
    });
  }
};

/**
 * Get patient details
 */
exports.getPatient = async (req, res) => {
  try {
    const { nida } = req.params;
    
    // Get from blockchain
    const blockchainPatient = await patientRegistry.getPatient(nida);
    
    // Get from MongoDB
    const mongoPatient = await Patient.findOne({ nida });
    
    if (!blockchainPatient[0] || blockchainPatient[0] === '') {
      return res.status(404).json({ error: 'Patient not found' });
    }
    
    const patientData = {
      nida: blockchainPatient[0],
      fullName: blockchainPatient[1],
      email: blockchainPatient[2],
      phone: blockchainPatient[3],
      walletAddress: blockchainPatient[4],
      registrationDate: new Date(parseInt(blockchainPatient[5]) * 1000),
      isActive: blockchainPatient[6],
      // Additional data from MongoDB
      medicalHistory: mongoPatient?.medicalHistory || [],
      allergies: mongoPatient?.allergies || [],
      emergencyContact: mongoPatient?.emergencyContact || {}
    };
    
    res.json({
      success: true,
      patient: patientData
    });
    
  } catch (error) {
    console.error('Get patient error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch patient', 
      details: error.message 
    });
  }
};

/**
 * Get all patients (for admin dashboard)
 */
exports.getAllPatients = async (req, res) => {
  try {
    // In a real implementation, you'd query all patients
    // For simplicity, we'll return from MongoDB
    const patients = await Patient.find({ role: 'patient' });
    
    res.json({
      success: true,
      count: patients.length,
      patients
    });
    
  } catch (error) {
    console.error('Get all patients error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch patients', 
      details: error.message 
    });
  }
};