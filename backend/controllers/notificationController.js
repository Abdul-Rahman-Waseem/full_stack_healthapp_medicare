// controllers/notificationController.js
const Notification = require('../models/Notification');
const nodemailer = require('nodemailer');

// Email transporter setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Helper: Send email
const sendEmail = async (to, subject, text) => {
  try {
    await transporter.sendMail({ from: process.env.EMAIL_USER, to, subject, text });
    console.log(`Email sent to ${to}`);
  } catch (err) {
    console.error('Email error:', err.message);
  }
};

// @GET /api/notifications — Get my notifications
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @PUT /api/notifications/:id/read — Mark as read
const markAsRead = async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ message: 'Notification marked as read.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @PUT /api/notifications/read-all — Mark all as read
const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user._id }, { isRead: true });
    res.json({ message: 'All notifications marked as read.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @DELETE /api/notifications/:id — Delete notification
const deleteNotification = async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.json({ message: 'Notification deleted.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cron job: send medication reminders (called by cron in server.js)
const sendMedicationReminders = async () => {
  try {
    const Prescription = require('../models/Prescription');
    const User = require('../models/User');
    const Patient = require('../models/Patient');

    const now = new Date();
    const prescriptions = await Prescription.find({ validUntil: { $gte: now } })
      .populate({ path: 'patient', populate: { path: 'user', select: 'name email' } });

    for (const pres of prescriptions) {
      if (!pres.patient?.user) continue;

      // Create in-app notification
      await Notification.create({
        user: pres.patient.user._id,
        title: 'Medication Reminder',
        message: `Please take your medications as prescribed. You have ${pres.medications.length} active medication(s).`,
        type: 'medication'
      });

      // Send email
      await sendEmail(
        pres.patient.user.email,
        'Medication Reminder – Healthcare System',
        `Dear ${pres.patient.user.name},\n\nThis is a reminder to take your prescribed medications.\n\nStay healthy!`
      );
    }

    console.log('Medication reminders sent.');
  } catch (err) {
    console.error('Reminder error:', err.message);
  }
};

module.exports = { getNotifications, markAsRead, markAllAsRead, deleteNotification, sendMedicationReminders };
