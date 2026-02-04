// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title PatientRegistry
 * @dev Stores patient registration details on the blockchain
 * @notice Uses NIDA (National ID) as unique identifier for Tanzanian patients
 */
contract PatientRegistry {
    
    // Event emitted when a new patient is registered
    event PatientRegistered(
        string indexed nida,
        address indexed patientAddress,
        string fullName,
        uint256 timestamp
    );
    
    // Patient structure
    struct Patient {
        string nida;          // National ID (15 digits)
        string fullName;
        string email;
        string phone;
        address walletAddress;
        uint256 registrationDate;
        bool isActive;
    }
    
    // Mapping from NIDA to Patient details
    mapping(string => Patient) public patients;
    
    // Mapping from wallet address to NIDA
    mapping(address => string) public walletToNida;
    
    // Only registered patients can call
    modifier onlyPatient(string memory _nida) {
        require(
            keccak256(bytes(patients[_nida].nida)) == keccak256(bytes(_nida)),
            "Patient not registered"
        );
        _;
    }
    
    /**
     * @dev Register a new patient on the blockchain
     * @param _nida National ID number (15 digits)
     * @param _fullName Patient's full name
     * @param _email Patient's email
     * @param _phone Patient's phone number
     */
    function registerPatient(
        string memory _nida,
        string memory _fullName,
        string memory _email,
        string memory _phone
    ) public {
        require(bytes(_nida).length >= 15, "NIDA must be at least 15 digits");
        require(bytes(patients[_nida].nida).length == 0, "Patient already registered");
        
        // Check if wallet already registered using bytes comparison
        bytes memory walletNidaBytes = bytes(walletToNida[msg.sender]);
        require(walletNidaBytes.length == 0, "Wallet already registered");
        
        patients[_nida] = Patient({
            nida: _nida,
            fullName: _fullName,
            email: _email,
            phone: _phone,
            walletAddress: msg.sender,
            registrationDate: block.timestamp,
            isActive: true
        });
        
        walletToNida[msg.sender] = _nida;
        
        emit PatientRegistered(_nida, msg.sender, _fullName, block.timestamp);
    }
    
    /**
     * @dev Get patient details by NIDA
     * @param _nida National ID number
     * @return Patient details
     */
    function getPatient(string memory _nida) public view returns (
        string memory,
        string memory,
        string memory,
        string memory,
        address,
        uint256,
        bool
    ) {
        Patient memory p = patients[_nida];
        return (
            p.nida,
            p.fullName,
            p.email,
            p.phone,
            p.walletAddress,
            p.registrationDate,
            p.isActive
        );
    }
    
    /**
     * @dev Check if patient is registered
     * @param _nida National ID number
     * @return bool True if patient exists
     */
    function isPatientRegistered(string memory _nida) public view returns (bool) {
        return bytes(patients[_nida].nida).length > 0;
    }
    
    /**
     * @dev Get NIDA by wallet address
     * @param _wallet Patient's wallet address
     * @return string NIDA number
     */
    function getNidaByWallet(address _wallet) public view returns (string memory) {
        return walletToNida[_wallet];
    }
}