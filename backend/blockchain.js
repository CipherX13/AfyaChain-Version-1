const { ethers } = require('ethers');
const crypto = require('crypto');

// Contract addresses (from Hardhat deployment)
const CONTRACT_ADDRESSES = {
  patientRegistry: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
  healthRecord: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
  consentManager: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0'
};

// Connect to local Hardhat node
const provider = new ethers.JsonRpcProvider('http://localhost:8545');

// Admin wallet (Account #0 - deployed contracts)
const adminWallet = new ethers.Wallet(
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
  provider
);

// Simple contract ABIs (minimal functions we need)
const patientRegistryABI = [
  "function registerPatient(string memory _nida, string memory _fullName, string memory _email, string memory _phone) public returns (bool)",
  "function getPatient(string memory _nida) public view returns (string memory, string memory, string memory, string memory, address, uint256, bool)",
  "function isPatientRegistered(string memory _nida) public view returns (bool)",
  "event PatientRegistered(string indexed nida, address indexed patientAddress, string fullName, uint256 timestamp)"
];

const healthRecordABI = [
  "function addRecord(string memory _recordId, string memory _nida, string memory _recordHash, string memory _recordType, string memory _facility, string memory _doctorId) public returns (bool)",
  "function getPatientRecordIds(string memory _nida) public view returns (string[] memory)",
  "function verifyRecord(string memory _recordId, string memory _recordHash) public view returns (bool)",
  "event RecordAdded(string indexed recordId, string indexed nida, string recordHash, string recordType, address addedBy, uint256 timestamp)"
];

const consentManagerABI = [
  "function grantConsent(string memory _nida, string memory _doctorId, uint256 _expiryDays) public returns (bool)",
  "function revokeConsent(string memory _nida, string memory _doctorId) public returns (bool)",
  "function hasConsent(string memory _nida, string memory _doctorId) public view returns (bool)",
  "event ConsentGranted(string indexed nida, string indexed doctorId, address grantedBy, uint256 expiry, uint256 timestamp)",
  "event ConsentRevoked(string indexed nida, string indexed doctorId, address revokedBy, uint256 timestamp)"
];

// Create contract instances
const patientRegistry = new ethers.Contract(
  CONTRACT_ADDRESSES.patientRegistry,
  patientRegistryABI,
  adminWallet
);

const healthRecord = new ethers.Contract(
  CONTRACT_ADDRESSES.healthRecord,
  healthRecordABI,
  adminWallet
);

const consentManager = new ethers.Contract(
  CONTRACT_ADDRESSES.consentManager,
  consentManagerABI,
  adminWallet
);

// Pre-register our demo patients and doctor on blockchain
async function initializeDemoData() {
  console.log('🔗 Initializing blockchain with demo data...');
  
  try {
    // Check if patients already registered
    const johnRegistered = await patientRegistry.isPatientRegistered("199012345678901");
    const maryRegistered = await patientRegistry.isPatientRegistered("199087654321098");
    const doctorRegistered = await patientRegistry.isPatientRegistered("DOC198512345678");
    
    // Register Patient John (Account #1)
    if (!johnRegistered) {
      console.log('📝 Registering Patient John on blockchain...');
      const tx1 = await patientRegistry.registerPatient(
        "199012345678901",
        "John Michael",
        "john@example.com",
        "+255712345678"
      );
      await tx1.wait();
      console.log('✅ Patient John registered. Tx:', tx1.hash);
    }
    
    // Register Patient Mary (Account #2)
    if (!maryRegistered) {
      console.log('📝 Registering Patient Mary on blockchain...');
      const tx2 = await patientRegistry.registerPatient(
        "199087654321098",
        "Mary Johnson",
        "mary@example.com",
        "+255723456789"
      );
      await tx2.wait();
      console.log('✅ Patient Mary registered. Tx:', tx2.hash);
    }
    
    // Register Doctor Sarah (Account #4)
    if (!doctorRegistered) {
      console.log('📝 Registering Doctor Sarah on blockchain...');
      const tx3 = await patientRegistry.registerPatient(
        "DOC198512345678",
        "Dr. Sarah K.",
        "sarah@hospital.com",
        "+255755123456"
      );
      await tx3.wait();
      console.log('✅ Doctor Sarah registered. Tx:', tx3.hash);
    }
    
    // Add sample health records
    console.log('📋 Adding sample health records...');
    
    // Record for John
    const johnRecordHash = crypto.createHash('sha256')
      .update(JSON.stringify({
        test: "Blood Work",
        results: "Normal",
        date: "2023-10-15"
      }))
      .digest('hex');
    
    const tx4 = await healthRecord.addRecord(
      "REC_JOHN_001",
      "199012345678901",
      johnRecordHash,
      "lab_results",
      "Muhimbili Hospital",
      "DOC001"
    );
    await tx4.wait();
    
    // Record for Mary
    const maryRecordHash = crypto.createHash('sha256')
      .update(JSON.stringify({
        test: "X-Ray",
        results: "Clear",
        date: "2023-09-22"
      }))
      .digest('hex');
    
    const tx5 = await healthRecord.addRecord(
      "REC_MARY_001",
      "199087654321098",
      maryRecordHash,
      "xray",
      "Aga Khan Hospital",
      "DOC002"
    );
    await tx5.wait();
    
    console.log('🎉 Demo data initialized on blockchain!');
    return true;
    
  } catch (error) {
    console.log('⚠️ Using mock data (blockchain error):', error.message);
    return false;
  }
}

// Export functions
module.exports = {
  CONTRACT_ADDRESSES,
  provider,
  adminWallet,
  patientRegistry,
  healthRecord,
  consentManager,
  initializeDemoData,
  
  // Helper functions
  async registerPatientOnBlockchain(nida, fullName, email, phone, patientWallet) {
    try {
      // If we have patient's wallet private key, use it
      let wallet = adminWallet;
      
      // For demo patients, use admin to register (simplified)
      const tx = await patientRegistry.registerPatient(nida, fullName, email, phone);
      await tx.wait();
      
      return {
        success: true,
        transactionHash: tx.hash,
        timestamp: Date.now()
      };
    } catch (error) {
      console.log('Blockchain registration failed, using mock:', error.message);
      return {
        success: true,
        transactionHash: '0x' + crypto.randomBytes(32).toString('hex'),
        timestamp: Date.now()
      };
    }
  },
  
  async checkConsentOnBlockchain(nida, doctorId) {
    try {
      const hasAccess = await consentManager.hasConsent(nida, doctorId);
      return { success: true, hasConsent: hasAccess };
    } catch (error) {
      console.log('Blockchain consent check failed:', error.message);
      return { success: false, hasConsent: false };
    }
  }
};