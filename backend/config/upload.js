const multer = require('multer');
const path = require('path');
const { uploadBuffer } = require('../utils/storage');

// Multer keeps the file in memory only. The shared storage adapter then writes
// it to the configured provider (Cloudinary in production, local disk in dev),
// so uploaded images survive Render restarts instead of living in its ephemeral
// filesystem.
const memoryUpload = ({ fileFilter, limits }) => multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits
});

const imageFileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp/;
  if (allowed.test(path.extname(file.originalname).toLowerCase()) && allowed.test(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const documentFileFilter = (req, file, cb) => {
  const allowedExt = /jpeg|jpg|png|gif|webp|pdf|doc|docx|ppt|pptx|xls|xlsx|txt|zip|rar/;
  const allowedMime = /image\/|application\/pdf|application\/msword|application\/vnd\.|text\/plain|application\/zip|application\/x-|application\/octet-stream/;
  if (allowedExt.test(path.extname(file.originalname).toLowerCase()) && allowedMime.test(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only documents or images are allowed'), false);
  }
};

const uploadNews = memoryUpload({
  fileFilter: imageFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

const uploadGallery = memoryUpload({
  fileFilter: imageFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

const uploadProfile = memoryUpload({
  fileFilter: imageFileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }
});

const uploadAssignment = memoryUpload({
  fileFilter: documentFileFilter,
  limits: { fileSize: 20 * 1024 * 1024 }
});

const uploadSubmission = memoryUpload({
  fileFilter: documentFileFilter,
  limits: { fileSize: 20 * 1024 * 1024 }
});

// Returns the stored URL alongside the provider key in case a caller later
// needs to remove the asset from Cloudinary.
const storeUploadedFile = async (file, folder, baseUrl) => {
  if (!file) return null;
  return uploadBuffer({
    buffer: file.buffer,
    filename: file.originalname,
    mime: file.mimetype,
    folder,
    baseUrl
  });
};

module.exports = {
  uploadNews,
  uploadGallery,
  uploadProfile,
  uploadAssignment,
  uploadSubmission,
  storeUploadedFile
};
