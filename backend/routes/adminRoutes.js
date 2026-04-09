const express = require('express');
const router = express.Router();
const Item = require('../models/Item');
const Shop = require('../models/Shop');

router.get('/pending-requests', async (req, res) => {
  try {
    const pendingItems = await Item.find({ status: 'pending' }).sort({ createdAt: -1 });
    const pendingShops = await Shop.find({ status: 'pending' }).sort({ createdAt: -1 });
    const pendingRequests = [
      ...pendingItems.map((item) => ({ ...item.toObject(), type: 'item', submittedDate: item.createdAt })),
      ...pendingShops.map((shop) => ({ ...shop.toObject(), type: 'shop', submittedDate: shop.createdAt })),
    ].sort((a, b) => new Date(b.submittedDate) - new Date(a.submittedDate));
    res.status(200).json({ success: true, data: pendingRequests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const pendingItems = await Item.countDocuments({ status: 'pending' });
    const approvedItems = await Item.countDocuments({ status: 'approved' });
    const pendingShops = await Shop.countDocuments({ status: 'pending' });
    const approvedShops = await Shop.countDocuments({ status: 'approved' });
    res.status(200).json({
      success: true,
      data: {
        totalPending: pendingItems + pendingShops,
        totalApproved: approvedItems + approvedShops,
        totalItems: approvedItems,
        totalShops: approvedShops,
        pendingItems,
        pendingShops,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/contact-seller', async (req, res) => {
  const { sellerEmail, sellerName, buyerName, itemTitle } = req.body || {};
  if (!sellerEmail || !sellerName || !buyerName || !itemTitle) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }
  res.status(200).json({
    success: true,
    message: 'Contact request recorded. Email integration can be added later.',
  });
});

module.exports = router;
