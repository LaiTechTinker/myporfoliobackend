import Project from '../models/Project.js';
import { put } from '@vercel/blob';

// Get all projects
export const getProjects = async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get single project
export const getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create project
export const createProject = async (req, res) => {
  try {
    const { title, description, techStack, githubLink, liveDemoLink } = req.body;

    let imageUrl = null;
    let videoUrl = null;

    // Handle file uploads to Vercel Blob
    if (req.files?.image) {
      const imageFile = req.files.image[0];
      const blob = await put(`projects/${Date.now()}-${imageFile.originalname}`, imageFile.buffer, {
        access: 'public',
        contentType: imageFile.mimetype
      });
      imageUrl = blob.url;
    }

    if (req.files?.video) {
      const videoFile = req.files.video[0];
      const blob = await put(`projects/${Date.now()}-${videoFile.originalname}`, videoFile.buffer, {
        access: 'public',
        contentType: videoFile.mimetype
      });
      videoUrl = blob.url;
    }

    const project = new Project({
      title,
      description,
      techStack: techStack ? techStack.split(',').map(tech => tech.trim()) : [],
      githubLink,
      liveDemoLink,
      image: imageUrl,
      video: videoUrl
    });

    const savedProject = await project.save();
    res.status(201).json(savedProject);
  } catch (error) {
    res.status(400).json({ message: 'Validation error', error: error.message });
  }
};

// Update project
export const updateProject = async (req, res) => {
  try {
    const { title, description, techStack, githubLink, liveDemoLink } = req.body;

    // Handle file uploads
    const updateData = {
      title,
      description,
      techStack: techStack ? techStack.split(',').map(tech => tech.trim()) : [],
      githubLink,
      liveDemoLink
    };

    if (req.files?.image) {
      updateData.image = `/uploads/${req.files.image[0].filename}`;
    }

    if (req.files?.video) {
      updateData.video = `/uploads/${req.files.video[0].filename}`;
    }

    const project = await Project.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    res.status(400).json({ message: 'Validation error', error: error.message });
  }
};

// Delete project
export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
