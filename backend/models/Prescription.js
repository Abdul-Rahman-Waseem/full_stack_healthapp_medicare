// models/Prescription.js
const mongoose = require('mongoose');

const medicationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dosage: { type: String, required: true },      // e.g. "500mg"
  frequency: { type: String, required: true },   // e.g. "Twice daily"
  duration: { type: String, required: true },    // e.g. "7 days"
  timing: {
    type: String,
    enum: ['before meal', 'after meal', 'with meal', 'at bedtime', 'as needed'],
    default: 'after meal'
  },
  instructions: { type: String }
});

const prescriptionSchema = new mongoose.Schema({
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  medications: [medicationSchema],
  notes: { type: String },
  validUntil: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Prescription', prescriptionSchema);
