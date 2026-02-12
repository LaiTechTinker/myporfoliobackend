import Project from "../models/Project.js";
import { v2 as cloudinary } from "cloudinary";

// ================= GET ALL PROJECTS =================
export const getProjects = async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ================= GET SINGLE PROJECT =================
export const getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ================= CREATE PROJECT =================
export const createProject = async (req, res) => {
  try {
    const { title, description, techStack, githubLink, liveDemoLink } = req.body;

    const imageUrl = req.files?.image?.[0]?.cloudinaryUrl || null;
    const videoUrl = req.files?.video?.[0]?.cloudinaryUrl || null;

    const project = new Project({
      title,
      description,
      techStack: techStack ? techStack.split(",").map((tech) => tech.trim()) : [],
      githubLink,
      liveDemoLink,
      image: imageUrl,
      video: videoUrl,
    });

    const savedProject = await project.save();
    res.status(201).json(savedProject);
  } catch (error) {
    res.status(400).json({ message: "Validation error", error: error.message });
  }
};

// ================= UPDATE PROJECT =================
export const updateProject = async (req, res) => {
  try {
    const { title, description, techStack, githubLink, liveDemoLink } = req.body;

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // If new files uploaded, delete old ones from Cloudinary
    if (req.files?.image && project.imagePublicId) {
      await cloudinary.uploader.destroy(project.imagePublicId, {
        resource_type: "image",
      });
    }

    if (req.files?.video && project.videoPublicId) {
      await cloudinary.uploader.destroy(project.videoPublicId, {
        resource_type: "video",
      });
    }

    // Update fields
    project.title = title ?? project.title;
    project.description = description ?? project.description;
    project.techStack = techStack
      ? techStack.split(",").map((tech) => tech.trim())
      : project.techStack;
    project.githubLink = githubLink ?? project.githubLink;
    project.liveDemoLink = liveDemoLink ?? project.liveDemoLink;

    // Update media if provided
    if (req.files?.image) {
      project.image = req.files.image[0].cloudinaryUrl;
      project.imagePublicId = req.files.image[0].publicId;
    }

    if (req.files?.video) {
      project.video = req.files.video[0].cloudinaryUrl;
      project.videoPublicId = req.files.video[0].publicId;
    }

    const updatedProject = await project.save();

    res.json(updatedProject);
  } catch (error) {
    res.status(400).json({ message: "Validation error", error: error.message });
  }
};

// ================= DELETE PROJECT =================
export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Delete media from Cloudinary
    if (project.imagePublicId) {
      await cloudinary.uploader.destroy(project.imagePublicId, {
        resource_type: "image",
      });
    }

    if (project.videoPublicId) {
      await cloudinary.uploader.destroy(project.videoPublicId, {
        resource_type: "video",
      });
    }

    await project.deleteOne();

    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
