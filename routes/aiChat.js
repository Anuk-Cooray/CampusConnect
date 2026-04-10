const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { chatWithAI } = require("../controllers/aiChatController");

router.post("/accommodation-chat", authMiddleware.protect, chatWithAI);

module.exports = router;