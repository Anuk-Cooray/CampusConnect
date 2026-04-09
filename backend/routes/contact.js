const express = require('express');
const router = express.Router();

router.post('/seller', async (req, res) => {
  const { sellerEmail, sellerName, buyerName, buyerEmail, message, itemTitle } = req.body || {};
  if (!sellerEmail || !sellerName || !buyerName || !buyerEmail || !message || !itemTitle) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }
  return res.status(200).json({
    success: true,
    message: 'Message accepted. Hook this to email service when ready.',
  });
});

module.exports = router;
