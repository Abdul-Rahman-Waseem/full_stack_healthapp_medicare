// routes/treatmentRoutes.js
const express = require('express');
const router = express.Router();
const { getAllTreatments, getTreatmentById, createTreatment, updateTreatment, addCheckup, addFollowUp } = require('../controllers/treatmentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/',                    protect, getAllTreatments);
router.get('/:id',                 protect, getTreatmentById);
router.post('/',                   protect, authorize('admin', 'doctor'), createTreatment);
router.put('/:id',                 protect, authorize('admin', 'doctor'), updateTreatment);
router.post('/:id/checkup',        protect, authorize('admin', 'doctor'), addCheckup);
router.post('/:id/followup',       protect, authorize('admin', 'doctor'), addFollowUp);

module.exports = router;
