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
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

const {
  getPendingItems,
  getApprovedItems,
  getItemsByStudentId,
  getItemById,
  createItem,
  updateItem,
  updatePromotionPrice,
  approveItem,
  rejectItem,
  deleteItem,
  incrementItemViews,
  incrementItemLikes
} = require('../controllers/itemController');

// Public routes
router.get('/pending', getPendingItems);
router.get('/approved', getApprovedItems);
router.get('/student/:studentId', getItemsByStudentId);
router.get('/:id', getItemById);
router.post('/', upload.single('image'), createItem);
router.put('/:id', updateItem);
router.put('/:id/views', incrementItemViews);
router.put('/:id/likes', incrementItemLikes);
router.put('/:id/promotion', updatePromotionPrice);

// Admin routes
router.put('/:id/approve', approveItem);
router.put('/:id/reject', rejectItem);
router.delete('/:id', deleteItem);

module.exports = router;