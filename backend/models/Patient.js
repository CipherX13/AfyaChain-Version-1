const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  nida: {
    type: String,
    required: true,
    unique: true,
    minlength: 15,
    maxlength: 20
  },
  fullName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String,
    required: true
  },
  walletAddress: {
    type: String,
    required: true,
    unique: true
  },
  role: {
    type: String,
    enum: ['patient', 'doctor', 'admin'],
    default: 'patient'
  },
  medicalHistory: [{
    condition: String,
    diagnosisDate: Date,
    status: String
  }],
  allergies: [String],
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String
  },
  registrationDate: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Patient', patientSchema);