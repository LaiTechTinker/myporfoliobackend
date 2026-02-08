const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { login, getProfile } = require('../controllers/authController');

// Admin login
router.post('/login', login);

// Get current admin profile (protected)
router.get('/profile', authenticateToken, getProfile);

module.exports = router;
