// routes/doctorRoutes.js
const express = require('express');
const router = express.Router();
const { getAllDoctors, getDoctorById, createDoctor, updateDoctor, deleteDoctor } = require('../controllers/doctorController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/',     protect, getAllDoctors);                        // All roles
router.get('/:id',  protect, getDoctorById);                       // All roles
router.post('/',    protect, authorize('admin'), createDoctor);    // Admin only
router.put('/:id',  protect, authorize('admin'), updateDoctor);    // Admin only
router.delete('/:id', protect, authorize('admin'), deleteDoctor);  // Admin only

module.exports = router;
