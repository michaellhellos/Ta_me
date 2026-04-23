const multer = require("multer");
const path = require("path");
const crypto = require("crypto");
const fs = require("fs");

/* =========================
   ALLOWED TYPES & LIMITS
========================= */

const ALLOWED_IMAGE_TYPES = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp"
];

const ALLOWED_FILE_TYPES = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
    "application/zip"
];

const ALL_ALLOWED = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_FILE_TYPES];

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;  // 5 MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;  // 10 MB

/* =========================
   UPLOAD DIRECTORY
========================= */

const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

/* =========================
   MULTER STORAGE
========================= */

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, uploadDir);
    },
    filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const uniqueName = crypto.randomUUID() + ext;
        cb(null, uniqueName);
    }
});

/* =========================
   FILE FILTER
========================= */

const fileFilter = (_req, file, cb) => {
    if (ALL_ALLOWED.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`Tipe file tidak didukung: ${file.mimetype}`), false);
    }
};

/* =========================
   MULTER INSTANCES
========================= */

const uploadImage = multer({
    storage,
    fileFilter: (_req, file, cb) => {
        if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Hanya file gambar (JPEG, PNG, GIF, WebP) yang diizinkan"), false);
        }
    },
    limits: { fileSize: MAX_IMAGE_SIZE }
}).single("image");

const uploadFile = multer({
    storage,
    fileFilter,
    limits: { fileSize: MAX_FILE_SIZE }
}).single("file");

/* =========================
   ERROR HANDLER WRAPPER
========================= */

function handleUpload(uploaderFn) {
    return (req, res, next) => {
        uploaderFn(req, res, (err) => {
            if (err instanceof multer.MulterError) {
                if (err.code === "LIMIT_FILE_SIZE") {
                    return res.status(400).json({ message: "Ukuran file terlalu besar" });
                }
                return res.status(400).json({ message: `Upload error: ${err.message}` });
            }
            if (err) {
                return res.status(400).json({ message: err.message });
            }
            next();
        });
    };
}

module.exports = {
    uploadImage: handleUpload(uploadImage),
    uploadFile: handleUpload(uploadFile),
    ALLOWED_IMAGE_TYPES,
    ALLOWED_FILE_TYPES
};
