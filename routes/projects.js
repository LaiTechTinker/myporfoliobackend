import express from 'express';
import {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject
} from '../controllers/projectController.js';
import { verifyToken } from '../controllers/adminController.js';
import { uploadFields } from '../config/multer.js';

const router = express.Router();

// Public routes
router.get('/', getProjects);
router.get('/:id', getProject);

// Protected routes (admin only)
router.post('/', verifyToken, uploadFields, createProject);

router.put('/:id', verifyToken, uploadFields, updateProject);

router.delete('/:id', verifyToken, deleteProject);

export default router;
