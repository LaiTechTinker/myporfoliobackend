const express = require('express');
const router = express.Router();
const { login, createAdmin } = require('../controllers/adminController');

// Admin login
router.post('/login', login);

// Create initial admin (one-time setup - remove in production)
router.post('/create-admin', createAdmin);

module.exports = router;
