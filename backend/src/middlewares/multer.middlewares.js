import multer from "multer";
import path from "path";

const imagePath = path.join(process.cwd(), "public", "uploads");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, imagePath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});

const fileFilter = (req, res, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only .jpg, .png, or .pdf files are allowed"));
  }
};

export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2 MB
  },
});
