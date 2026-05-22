const fs = require('fs');
const multer = require('multer');
const path = require('path');

const uploadPath = path.join(__dirname, '..', 'uploads');

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname);
    const fileName = `${Date.now()}-${Math.round(Math.random() * 1000)}${extension}`;
    cb(null, fileName);
  },
});

const fileFilter = (req, file, cb) => {
  const validFieldName =
    /^documents\.\d+\.file$/.test(file.fieldname) ||
    /^documents\[\d+\]\[file\]$/.test(file.fieldname);

  if (!validFieldName) {
    cb(new Error('Invalid file field name'));
    return;
  }

  const allowedTypes = /jpg|jpeg|png|pdf/;
  const extension = path.extname(file.originalname).toLowerCase().replace('.', '');
  const mimeType = file.mimetype.toLowerCase();
  const isValidExtension = allowedTypes.test(extension);
  const isValidMimeType =
    mimeType === 'image/jpeg' ||
    mimeType === 'image/png' ||
    mimeType === 'application/pdf';

  if (isValidExtension && isValidMimeType) {
    cb(null, true);
    return;
  }

  cb(new Error('Only JPG, JPEG, PNG, and PDF files are allowed'));
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    files: 10,
  },
});

const uploadDocuments = (req, res, next) => {
  upload.any()(req, res, (error) => {
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message || 'File upload failed',
      });
    }

    next();
  });
};

module.exports = uploadDocuments;
