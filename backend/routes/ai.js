const express = require('express');
const router = express.Router();
const { generateCoverLetter } = require('../controllers/aiController');

router.post('/cover-letter', generateCoverLetter);

module.exports = router;

