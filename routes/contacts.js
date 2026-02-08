const express = require('express');
const router = express.Router();
const {
  getContacts,
  createContact,
  deleteContact
} = require('../controllers/contactController');
const { verifyToken } = require('../controllers/adminController');

// Public route
router.post('/', createContact);

// Protected routes (admin only)
router.get('/', verifyToken, getContacts);
router.delete('/:id', verifyToken, deleteContact);

module.exports = router;
