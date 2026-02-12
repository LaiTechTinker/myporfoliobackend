import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";

// ================= CLOUDINARY CONFIG =================
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// ================= MULTER MEMORY STORAGE =================
const storage = multer.memoryStorage();

// ================= FILE FILTER =================
const fileFilter = (req, file, cb) => {
  const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
  const allowedVideoTypes = /mp4|webm|ogg/;
  const allowedAudioTypes = /mp3|wav|ogg/;

  const extname =
    allowedImageTypes.test(file.originalname.toLowerCase()) ||
    allowedVideoTypes.test(file.originalname.toLowerCase()) ||
    allowedAudioTypes.test(file.originalname.toLowerCase());

  const mimetype =
    allowedImageTypes.test(file.mimetype) ||
    allowedVideoTypes.test(file.mimetype) ||
    allowedAudioTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only images, videos, and audio files are allowed."));
  }
};

// ================= MULTER INSTANCE =================
const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB default
  },
  fileFilter,
});

// ================= STREAM UPLOAD TO CLOUDINARY =================
const uploadBufferToCloudinary = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "auto", // auto-detect image/video/audio
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    streamifier.createReadStream(buffer).pipe(stream);
  });
};

// ================= MIDDLEWARE TO HANDLE MULTI-FIELD UPLOAD =================
const uploadToCloudinary = async (req, res, next) => {
  try {
    if (!req.files) return next();

    for (const field in req.files) {
      const file = req.files[field][0];

      const result = await uploadBufferToCloudinary(file.buffer, "uploads");

      // Attach Cloudinary data to request file object
      file.cloudinaryUrl = result.secure_url;
      file.publicId = result.public_id;
      file.resourceType = result.resource_type;
    }

    next();
  } catch (error) {
    next(error);
  }
};

// ================= EXPORT READY-TO-USE FIELD CONFIG =================
const uploadFields = [
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "video", maxCount: 1 },
    { name: "audio", maxCount: 1 },
  ]),
  uploadToCloudinary,
];

export { upload, uploadFields };
