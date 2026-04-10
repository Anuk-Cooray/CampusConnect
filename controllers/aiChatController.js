require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Accommodation = require("../models/Accommodation");

exports.chatWithAI = async (req, res) => {
  try {
    const { messages } = req.body;

    const accommodations = await Accommodation.find({ isAvailable: true }).lean();

    const accommodationSummary = accommodations.map(a => ({
      id: a._id,
      title: a.title,
      price: a.price,
      distance: `${a.distance} ${a.distanceUnit}`,
      gender: a.gender,
      availableRooms: a.availableRooms,
      facilities: a.facilities,
      address: a.address,
    }));

    // Mock responses for development/testing
    const userMessage = messages[messages.length - 1]?.content?.toLowerCase() || "";
    
    let aiResponse = "";
    let filters = null;

    // Simple mock logic based on user input
    if (userMessage.includes("hello") || userMessage.includes("hi") || userMessage === "Hello, I need help finding accommodation.") {
      aiResponse = "👋 Hi! I'm your accommodation assistant. To help you find the perfect place, could you tell me:\n1. What's your budget range?\n2. Do you have any gender preferences?\n3. How far are you willing to travel from campus?";
    } 
    else if (userMessage.includes("budget") || userMessage.includes("price")) {
      aiResponse = "Great! Budget is important. 💰\n\nWhat's your monthly budget range? For example:\n- Under 10,000\n- 10,000 - 20,000\n- 20,000 - 30,000\n- 30,000+";
    }
    else if (userMessage.includes("gender") || userMessage.includes("male") || userMessage.includes("female")) {
      aiResponse = "Got it! Do you prefer:\n- Male only accommodation\n- Female only accommodation\n- No preference (co-ed)";
      
      if (userMessage.includes("male")) {
        filters = { gender: "Male" };
      } else if (userMessage.includes("female")) {
        filters = { gender: "Female" };
      }
    }
    else if (userMessage.includes("close") || userMessage.includes("near") || userMessage.includes("distance") || userMessage.includes("km")) {
      aiResponse = "Distance matters! 📍 Are you looking for:\n- Within 1 km\n- Within 2 km\n- Within 5 km\n- More than 5 km";
    }
    else if (userMessage.includes("wifi") || userMessage.includes("kitchen") || userMessage.includes("facilities")) {
      aiResponse = "Perfect! What facilities are important to you?\n- WiFi ✅\n- Kitchen 🍳\n- Parking 🚗\n- Gym 💪\n- Air Conditioning ❄️";
    }
    else if (accommodationSummary.length > 0) {
      // Default recommendation
      const recommended = accommodationSummary.slice(0, 3);
      aiResponse = `✨ Based on your preferences, here are my top recommendations:\n\n`;
      recommended.forEach((acc, idx) => {
        aiResponse += `${idx + 1}. **${acc.title}** - Rs.${acc.price}/month\n   📍 ${acc.distance}\n   👥 ${acc.gender || 'Any'}\n\n`;
      });
      aiResponse += "Would you like more details about any of these? I can help you filter further!";
      
      filters = {
        minPrice: 0,
        maxPrice: 50000,
        maxDistance: 5
      };
    }
    else {
      aiResponse = "I'm here to help! 🏠 Tell me what you're looking for in accommodation:\n- Budget range\n- Location/distance preference\n- Gender preferences\n- Facilities you need\n\nLet's find your perfect place!";
    }

    if (!res.headersSent) {
      res.json({
        success: true,
        message: aiResponse,
        filters: filters,
      });
    }

  } catch (err) {
    console.error("AI chat error:", err);
    
    if (!res.headersSent) {
      res.status(500).json({ 
        success: false, 
        message: err.message || "An error occurred while processing your request" 
      });
    }
  }
};