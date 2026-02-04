const db = require('./database');

class ConsentFlow {
  // Doctor searches for patient
  searchPatient(nida, searchingDoctorId) {
    const patient = db.searchPatientByNida(nida);
    
    if (!patient) {
      return {
        success: false,
        error: 'Patient not found'
      };
    }
    
    // Check if doctor already has consent
    const hasAccess = db.hasConsent(nida, searchingDoctorId);
    
    return {
      success: true,
      patient: {
        nida: patient.nida,
        name: patient.name,
        canAccess: hasAccess
      },
      accessStatus: hasAccess ? 'granted' : 'no_access'
    };
  }
  
  // Doctor requests access to patient
  requestAccess(patientNida, doctorId, purpose) {
    const patient = db.getPatient(patientNida);
    if (!patient) {
      return {
        success: false,
        error: 'Patient not found'
      };
    }
    
    // Check if already has access
    if (db.hasConsent(patientNida, doctorId)) {
      return {
        success: false,
        error: 'Already has access'
      };
    }
    
    // Check if request already pending
    const pendingRequests = db.getPendingRequests(patientNida);
    const existingRequest = pendingRequests.find(req => req.doctorId === doctorId);
    
    if (existingRequest) {
      return {
        success: false,
        error: 'Request already pending'
      };
    }
    
    // Create access request
    const request = db.createAccessRequest(patientNida, doctorId, purpose);
    
    return {
      success: true,
      request,
      message: 'Access request sent to patient'
    };
  }
  
  // Patient approves access request
  approveRequest(requestId, patientNida) {
    const requests = Object.values(db.accessRequests);
    const request = requests.find(r => r.id === requestId && r.patientNida === patientNida);
    
    if (!request) {
      return {
        success: false,
        error: 'Request not found'
      };
    }
    
    if (request.status !== 'pending') {
      return {
        success: false,
        error: `Request already ${request.status}`
      };
    }
    
    // Grant consent
    const consent = db.grantConsent(patientNida, request.doctorId);
    
    // Update request status
    request.status = 'approved';
    request.approvedDate = new Date().toISOString();
    
    // Add notification to doctor
    const doctor = db.doctors[request.doctorId];
    if (doctor) {
      const doctorId = doctor.id;
      if (!db.notifications[doctorId]) {
        db.notifications[doctorId] = [];
      }
      
      const patient = db.patients[patientNida];
      db.notifications[doctorId].unshift({
        id: 'NOT' + (Object.keys(db.notifications).reduce((acc, curr) => acc + db.notifications[curr].length, 0) + 1).toString().padStart(3, '0'),
        type: 'access_granted',
        title: 'Access Granted',
        message: `${patient?.name || 'A patient'} approved your access request`,
        time: 'Just now',
        read: false
      });
    }
    
    // Update patient stats
    if (db.patients[patientNida]) {
      db.patients[patientNida].stats.pendingRequests = 
        Math.max(0, (db.patients[patientNida].stats.pendingRequests || 1) - 1);
      db.patients[patientNida].stats.doctorsWithAccess = 
        (db.patients[patientNida].stats.doctorsWithAccess || 0) + 1;
    }
    
    return {
      success: true,
      consent,
      request,
      message: 'Access granted successfully'
    };
  }
  
  // Patient rejects access request
  rejectRequest(requestId, patientNida) {
    const requests = Object.values(db.accessRequests);
    const request = requests.find(r => r.id === requestId && r.patientNida === patientNida);
    
    if (!request) {
      return {
        success: false,
        error: 'Request not found'
      };
    }
    
    if (request.status !== 'pending') {
      return {
        success: false,
        error: `Request already ${request.status}`
      };
    }
    
    // Update request status
    request.status = 'rejected';
    request.rejectedDate = new Date().toISOString();
    
    // Add notification to doctor
    const doctor = db.doctors[request.doctorId];
    if (doctor) {
      const doctorId = doctor.id;
      if (!db.notifications[doctorId]) {
        db.notifications[doctorId] = [];
      }
      
      const patient = db.patients[patientNida];
      db.notifications[doctorId].unshift({
        id: 'NOT' + (Object.keys(db.notifications).reduce((acc, curr) => acc + db.notifications[curr].length, 0) + 1).toString().padStart(3, '0'),
        type: 'access_rejected',
        title: 'Access Rejected',
        message: `${patient?.name || 'A patient'} rejected your access request`,
        time: 'Just now',
        read: false
      });
    }
    
    // Update patient stats
    if (db.patients[patientNida]) {
      db.patients[patientNida].stats.pendingRequests = 
        Math.max(0, (db.patients[patientNida].stats.pendingRequests || 1) - 1);
    }
    
    return {
      success: true,
      request,
      message: 'Access request rejected'
    };
  }
  
  // Toggle consent (grant/revoke)
  toggleConsent(patientNida, doctorId, currentStatus) {
    if (currentStatus === 'granted' || currentStatus === 'pending') {
      // Revoke access
      const revoked = db.revokeConsent(patientNida, doctorId);
      
      // Add notification to doctor
      const doctor = db.doctors[doctorId];
      if (doctor) {
        const doctorIdKey = doctor.id;
        if (!db.notifications[doctorIdKey]) {
          db.notifications[doctorIdKey] = [];
        }
        
        const patient = db.patients[patientNida];
        db.notifications[doctorIdKey].unshift({
          id: 'NOT' + (Object.keys(db.notifications).reduce((acc, curr) => acc + db.notifications[curr].length, 0) + 1).toString().padStart(3, '0'),
          type: 'access_revoked',
          title: 'Access Revoked',
          message: `${patient?.name || 'A patient'} revoked your access`,
          time: 'Just now',
          read: false
        });
      }
      
      return {
        success: true,
        action: 'revoked',
        consent: revoked,
        message: 'Access revoked successfully'
      };
    } else {
      // Grant access
      const granted = db.grantConsent(patientNida, doctorId);
      
      // Add notification to doctor
      const doctor = db.doctors[doctorId];
      if (doctor) {
        const doctorIdKey = doctor.id;
        if (!db.notifications[doctorIdKey]) {
          db.notifications[doctorIdKey] = [];
        }
        
        const patient = db.patients[patientNida];
        db.notifications[doctorIdKey].unshift({
          id: 'NOT' + (Object.keys(db.notifications).reduce((acc, curr) => acc + db.notifications[curr].length, 0) + 1).toString().padStart(3, '0'),
          type: 'access_granted',
          title: 'Access Granted',
          message: `${patient?.name || 'A patient'} granted you access`,
          time: 'Just now',
          read: false
        });
      }
      
      return {
        success: true,
        action: 'granted',
        consent: granted,
        message: 'Access granted successfully'
      };
    }
  }
  
  // Get accessible records for doctor
  getAccessibleRecords(doctorId) {
    const accessiblePatients = db.getDoctorPatients(doctorId);
    
    const records = [];
    accessiblePatients.forEach(patient => {
      const patientRecords = db.getPatientRecords(patient.nida);
      records.push(...patientRecords.map(record => ({
        ...record,
        patientName: patient.name,
        patientNida: patient.nida
      })));
    });
    
    return records;
  }
}

module.exports = new ConsentFlow();