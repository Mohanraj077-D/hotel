const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');

// POST /api/uploads
router.post('/', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  // Generate URL for the uploaded file
  const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

  res.status(201).json({
    message: 'File uploaded successfully',
    file: {
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype,
      url: fileUrl
    }
  });
});

// POST /api/uploads/multiple
router.post('/multiple', upload.array('files', 10), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: 'No files uploaded' });
  }

  const fileUrls = req.files.map(file => ({
    filename: file.filename,
    size: file.size,
    mimetype: file.mimetype,
    url: `${req.protocol}://${req.get('host')}/uploads/${file.filename}`
  }));

  res.status(201).json({
    message: 'Files uploaded successfully',
    files: fileUrls
  });
});

module.exports = router;
