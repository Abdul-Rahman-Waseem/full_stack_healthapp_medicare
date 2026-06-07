// models/Treatment.js
const mongoose = require('mongoose');

const checkupSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  bloodPressure: { type: String },
  heartRate: { type: String },
  temperature: { type: String },
  weight: { type: String },
  notes: { type: String }
});

const followUpSchema = new mongoose.Schema({
  scheduledDate: { type: Date, required: true },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'missed'],
    default: 'scheduled'
  },
  notes: { type: String }
});

const treatmentSchema = new mongoose.Schema({
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
  diagnosis: { type: String, required: true },
  treatmentPlan: { type: String },
  status: {
    type: String,
    enum: ['active', 'completed', 'on-hold'],
    default: 'active'
  },
  checkups: [checkupSchema],
  followUps: [followUpSchema],
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date }
});

module.exports = mongoose.model('Treatment', treatmentSchema);
