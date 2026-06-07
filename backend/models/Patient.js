// models/Patient.js
const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  dateOfBirth: { type: Date },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other']
  },
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  address: { type: String },
  emergencyContact: {
    name: { type: String },
    phone: { type: String },
    relation: { type: String }
  },
  assignedDoctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor'
  },
  medicalHistory: [{ type: String }],
  allergies: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Patient', patientSchema);
