const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDirectory = path.join(__dirname, "../../uploads");

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, { recursive: true });
}

const allowedMimeTypes = [
  // Images
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",

  // Videos
  "video/mp4",
  "video/webm",
  "video/quicktime",

  // Documents
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
  "text/csv",

  // Audio
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/ogg",
  "audio/mp4",
];

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, uploadDirectory);
  },

  filename: (req, file, callback) => {
    const extension = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}${extension}`;

    callback(null, uniqueName);
  },
});

const fileFilter = (req, file, callback) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    return callback(null, true);
  }

  callback(
    new Error(
      "Unsupported file type. Upload an image, video, document, or audio file."
    )
  );
};

const messageUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 10,
  },
});

module.exports = messageUpload;