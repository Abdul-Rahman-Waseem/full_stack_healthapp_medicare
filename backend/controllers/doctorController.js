// controllers/doctorController.js
const Doctor = require('../models/Doctor');
const User = require('../models/User');

// @GET /api/doctors — Get all doctors
const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({ isActive: true })
      .populate('user', 'name email phone');
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @GET /api/doctors/:id — Get single doctor
const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id)
      .populate('user', 'name email phone');
    if (!doctor) return res.status(404).json({ message: 'Doctor not found.' });
    res.json(doctor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @POST /api/doctors — Create doctor (Admin only)
const createDoctor = async (req, res) => {
  try {
    const { name, email, password, phone, specialization, qualification,
            experience, fee, availableDays, availableTime, hospital, bio } = req.body;

    // Create user account first
    const user = await User.create({ name, email, password, role: 'doctor', phone });

    // Create doctor profile
    const doctor = await Doctor.create({
      user: user._id,
      specialization, qualification, experience, fee,
      availableDays, availableTime, hospital, bio
    });

    const populatedDoctor = await Doctor.findById(doctor._id).populate('user', 'name email phone');
    res.status(201).json({ message: 'Doctor created.', doctor: populatedDoctor });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @PUT /api/doctors/:id — Update doctor (Admin only)
const updateDoctor = async (req, res) => {
  try {
    const { name, email, phone, specialization, qualification,
            experience, fee, availableDays, availableTime, hospital, bio, isActive } = req.body;

    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found.' });

    // Update user info
    await User.findByIdAndUpdate(doctor.user, { name, email, phone });

    // Update doctor profile
    const updated = await Doctor.findByIdAndUpdate(
      req.params.id,
      { specialization, qualification, experience, fee, availableDays, availableTime, hospital, bio, isActive },
      { new: true }
    ).populate('user', 'name email phone');

    res.json({ message: 'Doctor updated.', doctor: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @DELETE /api/doctors/:id — Delete doctor (Admin only)
const deleteDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found.' });

    await User.findByIdAndDelete(doctor.user);
    await Doctor.findByIdAndDelete(req.params.id);

    res.json({ message: 'Doctor deleted.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAllDoctors, getDoctorById, createDoctor, updateDoctor, deleteDoctor };
