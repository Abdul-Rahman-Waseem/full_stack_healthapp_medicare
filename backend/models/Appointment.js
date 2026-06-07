// models/Appointment.js
const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
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
  appointmentDate: { type: Date, required: true },
  appointmentTime: { type: String, required: true },
  reason: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'rejected', 'completed', 'cancelled'],
    default: 'pending'
  },
  type: {
    type: String,
    enum: ['initial', 'followup', 'checkup'],
    default: 'initial'
  },
  notes: { type: String },         // doctor's notes after appointment
  rejectionReason: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Appointment', appointmentSchema);
