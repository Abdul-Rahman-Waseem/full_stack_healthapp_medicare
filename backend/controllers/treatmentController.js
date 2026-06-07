// controllers/treatmentController.js
const Treatment = require('../models/Treatment');
const Notification = require('../models/Notification');
const Patient = require('../models/Patient');

// @GET /api/treatments — Get treatments
const getAllTreatments = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'patient') {
      const patient = await Patient.findOne({ user: req.user._id });
      if (patient) query.patient = patient._id;
    }

    const treatments = await Treatment.find(query)
      .populate({ path: 'patient', populate: { path: 'user', select: 'name email' } })
      .populate({ path: 'doctor',  populate: { path: 'user', select: 'name' } })
      .populate('appointment')
      .sort({ startDate: -1 });

    res.json(treatments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @GET /api/treatments/:id — Get single treatment
const getTreatmentById = async (req, res) => {
  try {
    const treatment = await Treatment.findById(req.params.id)
      .populate({ path: 'patient', populate: { path: 'user', select: 'name email' } })
      .populate({ path: 'doctor',  populate: { path: 'user', select: 'name' } })
      .populate('appointment');
    if (!treatment) return res.status(404).json({ message: 'Treatment not found.' });
    res.json(treatment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @POST /api/treatments — Start a treatment (Doctor/Admin)
const createTreatment = async (req, res) => {
  try {
    const { appointmentId, patientId, doctorId, diagnosis, treatmentPlan } = req.body;

    if (!appointmentId || !patientId || !doctorId || !diagnosis) {
      return res.status(400).json({ message: 'Appointment, patient, doctor, and diagnosis are required.' });
    }

    const treatment = await Treatment.create({
      appointment: appointmentId,
      patient: patientId,
      doctor: doctorId,
      diagnosis,
      treatmentPlan
    });

    res.status(201).json({ message: 'Treatment started.', treatment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @PUT /api/treatments/:id — Update treatment status/plan
const updateTreatment = async (req, res) => {
  try {
    const { diagnosis, treatmentPlan, status, endDate } = req.body;
    const treatment = await Treatment.findByIdAndUpdate(
      req.params.id,
      { diagnosis, treatmentPlan, status, endDate },
      { new: true }
    );
    if (!treatment) return res.status(404).json({ message: 'Treatment not found.' });
    res.json({ message: 'Treatment updated.', treatment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @POST /api/treatments/:id/checkup — Add physical checkup record
const addCheckup = async (req, res) => {
  try {
    const { bloodPressure, heartRate, temperature, weight, notes } = req.body;

    const treatment = await Treatment.findById(req.params.id)
      .populate({ path: 'patient', populate: { path: 'user', select: 'name _id' } });
    if (!treatment) return res.status(404).json({ message: 'Treatment not found.' });

    treatment.checkups.push({ bloodPressure, heartRate, temperature, weight, notes });
    await treatment.save();

    res.json({ message: 'Checkup recorded.', treatment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @POST /api/treatments/:id/followup — Schedule follow-up visit
const addFollowUp = async (req, res) => {
  try {
    const { scheduledDate, notes } = req.body;

    const treatment = await Treatment.findById(req.params.id)
      .populate({ path: 'patient', populate: { path: 'user', select: '_id name' } });
    if (!treatment) return res.status(404).json({ message: 'Treatment not found.' });

    treatment.followUps.push({ scheduledDate, notes });
    await treatment.save();

    // Notify patient
    await Notification.create({
      user: treatment.patient.user._id,
      title: 'Follow-up Visit Scheduled',
      message: `Your follow-up visit is scheduled for ${new Date(scheduledDate).toDateString()}.`,
      type: 'followup'
    });

    res.json({ message: 'Follow-up scheduled.', treatment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAllTreatments, getTreatmentById, createTreatment, updateTreatment, addCheckup, addFollowUp };
