import express from 'express';
import { login, createAdmin } from '../controllers/adminController.js';

const router = express.Router();

// Admin login
router.post('/login', login);

// Create initial admin (one-time setup - remove in production)
router.post('/create-admin', createAdmin);

export default router;
