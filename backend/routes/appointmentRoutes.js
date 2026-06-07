// routes/appointmentRoutes.js
const express = require('express');
const router = express.Router();
const { getAllAppointments, getAppointmentById, bookAppointment, updateAppointmentStatus, deleteAppointment } = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/',            protect, getAllAppointments);
router.get('/:id',         protect, getAppointmentById);
router.post('/',           protect, authorize('patient'), bookAppointment);
router.put('/:id/status',  protect, authorize('admin', 'doctor'), updateAppointmentStatus);
router.delete('/:id',      protect, deleteAppointment);

module.exports = router;
