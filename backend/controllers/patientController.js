// controllers/patientController.js
const Patient = require('../models/Patient');
const User = require('../models/User');

// @GET /api/patients — Get all patients (Admin/Doctor)
const getAllPatients = async (req, res) => {
  try {
    const patients = await Patient.find()
      .populate('user', 'name email phone')
      .populate('assignedDoctor');
    res.json(patients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @GET /api/patients/:id — Get single patient
const getPatientById = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate({ path: 'assignedDoctor', populate: { path: 'user', select: 'name email' } });
    if (!patient) return res.status(404).json({ message: 'Patient not found.' });
    res.json(patient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @GET /api/patients/me — Get my patient profile
const getMyProfile = async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.user._id })
      .populate('user', 'name email phone')
      .populate({ path: 'assignedDoctor', populate: { path: 'user', select: 'name' } });
    if (!patient) return res.status(404).json({ message: 'Patient profile not found.' });
    res.json(patient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @POST /api/patients — Create patient (Admin or self-register)
const createPatient = async (req, res) => {
  try {
    const { name, email, password, phone, dateOfBirth, gender, bloodGroup,
            address, emergencyContact, medicalHistory, allergies } = req.body;

    // Create user account
    const user = await User.create({ name, email, password, role: 'patient', phone });

    // Create patient profile
    const patient = await Patient.create({
      user: user._id,
      dateOfBirth, gender, bloodGroup, address, emergencyContact,
      medicalHistory, allergies
    });

    const populated = await Patient.findById(patient._id).populate('user', 'name email phone');
    res.status(201).json({ message: 'Patient created.', patient: populated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @PUT /api/patients/:id — Update patient
const updatePatient = async (req, res) => {
  try {
    const { name, email, phone, dateOfBirth, gender, bloodGroup,
            address, emergencyContact, assignedDoctor, medicalHistory, allergies } = req.body;

    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ message: 'Patient not found.' });

    // Update user info
    await User.findByIdAndUpdate(patient.user, { name, email, phone });

    // Update patient profile
    const updated = await Patient.findByIdAndUpdate(
      req.params.id,
      { dateOfBirth, gender, bloodGroup, address, emergencyContact, assignedDoctor, medicalHistory, allergies },
      { new: true }
    ).populate('user', 'name email phone');

    res.json({ message: 'Patient updated.', patient: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @DELETE /api/patients/:id — Delete patient (Admin only)
const deletePatient = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ message: 'Patient not found.' });

    await User.findByIdAndDelete(patient.user);
    await Patient.findByIdAndDelete(req.params.id);

    res.json({ message: 'Patient deleted.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAllPatients, getPatientById, getMyProfile, createPatient, updatePatient, deletePatient };
