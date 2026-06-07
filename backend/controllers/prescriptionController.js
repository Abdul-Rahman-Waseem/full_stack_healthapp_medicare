// controllers/prescriptionController.js
const Prescription = require('../models/Prescription');
const Patient = require('../models/Patient');
const Notification = require('../models/Notification');

// @GET /api/prescriptions — Get prescriptions
const getAllPrescriptions = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'patient') {
      const patient = await Patient.findOne({ user: req.user._id });
      if (patient) query.patient = patient._id;
    }

    const prescriptions = await Prescription.find(query)
      .populate({ path: 'patient', populate: { path: 'user', select: 'name email' } })
      .populate({ path: 'doctor',  populate: { path: 'user', select: 'name' } })
      .populate('appointment')
      .sort({ createdAt: -1 });

    res.json(prescriptions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @GET /api/prescriptions/:id — Get single prescription
const getPrescriptionById = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate({ path: 'patient', populate: { path: 'user', select: 'name email' } })
      .populate({ path: 'doctor',  populate: { path: 'user', select: 'name' } });
    if (!prescription) return res.status(404).json({ message: 'Prescription not found.' });
    res.json(prescription);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @POST /api/prescriptions — Create prescription (Doctor/Admin)
const createPrescription = async (req, res) => {
  try {
    const { appointmentId, patientId, doctorId, medications, notes, validUntil } = req.body;

    if (!appointmentId || !patientId || !doctorId || !medications?.length) {
      return res.status(400).json({ message: 'Required fields missing.' });
    }

    const prescription = await Prescription.create({
      appointment: appointmentId,
      patient: patientId,
      doctor: doctorId,
      medications,
      notes,
      validUntil
    });

    // Get patient's user ID to send notification
    const patient = await Patient.findById(patientId).populate('user', '_id');
    if (patient) {
      await Notification.create({
        user: patient.user._id,
        title: 'New Prescription Added',
        message: `A prescription with ${medications.length} medication(s) has been added by your doctor.`,
        type: 'medication'
      });
    }

    res.status(201).json({ message: 'Prescription created.', prescription });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @PUT /api/prescriptions/:id — Update prescription
const updatePrescription = async (req, res) => {
  try {
    const { medications, notes, validUntil } = req.body;
    const prescription = await Prescription.findByIdAndUpdate(
      req.params.id,
      { medications, notes, validUntil },
      { new: true }
    );
    if (!prescription) return res.status(404).json({ message: 'Prescription not found.' });
    res.json({ message: 'Prescription updated.', prescription });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @DELETE /api/prescriptions/:id — Delete prescription
const deletePrescription = async (req, res) => {
  try {
    await Prescription.findByIdAndDelete(req.params.id);
    res.json({ message: 'Prescription deleted.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAllPrescriptions, getPrescriptionById, createPrescription, updatePrescription, deletePrescription };
