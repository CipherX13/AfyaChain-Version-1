// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title HealthRecord
 * @dev Stores health record hashes on blockchain (not actual medical data)
 * @notice Medical data is stored off-chain, only hash is stored on-chain for verification
 */
contract HealthRecord {
    
    // Event emitted when a new record is added
    event RecordAdded(
        string indexed recordId,
        string indexed nida,
        string recordHash,
        string recordType,
        address addedBy,
        uint256 timestamp
    );
    
    // Record structure
    struct MedicalRecord {
        string recordId;
        string nida;
        string recordHash;      // SHA-256 hash of the encrypted medical data
        string recordType;      // "lab_results", "xray", "consultation", etc.
        string facility;
        string doctorId;
        uint256 timestamp;
        bool isValid;
    }
    
    // Mapping from record ID to record details
    mapping(string => MedicalRecord) public records;
    
    // Mapping from NIDA to list of record IDs
    mapping(string => string[]) public patientRecords;
    
    // Only registered facilities/doctors can add records (simplified for demo)
    address public admin;
    
    constructor() {
        admin = msg.sender;
    }
    
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }
    
    /**
     * @dev Add a new health record hash to blockchain
     * @param _recordId Unique record identifier
     * @param _nida Patient's NIDA number
     * @param _recordHash SHA-256 hash of encrypted medical data
     * @param _recordType Type of medical record
     * @param _facility Hospital/clinic name
     * @param _doctorId Doctor's ID
     */
    function addRecord(
        string memory _recordId,
        string memory _nida,
        string memory _recordHash,
        string memory _recordType,
        string memory _facility,
        string memory _doctorId
    ) public onlyAdmin {
        require(bytes(records[_recordId].recordId).length == 0, "Record ID already exists");
        require(bytes(_recordHash).length == 64, "Invalid hash length (should be 64 chars)");
        
        records[_recordId] = MedicalRecord({
            recordId: _recordId,
            nida: _nida,
            recordHash: _recordHash,
            recordType: _recordType,
            facility: _facility,
            doctorId: _doctorId,
            timestamp: block.timestamp,
            isValid: true
        });
        
        patientRecords[_nida].push(_recordId);
        
        emit RecordAdded(_recordId, _nida, _recordHash, _recordType, msg.sender, block.timestamp);
    }
    
    /**
     * @dev Verify if a record hash matches the stored hash
     * @param _recordId Record identifier
     * @param _recordHash Hash to verify
     * @return bool True if hash matches
     */
    function verifyRecord(string memory _recordId, string memory _recordHash) public view returns (bool) {
        return keccak256(bytes(records[_recordId].recordHash)) == keccak256(bytes(_recordHash));
    }
    
    /**
     * @dev Get all record IDs for a patient
     * @param _nida Patient's NIDA number
     * @return string[] Array of record IDs
     */
    function getPatientRecordIds(string memory _nida) public view returns (string[] memory) {
        return patientRecords[_nida];
    }
    
    /**
     * @dev Get record details by ID
     * @param _recordId Record identifier
     * @return Record details
     */
    function getRecord(string memory _recordId) public view returns (
        string memory,
        string memory,
        string memory,
        string memory,
        string memory,
        string memory,
        uint256,
        bool
    ) {
        MedicalRecord memory r = records[_recordId];
        return (
            r.recordId,
            r.nida,
            r.recordHash,
            r.recordType,
            r.facility,
            r.doctorId,
            r.timestamp,
            r.isValid
        );
    }
    
    /**
     * @dev Invalidate a record (only in case of error)
     * @param _recordId Record identifier
     */
    function invalidateRecord(string memory _recordId) public onlyAdmin {
        records[_recordId].isValid = false;
    }
}