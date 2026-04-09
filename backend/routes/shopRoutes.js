const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'));
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

const {
  getPendingShops,
  getApprovedShops,
  getShopsByStudentId,
  getShopById,
  createShop,
  updateShop,
  approveShop,
  rejectShop,
  deleteShop,
  updateShopRating
} = require('../controllers/shopController');

// Public routes
router.get('/pending', getPendingShops);
router.get('/approved', getApprovedShops);
router.get('/student/:studentId', getShopsByStudentId);
router.get('/:id', getShopById);
router.post('/', upload.single('image'), createShop);
router.put('/:id', updateShop);
router.put('/:id/rating', updateShopRating);

// Admin routes
router.put('/:id/approve', approveShop);
router.put('/:id/reject', rejectShop);
router.delete('/:id', deleteShop);

module.exports = router;