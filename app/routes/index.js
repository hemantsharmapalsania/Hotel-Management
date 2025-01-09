const express = require('express');
const authRoutes = require('./authRoutes');
const adminRoutes = require('./adminRoutes');

const router = express.Router();

// Register all routes here
router.use('/v1/auth', authRoutes);
router.use('/v2/admin', adminRoutes);

module.exports = router;