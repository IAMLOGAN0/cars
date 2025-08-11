const multer = require('multer');
const path = require('path');

// Allowed file extensions
const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif'];

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // make sure uploads/ exists
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`;
    cb(null, uniqueName);
  }
});

// File filter for type validation
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!allowedExtensions.includes(ext)) {
    return cb(new Error(`Invalid file type: ${ext}. Allowed types: ${allowedExtensions.join(', ')}`));
  }
  cb(null, true);
};

// Multer instance
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // max 5 MB
  }
});

// Fields config for your case
const uploadFields = upload.fields([
  { name: 'thumb_Resized_image', maxCount: 1 },
  { name: 'galleryImages', maxCount: 10 }
]);

module.exports = { uploadFields };
