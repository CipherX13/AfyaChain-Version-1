const mongoose = require('mongoose');

const recordSchema = new mongoose.Schema({
  recordId: {
    type: String,
    required: true,
    unique: true
  },
  nida: {
    type: String,
    required: true,
    index: true
  },
  encryptedData: {
    type: String,
    required: true
  },
  recordType: {
    type: String,
    enum: ['lab_results', 'xray', 'consultation', 'prescription', 'vaccination', 'surgery'],
    required: true
  },
  facility: {
    type: String,
    required: true
  },
  doctorId: {
    type: String,
    required: true
  },
  addedBy: {
    type: String,
    required: true
  },
  blockchainHash: {
    type: String,
    required: true
  },
  timestamp: {
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

// Index for faster queries
recordSchema.index({ nida: 1, timestamp: -1 });

module.exports = mongoose.model('Record', recordSchema);