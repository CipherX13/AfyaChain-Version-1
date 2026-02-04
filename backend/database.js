// Real in-memory database with user-specific data
class Database {
  constructor() {
    this.patients = {};
    this.doctors = {};
    this.records = {};
    this.consents = {};
    this.accessRequests = {};
    this.notifications = {};
    this.initSampleData();
  }
  
  initSampleData() {
    // Initialize patient records
    this.patients['199012345678901'] = {
      id: 'PAT001',
      nida: '199012345678901',
      name: 'John Michael',
      email: 'john@example.com',
      wallet: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
      records: ['REC001', 'REC002', 'REC003'],
      stats: {
        medicalRecords: 3,
        doctorsWithAccess: 1,
        upcomingAppointments: 2,
        pendingRequests: 1
      }
    };
    
    this.patients['199087654321098'] = {
      id: 'PAT002',
      nida: '199087654321098',
      name: 'Mary Johnson',
      email: 'mary@example.com',
      wallet: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
      records: ['REC004', 'REC005'],
      stats: {
        medicalRecords: 2,
        doctorsWithAccess: 1,
        upcomingAppointments: 1,
        pendingRequests: 0
      }
    };
    
    // Initialize doctors
    this.doctors['DOC001'] = {
      id: 'DOC001',
      name: 'Dr. Sarah K.',
      specialty: 'Internal Medicine',
      facility: 'Muhimbili National Hospital',
      patientsWithAccess: ['199012345678901'],
      stats: {
        patientsWithAccess: 1,
        accessibleRecords: 3,
        pendingRequests: 3,
        todaysAppointments: 8
      }
    };
    
    this.doctors['DOC002'] = {
      id: 'DOC002',
      name: 'Dr. Ahmed M.',
      specialty: 'Radiology',
      facility: 'Aga Khan Hospital',
      patientsWithAccess: ['199087654321098'],
      stats: {
        patientsWithAccess: 1,
        accessibleRecords: 2,
        pendingRequests: 2,
        todaysAppointments: 5
      }
    };
    
    // Initialize health records
    this.records['REC001'] = {
      id: 'REC001',
      patientNida: '199012345678901',
      type: 'lab_results',
      title: 'Complete Blood Count',
      date: '2023-10-15',
      facility: 'Muhimbili National Hospital',
      doctorId: 'DOC001',
      summary: 'Normal results across all parameters',
      status: 'normal'
    };
    
    this.records['REC002'] = {
      id: 'REC002',
      patientNida: '199012345678901',
      type: 'xray',
      title: 'Chest X-Ray',
      date: '2023-09-22',
      facility: 'Muhimbili National Hospital',
      doctorId: 'DOC001',
      summary: 'Clear lungs, no abnormalities',
      status: 'clear'
    };
    
    this.records['REC003'] = {
      id: 'REC003',
      patientNida: '199012345678901',
      type: 'consultation',
      title: 'Annual Checkup',
      date: '2023-08-10',
      facility: 'Muhimbili National Hospital',
      doctorId: 'DOC001',
      summary: 'Routine checkup, prescription renewal',
      status: 'follow-up'
    };
    
    this.records['REC004'] = {
      id: 'REC004',
      patientNida: '199087654321098',
      type: 'lab_results',
      title: 'Blood Glucose Test',
      date: '2023-10-20',
      facility: 'Aga Khan Hospital',
      doctorId: 'DOC002',
      summary: 'Fasting glucose: 95 mg/dL',
      status: 'normal'
    };
    
    this.records['REC005'] = {
      id: 'REC005',
      patientNida: '199087654321098',
      type: 'xray',
      title: 'Knee X-Ray',
      date: '2023-09-15',
      facility: 'Aga Khan Hospital',
      doctorId: 'DOC002',
      summary: 'Mild arthritis detected',
      status: 'follow-up'
    };
    
    // Initialize consents
    this.consents['199012345678901_DOC001'] = {
      patientNida: '199012345678901',
      doctorId: 'DOC001',
      status: 'granted',
      grantedDate: '2023-10-16',
      expiryDate: '2024-10-16'
    };
    
    this.consents['199087654321098_DOC002'] = {
      patientNida: '199087654321098',
      doctorId: 'DOC002',
      status: 'granted',
      grantedDate: '2023-09-23',
      expiryDate: '2024-09-23'
    };
    
    // Initialize access requests
    this.accessRequests['REQ001'] = {
      id: 'REQ001',
      patientNida: '199012345678901',
      doctorId: 'DOC002', // Dr. Ahmed requesting access to John
      status: 'pending',
      requestedDate: '2023-10-20',
      purpose: 'Second opinion on lab results'
    };
    
    // Initialize notifications
    this.notifications['PAT001'] = [
      {
        id: 'NOT001',
        type: 'access_request',
        title: 'New Access Request',
        message: 'Dr. Ahmed M. requested access to your records',
        time: '10 minutes ago',
        read: false,
        data: { requestId: 'REQ001', doctorId: 'DOC002' }
      },
      {
        id: 'NOT002',
        type: 'new_record',
        title: 'New Test Results',
        message: 'Your lab results from Muhimbili Hospital are available',
        time: '2 hours ago',
        read: false
      }
    ];
    
    this.notifications['DOC001'] = [
      {
        id: 'NOT003',
        type: 'access_granted',
        title: 'Access Granted',
        message: 'John Michael approved your access request',
        time: '1 day ago',
        read: false
      }
    ];
  }
  
  // Patient methods
  getPatient(nida) {
    return this.patients[nida];
  }
  
  getPatientRecords(nida) {
    const patient = this.patients[nida];
    if (!patient) return [];
    
    return patient.records.map(recordId => this.records[recordId]);
  }
  
  getPatientConsents(nida) {
    return Object.values(this.consents).filter(c => c.patientNida === nida);
  }
  
