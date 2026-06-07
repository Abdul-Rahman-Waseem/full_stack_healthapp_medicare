// controllers/appointmentController.js
const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const Notification = require('../models/Notification');

// @GET /api/appointments — Get appointments (role-based)
const getAllAppointments = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'patient') {
      const patient = await Patient.findOne({ user: req.user._id });
      // If no patient profile yet, just return empty list instead of crashing
      if (!patient) return res.json([]);
      query.patient = patient._id;
    }
    // Admin and doctor see all (doctor filter can be added)

    const appointments = await Appointment.find(query)
      .populate({ path: 'patient', populate: { path: 'user', select: 'name email' } })
      .populate({ path: 'doctor',  populate: { path: 'user', select: 'name' } })
      .sort({ appointmentDate: -1 });

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @GET /api/appointments/:id — Get single appointment
const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate({ path: 'patient', populate: { path: 'user', select: 'name email phone' } })
      .populate({ path: 'doctor',  populate: { path: 'user', select: 'name email' } });
    if (!appointment) return res.status(404).json({ message: 'Appointment not found.' });
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @POST /api/appointments — Book appointment (Patient)
const bookAppointment = async (req, res) => {
  try {
    const { doctorId, appointmentDate, appointmentTime, reason, type } = req.body;

    if (!doctorId || !appointmentDate || !appointmentTime || !reason) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    // Get patient profile — auto-create one if it doesn't exist yet
    let patient = await Patient.findOne({ user: req.user._id });
    if (!patient) {
      patient = await Patient.create({ user: req.user._id });
    }

    const appointment = await Appointment.create({
      patient: patient._id,
      doctor: doctorId,
      appointmentDate,
      appointmentTime,
      reason,
      type: type || 'initial'
    });

    // Notify patient
    await Notification.create({
      user: req.user._id,
      title: 'Appointment Booked',
      message: `Your appointment has been booked for ${new Date(appointmentDate).toDateString()} at ${appointmentTime}. Awaiting confirmation.`,
      type: 'appointment'
    });

    res.status(201).json({ message: 'Appointment booked successfully.', appointment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @PUT /api/appointments/:id/status — Approve/Reject appointment (Admin/Doctor)
const updateAppointmentStatus = async (req, res) => {
  try {
    const { status, notes, rejectionReason } = req.body;

    const appointment = await Appointment.findById(req.params.id)
      .populate({ path: 'patient', populate: { path: 'user', select: 'name' } });
    if (!appointment) return res.status(404).json({ message: 'Appointment not found.' });

    appointment.status = status;
    if (notes) appointment.notes = notes;
    if (rejectionReason) appointment.rejectionReason = rejectionReason;
    await appointment.save();

    // Notify patient about status change
    await Notification.create({
      user: appointment.patient.user._id,
      title: `Appointment ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      message: status === 'confirmed'
        ? `Your appointment on ${new Date(appointment.appointmentDate).toDateString()} has been confirmed!`
        : `Your appointment has been ${status}. ${rejectionReason || ''}`,
      type: 'appointment'
    });

    res.json({ message: `Appointment ${status}.`, appointment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @DELETE /api/appointments/:id — Cancel appointment
const deleteAppointment = async (req, res) => {
  try {
    await Appointment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Appointment cancelled.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAllAppointments, getAppointmentById, bookAppointment, updateAppointmentStatus, deleteAppointment };
