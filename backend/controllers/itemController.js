const Item = require('../models/Item');
const path = require('path');
const fs = require('fs');

// Get all pending items (for admin)
const getPendingItems = async (req, res) => {
  try {
    const items = await Item.find({ status: 'pending' }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: items });
  } catch (error) {
    console.error('Error fetching pending items:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all approved items
const getApprovedItems = async (req, res) => {
  try {
    const items = await Item.find({ status: 'approved' }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: items });
  } catch (error) {
    console.error('Error fetching approved items:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get items by student ID (NEW)
const getItemsByStudentId = async (req, res) => {
  try {
    const { studentId } = req.params;
    const items = await Item.find({ studentId: studentId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: items });
  } catch (error) {
    console.error('Error fetching items by student ID:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single item by ID
const getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }
    
    // Increment views
    item.views += 1;
    await item.save();
    
    res.status(200).json({ success: true, data: item });
  } catch (error) {
    console.error('Error fetching item:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create new item (FIXED VERSION)
const createItem = async (req, res) => {
  try {
    let itemData;
    
    // Check if data is coming as JSON string (FormData) or direct object
    if (req.body.data) {
      // FormData with JSON string
      itemData = JSON.parse(req.body.data);
    } else {
      // Direct object from form
      itemData = req.body;
    }
    
    // Validate required fields
    if (!itemData.title || !itemData.title.trim()) {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }
    if (!itemData.price) {
      return res.status(400).json({ success: false, message: 'Price is required' });
    }
    if (!itemData.category) {
      return res.status(400).json({ success: false, message: 'Category is required' });
    }
    if (!itemData.description || !itemData.description.trim()) {
      return res.status(400).json({ success: false, message: 'Description is required' });
    }
    if (!itemData.sellerName || !itemData.sellerName.trim()) {
      return res.status(400).json({ success: false, message: 'Seller name is required' });
    }
    if (!itemData.contactEmail && !itemData.contact) {
      return res.status(400).json({ success: false, message: 'Contact email is required' });
    }
    if (!itemData.phone) {
      return res.status(400).json({ success: false, message: 'Phone number is required' });
    }
    if (!itemData.studentId) {
      return res.status(400).json({ success: false, message: 'Student ID is required' });
    }
    if (!itemData.nic) {
      return res.status(400).json({ success: false, message: 'NIC number is required' });
    }
    
    // Handle image
    if (req.file) {
      itemData.image = `/uploads/${req.file.filename}`;
    } else if (!itemData.image) {
      return res.status(400).json({ success: false, message: 'Item image is required' });
    }
    
    // Ensure contact field is set correctly
    if (itemData.contactEmail && !itemData.contact) {
      itemData.contact = itemData.contactEmail;
    }
    
    // Parse tags if it's a string
    if (typeof itemData.tags === 'string') {
      itemData.tags = itemData.tags.split(',').map(t => t.trim()).filter(t => t);
    }

    const item = new Item(itemData);
    await item.save();

    res.status(201).json({ 
      success: true, 
      data: item, 
      message: 'Item listed successfully! Waiting for admin approval.' 
    });
  } catch (error) {
    console.error('Error creating item:', error);
    
    // If there was an error and file was uploaded, delete it
    if (req.file) {
      const imagePath = path.join(__dirname, '..', 'uploads', req.file.filename);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to create item' 
    });
  }
};

// Update item (NEW)
const updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const item = await Item.findById(id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }
    
    // Update fields
    if (updateData.title) item.title = updateData.title;
    if (updateData.price) item.price = updateData.price;
    if (updateData.category) item.category = updateData.category;
    if (updateData.condition) item.condition = updateData.condition;
    if (updateData.description) item.description = updateData.description;
    if (updateData.location) item.location = updateData.location;
    if (updateData.tags) item.tags = updateData.tags;
    
    await item.save();
    
    res.status(200).json({ 
      success: true, 
      data: item, 
      message: 'Item updated successfully' 
    });
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update promotion price (NEW)
const updatePromotionPrice = async (req, res) => {
  try {
    const { id } = req.params;
    const { promotionPrice } = req.body;
    
    const item = await Item.findById(id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }
    
    item.promotionPrice = promotionPrice;
    await item.save();
    
    res.status(200).json({ 
      success: true, 
      data: item, 
      message: promotionPrice ? 'Promotion added successfully' : 'Promotion removed successfully'
    });
  } catch (error) {
    console.error('Error updating promotion:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Approve item (admin)
const approveItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }
    
    item.status = 'approved';
    item.approvedDate = new Date();
    await item.save();

    res.status(200).json({ 
      success: true, 
      data: item, 
      message: 'Item approved successfully' 
    });
  } catch (error) {
    console.error('Error approving item:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Reject item (admin)
const rejectItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }
    
    item.status = 'rejected';
    await item.save();

    res.status(200).json({ 
      success: true, 
      message: 'Item rejected successfully' 
    });
  } catch (error) {
    console.error('Error rejecting item:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete item
const deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }
    
    // Delete image file
    if (item.image && item.image.startsWith('/uploads/')) {
      const imagePath = path.join(__dirname, '..', item.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    await item.deleteOne();

    res.status(200).json({ 
      success: true, 
      message: 'Item deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Increment item views
const incrementItemViews = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }
    
    item.views += 1;
    await item.save();
    
    res.status(200).json({ 
      success: true, 
      views: item.views 
    });
  } catch (error) {
    console.error('Error incrementing views:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Increment item likes
const incrementItemLikes = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }
    
    item.likes = (item.likes || 0) + 1;
    await item.save();
    
    res.status(200).json({ 
      success: true, 
      likes: item.likes 
    });
  } catch (error) {
    console.error('Error incrementing likes:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
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
};