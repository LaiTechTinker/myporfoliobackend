import express from 'express';
import {
  getContacts,
  createContact,
  deleteContact
} from '../controllers/contactController.js';
import { verifyToken } from '../controllers/adminController.js';

const router = express.Router();

// Public route
router.post('/', createContact);

// Protected routes (admin only)
router.get('/', verifyToken, getContacts);
router.delete('/:id', verifyToken, deleteContact);

export default router;
