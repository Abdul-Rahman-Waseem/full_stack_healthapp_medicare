// models/Doctor.js
const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  specialization: {
    type: String,
    required: [true, 'Specialization is required']
  },
  qualification: { type: String, required: true },
  experience: { type: Number, required: true }, // years
  fee: { type: Number, required: true },          // consultation fee
  availableDays: [{
    type: String,
    enum: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']
  }],
  availableTime: {
    start: { type: String, default: '09:00' },
    end:   { type: String, default: '17:00' }
  },
  hospital: { type: String },
  bio: { type: String },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Doctor', doctorSchema);
