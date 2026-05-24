const multer = require('multer');
const path = require('path');

const ALLOWED_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
const MAX_FILE_SIZE = (parseInt(process.env.MAX_FILE_SIZE_MB) || 20) * 1024 * 1024;

// Almacenamiento en memoria (Buffer) → se envía a S3/local después de validación
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no permitido. Solo se aceptan PDF, JPEG y PNG.'), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter,
});

module.exports = upload;
