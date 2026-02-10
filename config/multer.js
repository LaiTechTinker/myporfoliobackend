import multer from 'multer';
import path from 'path';
import { put } from '@vercel/blob';

// Custom storage for Vercel Blob
const storage = multer.memoryStorage();

// File filter
const fileFilter = (req, file, cb) => {
  const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
  const allowedVideoTypes = /mp4|webm|ogg/;
  const allowedAudioTypes = /mp3|wav|ogg/;

  const extname = allowedImageTypes.test(path.extname(file.originalname).toLowerCase()) ||
                  allowedVideoTypes.test(path.extname(file.originalname).toLowerCase()) ||
                  allowedAudioTypes.test(path.extname(file.originalname).toLowerCase());

  const mimetype = allowedImageTypes.test(file.mimetype) ||
                   allowedVideoTypes.test(file.mimetype) ||
                   allowedAudioTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images, videos, and audio files are allowed.'));
  }
};

// Upload configuration
const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB default
  },
  fileFilter: fileFilter
});

// Middleware to upload to Vercel Blob
const uploadToBlob = async (req, res, next) => {
  if (req.files) {
    for (const field in req.files) {
      const file = req.files[field][0];
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const filename = file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname);
      
      try {
        const blob = await put(filename, file.buffer, {
          access: 'public',
        });
        file.blobUrl = blob.url;
      } catch (error) {
        return next(error);
      }
    }
  }
  next();
};

// Export upload middleware for different fields
const uploadFields = [
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'video', maxCount: 1 }
  ]),
  uploadToBlob
];

export {
  upload,
  uploadFields
};
