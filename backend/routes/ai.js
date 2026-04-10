const express = require('express');
const router = express.Router();
const { generateCoverLetter, chatCounselor } = require('../controllers/aiController');

router.post('/cover-letter', generateCoverLetter);
router.post('/chat', chatCounselor);

module.exports = router;

