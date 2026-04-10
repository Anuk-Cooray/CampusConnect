const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const LectureMaterial = require('../models/LectureMaterial');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

const router = express.Router();

// Ensure uploads/lectures directory exists
const uploadDir = path.join(__dirname, '..', 'uploads', 'lectures');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer config for PDF uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'), false);
  }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB max

// POST /api/lecture-materials — Admin upload
router.post('/', authMiddleware, adminMiddleware, upload.single('file'), async (req, res) => {
  try {
    const { title, subject, description } = req.body;

    if (!title || !subject) {
      return res.status(400).json({ message: 'Title and subject are required' });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'PDF file is required' });
    }

    const material = await LectureMaterial.create({
      title,
      subject,
      description,
      filePath: `uploads/lectures/${req.file.filename}`,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      uploadedBy: req.user.id,
    });

    return res.status(201).json(material);
  } catch (err) {
    console.error('Upload material error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/lecture-materials/:id/download — Download PDF (MUST come before GET /:id)
router.get('/:id/download', authMiddleware, async (req, res) => {
  try {
    const material = await LectureMaterial.findById(req.params.id);
    if (!material) return res.status(404).json({ message: 'Material not found' });

    const filePath = path.join(__dirname, '..', material.filePath);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found on server' });
    }

    res.download(filePath, material.fileName);
  } catch (err) {
    console.error('Download material error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/lecture-materials — List all (any authenticated user)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const materials = await LectureMaterial.find()
      .populate('uploadedBy', 'name')
      .sort({ createdAt: -1 });
    return res.json(materials);
  } catch (err) {
    console.error('Get materials error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/lecture-materials/:id — Admin update
router.put('/:id', authMiddleware, adminMiddleware, upload.single('file'), async (req, res) => {
  try {
    const material = await LectureMaterial.findById(req.params.id);
    if (!material) return res.status(404).json({ message: 'Material not found' });

    const { title, subject, description } = req.body;
    if (title) material.title = title;
    if (subject) material.subject = subject;
    if (description) material.description = description;

    // If a new file is uploaded, delete the old one and update path
    if (req.file) {
      const oldFilePath = path.join(__dirname, '..', material.filePath);
      if (fs.existsSync(oldFilePath)) fs.unlinkSync(oldFilePath);
      material.filePath = `uploads/lectures/${req.file.filename}`;
      material.fileName = req.file.originalname;
      material.fileSize = req.file.size;
    }

    await material.save();
    return res.json(material);
  } catch (err) {
    console.error('Update material error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/lecture-materials/:id — Admin delete
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const material = await LectureMaterial.findById(req.params.id);
    if (!material) return res.status(404).json({ message: 'Material not found' });

    // Delete the file from disk
    const filePath = path.join(__dirname, '..', material.filePath);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await material.deleteOne();
    return res.json({ message: 'Material deleted' });
  } catch (err) {
    console.error('Delete material error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
