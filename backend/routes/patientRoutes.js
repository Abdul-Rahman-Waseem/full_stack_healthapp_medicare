// routes/patientRoutes.js
const express = require('express');
const router = express.Router();
const { getAllPatients, getPatientById, getMyProfile, createPatient, updatePatient, deletePatient } = require('../controllers/patientController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/',      protect, authorize('admin', 'doctor'), getAllPatients);
router.get('/me',    protect, authorize('patient'), getMyProfile);
router.get('/:id',   protect, getPatientById);
router.post('/',     protect, authorize('admin'), createPatient);
router.put('/:id',   protect, authorize('admin', 'doctor'), updatePatient);
router.delete('/:id',protect, authorize('admin'), deletePatient);

module.exports = router;
