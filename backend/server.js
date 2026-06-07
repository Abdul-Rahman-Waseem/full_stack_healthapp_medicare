// server.js - Main entry point for the backend
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const cron = require('node-cron');

dotenv.config();

const app = express();

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth',         require('./routes/authRoutes'));
app.use('/api/doctors',      require('./routes/doctorRoutes'));
app.use('/api/patients',     require('./routes/patientRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));
app.use('/api/treatments',   require('./routes/treatmentRoutes'));
app.use('/api/prescriptions',require('./routes/prescriptionRoutes'));
app.use('/api/notifications',require('./routes/notificationRoutes'));

// ─── Root check ───────────────────────────────────────────────────────────────
app.get('/', (req, res) => res.json({ message: 'Healthcare API Running ✓' }));

// ─── Connect MongoDB & Start Server ───────────────────────────────────────────
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✓ MongoDB Connected');
    app.listen(process.env.PORT, () =>
      console.log(`✓ Server running on port ${process.env.PORT}`)
    );

    // Run medication reminder cron job every hour
    cron.schedule('0 * * * *', async () => {
      const { sendMedicationReminders } = require('./controllers/notificationController');
      await sendMedicationReminders();
    });
  })
  .catch(err => {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  });
