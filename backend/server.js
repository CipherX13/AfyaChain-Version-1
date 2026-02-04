try {
    const requestId = req.params.requestId;
    const patient = db.getPatient(req.user.nida);
    
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    
    const request = db.getPendingRequest(requestId);
    
    if (!request || request.patientNida !== req.user.nida) {
      return res.status(404).json({ error: 'Request not found' });
    }
    
    // Grant consent
    const consent = consentFlow.grantConsent(
      req.user.nida,
      request.doctorId,
      request.purpose,
      request.accessDuration
    );
    
    // Remove from pending requests
    db.removePendingRequest(requestId);
    
    // Add notification for doctor
    db.addNotification(request.doctorId, {
      id: Date.now().toString(),
      type: 'consent_granted',
      title: 'Access Granted',
      message: `${patient.name} has granted you access to their medical records`,
      timestamp: new Date().toISOString(),
      read: false,
      data: {
        patientNida: req.user.nida,
        patientName: patient.name,
        consentId: consent.id
      }
    });
    
    res.json({
      success: true,
      message: 'Access granted successfully',
      consent
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to approve request', details: error.message });
  };

// Reject access request
app.post('/api/patient/requests/:requestId/reject', authenticate, authorize(['patient']), (req, res) => {
  try {
    const requestId = req.params.requestId;
    const patient = db.getPatient(req.user.nida);
    
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    
    const request = db.getPendingRequest(requestId);
    
    if (!request || request.patientNida !== req.user.nida) {
      return res.status(404).json({ error: 'Request not found' });
    }
    
    // Remove from pending requests
    db.removePendingRequest(requestId);
    
    // Add notification for doctor
    db.addNotification(request.doctorId, {
      id: Date.now().toString(),
      type: 'consent_rejected',
      title: 'Access Denied',
      message: `${patient.name} has denied your access request`,
      timestamp: new Date().toISOString(),
      read: false,
      data: {
        patientNida: req.user.nida,
        patientName: patient.name,
        requestId: requestId
      }
    });
    
    res.json({
      success: true,
      message: 'Request rejected successfully'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reject request', details: error.message });
  }
});

// Revoke consent
app.post('/api/patient/consents/:consentId/revoke', authenticate, authorize(['patient']), (req, res) => {
  try {
    const { consentId } = req.params;
    const patientNida = req.user.nida;
    
    const success = consentFlow.revokeConsent(patientNida, consentId);
    
    if (!success) {
      return res.status(404).json({ error: 'Consent not found or already revoked' });
    }
    
    res.json({
      success: true,
      message: 'Consent revoked successfully'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to revoke consent', details: error.message });
  }
});

// Update patient profile
app.put('/api/patient/profile', authenticate, authorize(['patient']), (req, res) => {
  try {
    const { name, email, walletAddress } = req.body;
    const patient = db.getPatient(req.user.nida);
    
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    
    // Update patient data
    if (name) patient.name = name;
    if (email) patient.email = email;
    if (walletAddress) patient.wallet = walletAddress;
    
    // Update user in auth system
    auth.updateUser(req.user.id, { name, email });
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      patient
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile', details: error.message });
  }
});

// ============ DOCTOR ROUTES ============

// Get doctor's accessible records
app.get('/api/doctor/records', authenticate, authorize(['doctor']), (req, res) => {
  try {
    const accessibleRecords = consentFlow.getAccessibleRecords(req.user.id);
    
    res.json({
      success: true,
      records: accessibleRecords,
      count: accessibleRecords.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get accessible records', details: error.message });
  }
});

// Get specific patient record (with consent check)
app.get('/api/doctor/records/:patientNida', authenticate, authorize(['doctor']), (req, res) => {
  try {
    const { patientNida } = req.params;
    
    // Check if doctor has consent
    const hasAccess = consentFlow.checkAccess(req.user.id, patientNida);
    
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied. No valid consent found.' });
    }
    
    const records = db.getPatientRecords(patientNida);
    const patient = db.getPatient(patientNida);
    
    res.json({
      success: true,
      patient: {
        nida: patient.nida,
        name: patient.name,
        email: patient.email,
        stats: patient.stats
      },
      records
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get patient records', details: error.message });
  }
});

// Add new medical record
app.post('/api/doctor/records', authenticate, authorize(['doctor']), (req, res) => {
  try {
    const { patientNida, type, title, description, data, files } = req.body;
    const doctorId = req.user.id;
    
    // Check if doctor has consent
    const hasAccess = consentFlow.checkAccess(doctorId, patientNida);
    
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied. No valid consent found.' });
    }
    
    const record = db.addMedicalRecord({
      patientNida,
      doctorId,
      type,
      title,
      description,
      data,
      files: files || []
    });
    
    // Update patient stats
    const patient = db.getPatient(patientNida);
    if (patient) {
      patient.stats.medicalRecords++;
    }
    
    // Update doctor stats
    const doctor = db.doctors[doctorId];
    if (doctor) {
      doctor.stats.recordsCreated++;
    }
    
    // Add notification for patient
    db.addNotification(patientNida, {
      id: Date.now().toString(),
      type: 'record_added',
      title: 'New Medical Record',
      message: `Dr. ${doctor?.name || doctorId} has added a new ${type} record`,
      timestamp: new Date().toISOString(),
      read: false,
      data: {
        recordId: record.id,
        doctorId: doctorId,
        doctorName: doctor?.name,
        recordType: type
      }
    });
    
    res.json({
      success: true,
      message: 'Medical record added successfully',
      record
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add medical record', details: error.message });
  }
});

// Request patient access
app.post('/api/doctor/access-request', authenticate, authorize(['doctor']), (req, res) => {
  try {
    const { patientNida, purpose, accessDuration = '30d' } = req.body;
    const doctorId = req.user.id;
    
    // Check if patient exists
    const patient = db.getPatient(patientNida);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    
    // Check if already has access
    const hasAccess = consentFlow.checkAccess(doctorId, patientNida);
    if (hasAccess) {
      return res.status(400).json({ error: 'Already has access to this patient' });
    }
    
    // Check if request already exists
    const existingRequest = db.findPendingRequest(patientNida, doctorId);
    if (existingRequest) {
      return res.status(400).json({ error: 'Access request already pending' });
    }
    
    // Create access request
    const request = db.addPendingRequest({
      patientNida,
      doctorId,
      purpose,
      accessDuration
    });
    
    // Add notification for patient
    db.addNotification(patientNida, {
      id: Date.now().toString(),
      type: 'access_request',
      title: 'New Access Request',
      message: `Dr. ${db.doctors[doctorId]?.name || doctorId} is requesting access to your medical records`,
      timestamp: new Date().toISOString(),
      read: false,
      data: {
        requestId: request.id,
        doctorId: doctorId,
        doctorName: db.doctors[doctorId]?.name,
        purpose: purpose
      }
    });
    
    res.json({
      success: true,
      message: 'Access request sent successfully',
      request
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send access request', details: error.message });
  }
});

// Get doctor's active consents
app.get('/api/doctor/consents', authenticate, authorize(['doctor']), (req, res) => {
  try {
    const doctorId = req.user.id;
    const consents = consentFlow.getDoctorConsents(doctorId);
    
    const detailedConsents = consents.map(consent => {
      const patient = db.getPatient(consent.patientNida);
      return {
        ...consent,
        patientName: patient?.name,
        patientEmail: patient?.email,
        patientStats: patient?.stats
      };
    });
    
    res.json({
      success: true,
      consents: detailedConsents
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get consents', details: error.message });
  }
});

// Update doctor profile
app.put('/api/doctor/profile', authenticate, authorize(['doctor']), (req, res) => {
  try {
    const { name, email, specialty, facility, licenseNumber } = req.body;
    const doctorId = req.user.id;
    
    const doctor = db.doctors[doctorId];
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }
    
    // Update doctor data
    if (name) doctor.name = name;
    if (email) doctor.email = email;
    if (specialty) doctor.specialty = specialty;
    if (facility) doctor.facility = facility;
    if (licenseNumber) doctor.licenseNumber = licenseNumber;
    
    // Update user in auth system
    auth.updateUser(req.user.id, { name, email });
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      doctor
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile', details: error.message });
  }
});

// ============ ADMIN ROUTES ============

// Get all users
app.get('/api/admin/users', authenticate, authorize(['admin']), (req, res) => {
  try {
    const users = auth.getAllUsers();
    
    res.json({
      success: true,
      users,
      counts: {
        total: users.length,
        patients: users.filter(u => u.role === 'patient').length,
        doctors: users.filter(u => u.role === 'doctor').length,
        admins: users.filter(u => u.role === 'admin').length
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get users', details: error.message });
  }
});

// Get all patients
app.get('/api/admin/patients', authenticate, authorize(['admin']), (req, res) => {
  try {
    const patients = Object.values(db.patients);
    
    res.json({
      success: true,
      patients,
      count: patients.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get patients', details: error.message });
  }
});

// Get all doctors
app.get('/api/admin/doctors', authenticate, authorize(['admin']), (req, res) => {
  try {
    const doctors = Object.values(db.doctors);
    
    res.json({
      success: true,
      doctors,
      count: doctors.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get doctors', details: error.message });
  }
});

// Get all records
app.get('/api/admin/records', authenticate, authorize(['admin']), (req, res) => {
  try {
    const records = db.getAllRecords();
    
    res.json({
      success: true,
      records,
      count: records.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get records', details: error.message });
  }
});

// Get all consents
app.get('/api/admin/consents', authenticate, authorize(['admin']), (req, res) => {
  try {
    const consents = consentFlow.getAllConsents();
    
    const detailedConsents = consents.map(consent => {
      const patient = db.getPatient(consent.patientNida);
      const doctor = db.doctors[consent.doctorId];
      
      return {
        ...consent,
        patientName: patient?.name,
        doctorName: doctor?.name,
        doctorSpecialty: doctor?.specialty
      };
    });
    
    res.json({
      success: true,
      consents: detailedConsents,
      counts: {
        active: consents.filter(c => c.status === 'active').length,
        revoked: consents.filter(c => c.status === 'revoked').length,
        expired: consents.filter(c => c.status === 'expired').length
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get consents', details: error.message });
  }
});

// Deactivate user
app.post('/api/admin/users/:userId/deactivate', authenticate, authorize(['admin']), (req, res) => {
  try {
    const { userId } = req.params;
    const success = auth.deactivateUser(userId);
    
    if (!success) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      success: true,
      message: 'User deactivated successfully'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to deactivate user', details: error.message });
  }
});

// Activate user
app.post('/api/admin/users/:userId/activate', authenticate, authorize(['admin']), (req, res) => {
  try {
    const { userId } = req.params;
    const success = auth.activateUser(userId);
    
    if (!success) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      success: true,
      message: 'User activated successfully'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to activate user', details: error.message });
  }
});

// Get system logs
app.get('/api/admin/logs', authenticate, authorize(['admin']), (req, res) => {
  try {
    const logs = db.getSystemLogs();
    
    res.json({
      success: true,
      logs,
      count: logs.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get logs', details: error.message });
  }
});

// ============ SHARED ROUTES ============

// Search patients (doctors and admin)
app.get('/api/search/patients', authenticate, authorize(['doctor', 'admin']), (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || query.length < 2) {
      return res.status(400).json({ error: 'Search query must be at least 2 characters' });
    }
    
    const patients = Object.values(db.patients).filter(patient => {
      return (
        patient.name.toLowerCase().includes(query.toLowerCase()) ||
        patient.nida.includes(query) ||
        patient.email.toLowerCase().includes(query.toLowerCase())
      );
    });
    
    // For doctors, filter out patients they already have access to
    if (req.user.role === 'doctor') {
      const accessiblePatients = consentFlow.getAccessibleRecords(req.user.id)
        .map(record => record.patientNida);
      
      const filteredPatients = patients.filter(patient => 
        !accessiblePatients.includes(patient.nida)
      );
      
      return res.json({
        success: true,
        patients: filteredPatients.map(p => ({
          nida: p.nida,
          name: p.name,
          email: p.email,
          stats: p.stats
        })),
        count: filteredPatients.length
      });
    }
    
    res.json({
      success: true,
      patients: patients.map(p => ({
        nida: p.nida,
        name: p.name,
        email: p.email,
        stats: p.stats
      })),
      count: patients.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Search failed', details: error.message });
  }
});

// Get activity log
app.get('/api/activity', authenticate, (req, res) => {
  try {
    const user = req.user;
    let activities = [];
    
    if (user.role === 'patient') {
      activities = db.getPatientActivity(user.nida);
    } else if (user.role === 'doctor') {
      activities = db.getDoctorActivity(user.id);
    } else if (user.role === 'admin') {
      activities = db.getSystemLogs();
    }
    
    res.json({
      success: true,
      activities: activities.slice(0, 50) // Limit to 50 most recent
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get activity log', details: error.message });
  }
});

// ============ ERROR HANDLING ============

// 404 handler
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ============ SERVER START ============

app.listen(PORT, () => {
  console.log(`
  ====================================
  Afya-Chain API Server v2.0.0
  ====================================
  Server running on port ${PORT}
  Environment: ${process.env.NODE_ENV || 'development'}
  Health check: http://localhost:${PORT}/api/health
  ====================================
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

module.exports = app;