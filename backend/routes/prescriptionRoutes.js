// routes/prescriptionRoutes.js
const express = require('express');
const router = express.Router();
const { getAllPrescriptions, getPrescriptionById, createPrescription, updatePrescription, deletePrescription } = require('../controllers/prescriptionController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/',      protect, getAllPrescriptions);
router.get('/:id',   protect, getPrescriptionById);
router.post('/',     protect, authorize('admin', 'doctor'), createPrescription);
router.put('/:id',   protect, authorize('admin', 'doctor'), updatePrescription);
router.delete('/:id',protect, authorize('admin', 'doctor'), deletePrescription);

module.exports = router;
