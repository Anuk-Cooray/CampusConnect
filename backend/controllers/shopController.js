const Shop = require('../models/Shop');
const path = require('path');
const fs = require('fs');

// Get all pending shops
const getPendingShops = async (req, res) => {
  try {
    const shops = await Shop.find({ status: 'pending' }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: shops });
  } catch (error) {
    console.error('Error fetching pending shops:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all approved shops
const getApprovedShops = async (req, res) => {
  try {
    const shops = await Shop.find({ status: 'approved' }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: shops });
  } catch (error) {
    console.error('Error fetching approved shops:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get shops by student ID (NEW)
const getShopsByStudentId = async (req, res) => {
  try {
    const { studentId } = req.params;
    const shops = await Shop.find({ studentId: studentId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: shops });
  } catch (error) {
    console.error('Error fetching shops by student ID:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single shop by ID
const getShopById = async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id);
    if (!shop) {
      return res.status(404).json({ success: false, message: 'Shop not found' });
    }
    res.status(200).json({ success: true, data: shop });
  } catch (error) {
    console.error('Error fetching shop by ID:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create new shop request (FIXED VERSION)
const createShop = async (req, res) => {
  try {
    // Extract fields from req.body (multer populates this for non-file fields)
    const {
      shopName,
      owner,
      services,
      description,
      contactEmail,
      phone,
      studentId,
      nic,
      location,
      priceRange,
      availability
    } = req.body;
    
    // Validate required fields
    if (!shopName || !shopName.trim()) {
      return res.status(400).json({ success: false, message: 'Shop name is required' });
    }
    if (!owner || !owner.trim()) {
      return res.status(400).json({ success: false, message: 'Owner name is required' });
    }
    if (!description || !description.trim()) {
      return res.status(400).json({ success: false, message: 'Description is required' });
    }
    if (!contactEmail || !contactEmail.trim()) {
      return res.status(400).json({ success: false, message: 'Contact email is required' });
    }
    if (!phone || !phone.trim()) {
      return res.status(400).json({ success: false, message: 'Phone number is required' });
    }
    if (!studentId || !studentId.trim()) {
      return res.status(400).json({ success: false, message: 'Student ID is required' });
    }
    if (!nic || !nic.trim()) {
      return res.status(400).json({ success: false, message: 'NIC number is required' });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Shop image is required' });
    }
    
    // Parse services if it's a JSON string
    let parsedServices = [];
    if (services) {
      if (typeof services === 'string') {
        try {
          parsedServices = JSON.parse(services);
        } catch (e) {
          // If JSON parsing fails, try splitting by comma
          parsedServices = services.split(',').map(s => s.trim()).filter(s => s);
        }
      } else if (Array.isArray(services)) {
        parsedServices = services;
      }
    }
    
    // Validate at least one service
    if (parsedServices.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one service is required' });
    }
    
    // Prepare shop data
    const shopData = {
      shopName: shopName.trim(),
      owner: owner.trim(),
      services: parsedServices,
      description: description.trim(),
      contact: contactEmail.trim(),
      phone: phone.trim(),
      studentId: studentId.trim(),
      nic: nic.trim(),
      location: location ? location.trim() : 'Campus',
      priceRange: priceRange ? priceRange.trim() : 'Contact for pricing',
      availability: availability ? availability.trim() : 'Flexible hours',
      image: `/uploads/${req.file.filename}`,
      status: 'pending',
      submittedDate: new Date(),
      rating: 5.0,
      reviews: 0
    };

    const shop = new Shop(shopData);
    await shop.save();

    res.status(201).json({ 
      success: true, 
      data: shop, 
      message: 'Shop submitted for approval successfully!'
    });
  } catch (error) {
    console.error('Error creating shop:', error);
    
    // If there was an error and file was uploaded, delete it
    if (req.file) {
      const imagePath = path.join(__dirname, '..', 'uploads', req.file.filename);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to create shop'
    });
  }
};

// Update shop (NEW)
const updateShop = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const shop = await Shop.findById(id);
    if (!shop) {
      return res.status(404).json({ success: false, message: 'Shop not found' });
    }
    
    // Update fields
    if (updateData.shopName) shop.shopName = updateData.shopName;
    if (updateData.description) shop.description = updateData.description;
    if (updateData.location) shop.location = updateData.location;
    if (updateData.priceRange) shop.priceRange = updateData.priceRange;
    if (updateData.availability) shop.availability = updateData.availability;
    if (updateData.services) shop.services = updateData.services;
    
    await shop.save();
    
    res.status(200).json({ 
      success: true, 
      data: shop, 
      message: 'Shop updated successfully' 
    });
  } catch (error) {
    console.error('Error updating shop:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Approve shop
const approveShop = async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id);
    if (!shop) {
      return res.status(404).json({ success: false, message: 'Shop not found' });
    }
    
    shop.status = 'approved';
    shop.approvedDate = new Date();
    await shop.save();

    res.status(200).json({ 
      success: true, 
      data: shop, 
      message: 'Shop approved successfully' 
    });
  } catch (error) {
    console.error('Error approving shop:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Reject shop
const rejectShop = async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id);
    if (!shop) {
      return res.status(404).json({ success: false, message: 'Shop not found' });
    }
    
    shop.status = 'rejected';
    await shop.save();

    res.status(200).json({ 
      success: true, 
      message: 'Shop rejected successfully' 
    });
  } catch (error) {
    console.error('Error rejecting shop:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete shop
const deleteShop = async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id);
    if (!shop) {
      return res.status(404).json({ success: false, message: 'Shop not found' });
    }
    
    // Delete image file if exists
    if (shop.image && shop.image.startsWith('/uploads/')) {
      const imagePath = path.join(__dirname, '..', shop.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    await shop.deleteOne();

    res.status(200).json({ 
      success: true, 
      message: 'Shop deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting shop:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update shop rating
const updateShopRating = async (req, res) => {
  try {
    const { rating } = req.body;
    const shop = await Shop.findById(req.params.id);
    
    if (!shop) {
      return res.status(404).json({ success: false, message: 'Shop not found' });
    }
    
    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    }
    
    // Calculate new average rating
    const currentTotal = shop.rating * shop.reviews;
    const newTotal = currentTotal + rating;
    const newReviews = shop.reviews + 1;
    const newRating = newTotal / newReviews;
    
    shop.rating = parseFloat(newRating.toFixed(1));
    shop.reviews = newReviews;
    await shop.save();

    res.status(200).json({ 
      success: true, 
      rating: shop.rating, 
      reviews: shop.reviews 
    });
  } catch (error) {
    console.error('Error updating shop rating:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get shop statistics (optional helper)
const getShopStats = async (req, res) => {
  try {
    const totalShops = await Shop.countDocuments();
    const pendingShops = await Shop.countDocuments({ status: 'pending' });
    const approvedShops = await Shop.countDocuments({ status: 'approved' });
    const rejectedShops = await Shop.countDocuments({ status: 'rejected' });
    
    const averageRating = await Shop.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: null, avgRating: { $avg: '$rating' } } }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        total: totalShops,
        pending: pendingShops,
        approved: approvedShops,
        rejected: rejectedShops,
        averageRating: averageRating[0]?.avgRating?.toFixed(1) || 0
      }
    });
  } catch (error) {
    console.error('Error fetching shop stats:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getPendingShops,
  getApprovedShops,
  getShopsByStudentId,
  getShopById,
  createShop,
  updateShop,
  approveShop,
  rejectShop,
  deleteShop,
  updateShopRating,
  getShopStats
};