  // Doctor methods
  getDoctor(doctorId) {
    return this.doctors[doctorId];
  }
  
  getDoctorPatients(doctorId) {
    const consents = Object.values(this.consents).filter(c => 
      c.doctorId === doctorId && c.status === 'granted'
    );
    
    return consents.map(consent => ({
      ...this.patients[consent.patientNida],
      consent
    }));
  }
  
  // Consent methods
  hasConsent(patientNida, doctorId) {
    const key = `${patientNida}_${doctorId}`;
    const consent = this.consents[key];
    return consent && consent.status === 'granted';
  }
  
  grantConsent(patientNida, doctorId, expiryDays = 365) {
    const key = `${patientNida}_${doctorId}`;
    
    this.consents[key] = {
      patientNida,
      doctorId,
      status: 'granted',
      grantedDate: new Date().toISOString(),
      expiryDate: new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000).toISOString()
    };
    
    // Remove any pending requests
    Object.values(this.accessRequests).forEach(request => {
      if (request.patientNida === patientNida && 
          request.doctorId === doctorId && 
          request.status === 'pending') {
        request.status = 'approved';
      }
    });
    
    // Add doctor to patient's access list
    if (this.patients[patientNida]) {
      const doctor = this.doctors[doctorId];
      if (!this.patients[patientNida].doctorsWithAccess) {
        this.patients[patientNida].doctorsWithAccess = [];
      }
      if (!this.patients[patientNida].doctorsWithAccess.includes(doctorId)) {
        this.patients[patientNida].doctorsWithAccess.push(doctorId);
      }
    }
    
    // Add patient to doctor's access list
    if (this.doctors[doctorId]) {
      if (!this.doctors[doctorId].patientsWithAccess) {
        this.doctors[doctorId].patientsWithAccess = [];
      }
      if (!this.doctors[doctorId].patientsWithAccess.includes(patientNida)) {
        this.doctors[doctorId].patientsWithAccess.push(patientNida);
      }
    }
    
    return this.consents[key];
  }
  
  revokeConsent(patientNida, doctorId) {
    const key = `${patientNida}_${doctorId}`;
    if (this.consents[key]) {
      this.consents[key].status = 'revoked';
      this.consents[key].revokedDate = new Date().toISOString();
      
      // Update patient stats
      if (this.patients[patientNida]) {
        this.patients[patientNida].stats.doctorsWithAccess = 
          Math.max(0, (this.patients[patientNida].stats.doctorsWithAccess || 1) - 1);
      }
      
      // Update doctor stats
      if (this.doctors[doctorId]) {
        this.doctors[doctorId].stats.patientsWithAccess = 
          Math.max(0, (this.doctors[doctorId].stats.patientsWithAccess || 1) - 1);
      }
      
      return this.consents[key];
    }
    return null;
  }
  
  // Access request methods
  createAccessRequest(patientNida, doctorId, purpose = 'Medical consultation') {
    const requestId = 'REQ' + (Object.keys(this.accessRequests).length + 1).toString().padStart(3, '0');
    
    this.accessRequests[requestId] = {
      id: requestId,
      patientNida,
      doctorId,
      status: 'pending',
      requestedDate: new Date().toISOString(),
      purpose
    };
    
    // Add notification to patient
    const patient = this.patients[patientNida];
    if (patient) {
      const patientId = patient.id;
      if (!this.notifications[patientId]) {
        this.notifications[patientId] = [];
      }
      
      const doctor = this.doctors[doctorId];
      this.notifications[patientId].unshift({
        id: 'NOT' + (Object.keys(this.notifications).reduce((acc, curr) => acc + this.notifications[curr].length, 0) + 1).toString().padStart(3, '0'),
        type: 'access_request',
        title: 'New Access Request',
        message: `${doctor?.name || 'A doctor'} requested access to your records`,
        time: 'Just now',
        read: false,
        data: { requestId, doctorId }
      });
      
      // Update patient stats
      patient.stats.pendingRequests = (patient.stats.pendingRequests || 0) + 1;
    }
    
    return this.accessRequests[requestId];
  }
  
  getPendingRequests(patientNida) {
    return Object.values(this.accessRequests).filter(request => 
      request.patientNida === patientNida && request.status === 'pending'
    );
  }
  
  // Notification methods
  getNotifications(userId) {
    return this.notifications[userId] || [];
  }
  
  markNotificationRead(userId, notificationId) {
    const userNotifications = this.notifications[userId];
    if (userNotifications) {
      const notification = userNotifications.find(n => n.id === notificationId);
      if (notification) {
        notification.read = true;
      }
    }
  }
  
  markAllNotificationsRead(userId) {
    if (this.notifications[userId]) {
      this.notifications[userId].forEach(notification => {
        notification.read = true;
      });
    }
  }
  
  // Search methods
  searchPatientByNida(nida) {
    const patient = this.patients[nida];
    if (!patient) return null;
    
    return {
      ...patient,
      records: this.getPatientRecords(nida),
      hasConsentForDoctor: (doctorId) => this.hasConsent(nida, doctorId)
    };
  }
  
  // Admin methods
  getAllPatients() {
    return Object.values(this.patients);
  }
  
  getAllDoctors() {
    return Object.values(this.doctors);
  }
  
  getAllRecords() {
    return Object.values(this.records);
  }
  
  getSystemStats() {
    return {
      totalPatients: Object.keys(this.patients).length,
      totalDoctors: Object.keys(this.doctors).length,
      totalRecords: Object.keys(this.records).length,
      totalConsents: Object.values(this.consents).filter(c => c.status === 'granted').length,
      pendingRequests: Object.values(this.accessRequests).filter(r => r.status === 'pending').length
    };
  }
}

module.exports = new Database();