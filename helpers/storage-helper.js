const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Make sure the uploads directory exists
const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Configure multer storage to save files to local folder "uploads"
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Save the file with original name or add timestamp to avoid conflicts
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

// File filter to allow only certain file types
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png" ||
    file.mimetype === "application/pdf" ||
    file.mimetype === "text/csv"
  ) {
    cb(null, true);
  } else {
    cb(new Error("Unsupported File Type"), false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 16 * 1024 * 1024, // 16 MB limit
  },
  fileFilter,
});

const getMulterErrorMessage = (errorCode) => {
  const errorMessages = {
    LIMIT_PART_COUNT: "Too many parts",
    LIMIT_FILE_SIZE: "File too large",
    LIMIT_FILE_COUNT: "Too many files",
    LIMIT_FIELD_KEY: "Field name too long",
    LIMIT_FIELD_VALUE: "Field value too long",
    LIMIT_FIELD_COUNT: "Too many fields",
    LIMIT_UNEXPECTED_FILE: "Unexpected or too many fields",
    MISSING_FIELD_NAME: "Field name missing",
  };
  return errorMessages[errorCode];
};

// Middleware to handle file upload with multer
exports.handleFileUpload = (req, res, next) => {
  upload.any()(req, res, (error) => {
    if (error instanceof multer.MulterError) {
      return res.status(400).json({
        message: `Upload failed: ${getMulterErrorMessage(error.code)}`,
        error: error.message,
      });
    } else if (error) {
      return res.status(400).json({
        message: "Unsupported File Type",
        error: error.message,
      });
    }
    next();
  });
};
