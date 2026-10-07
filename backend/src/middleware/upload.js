const multer = require('multer');

// Very simple student-level configuration
const storage = multer.diskStorage({
  // 1. Where to save the file
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Saves directly to the "uploads" folder
  },
  // 2. What to name the file
  filename: function (req, file, cb) {
    // Just add the current date/time to the original name to avoid overwriting
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

module.exports = upload;
