// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title ConsentManager
 * @dev Manages patient consent for data access using blockchain
 * @notice Patients can grant/revoke access to doctors for their health records
 */
contract ConsentManager {
    // Event emitted when consent is granted
    event ConsentGranted(
        string indexed nida,
        string indexed doctorId,
        address grantedBy,
        uint256 expiry,
        uint256 timestamp
    );

    // Event emitted when consent is revoked
    event ConsentRevoked(
        string indexed nida,
        string indexed doctorId,
        address revokedBy,
        uint256 timestamp
    );

    // Consent structure
    struct Consent {
        string nida;
        string doctorId;
        address patientAddress;
        uint256 grantDate;
        uint256 expiryDate;
        bool isActive;
    }

    // Mapping from NIDA+DoctorID to Consent
    mapping(bytes32 => Consent) public consents;

    // Mapping from NIDA to list of doctor IDs with access
    mapping(string => string[]) public patientConsents;

    // Patient Registry contract reference
    address public patientRegistry;

    constructor(address _patientRegistry) {
        patientRegistry = _patientRegistry;
    }

    // Generate unique key for consent mapping
    function getConsentKey(
        string memory _nida,
        string memory _doctorId
    ) private pure returns (bytes32) {
        return keccak256(abi.encodePacked(_nida, _doctorId));
    }

    /**
     * @dev Grant consent to a doctor
     * @param _nida Patient's NIDA number
     * @param _doctorId Doctor's unique ID
     * @param _expiryDays Number of days until consent expires (0 = never)
     */
    function grantConsent(
        string memory _nida,
        string memory _doctorId,
        uint256 _expiryDays
    ) public {
        bytes32 key = getConsentKey(_nida, _doctorId);

        require(!consents[key].isActive, "Consent already active");

        uint256 expiry = _expiryDays > 0
            ? block.timestamp + (_expiryDays * 1 days)
            : 0;

        consents[key] = Consent({
            nida: _nida,
            doctorId: _doctorId,
            patientAddress: msg.sender,
            grantDate: block.timestamp,
            expiryDate: expiry,
            isActive: true
        });

        patientConsents[_nida].push(_doctorId);

        emit ConsentGranted(
            _nida,
            _doctorId,
            msg.sender,
            expiry,
            block.timestamp
        );
    }

    /**
     * @dev Revoke consent from a doctor
     * @param _nida Patient's NIDA number
     * @param _doctorId Doctor's unique ID
     */
    function revokeConsent(
        string memory _nida,
        string memory _doctorId
    ) public {
        bytes32 key = getConsentKey(_nida, _doctorId);

        require(consents[key].isActive, "No active consent found");
        require(
            consents[key].patientAddress == msg.sender,
            "Only patient can revoke consent"
        );

        consents[key].isActive = false;

        emit ConsentRevoked(_nida, _doctorId, msg.sender, block.timestamp);
    }

    /**
     * @dev Check if a doctor has consent to access patient data
     * @param _nida Patient's NIDA number
     * @param _doctorId Doctor's unique ID
     * @return bool True if consent is valid
     */
    function hasConsent(
        string memory _nida,
        string memory _doctorId
    ) public view returns (bool) {
        bytes32 key = getConsentKey(_nida, _doctorId);
        Consent memory c = consents[key];

        // Check if consent exists using bytes length
        if (bytes(c.nida).length == 0) {
            return false;
        }

        if (!c.isActive) return false;

        // Check if consent has expired
        if (c.expiryDate > 0 && block.timestamp > c.expiryDate) {
            return false;
        }

        return true;
    }

    /**
     * @dev Get all doctors with consent for a patient
     * @param _nida Patient's NIDA number
     * @return string[] Array of doctor IDs
     */
    function getConsentedDoctors(
        string memory _nida
    ) public view returns (string[] memory) {
        return patientConsents[_nida];
    }

    /**
     * @dev Get consent details
     * @param _nida Patient's NIDA number
     * @param _doctorId Doctor's unique ID
     * @return Consent details
     */
    function getConsentDetails(
        string memory _nida,
        string memory _doctorId
    )
        public
        view
        returns (string memory, string memory, address, uint256, uint256, bool)
    {
        bytes32 key = getConsentKey(_nida, _doctorId);
        Consent memory c = consents[key];

        return (
            c.nida,
            c.doctorId,
            c.patientAddress,
            c.grantDate,
            c.expiryDate,
            c.isActive
        );
    }
}
