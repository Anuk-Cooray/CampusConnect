require('dotenv').config();
const Accommodation = require("../models/Accommodation");

exports.chatWithAI = async (req, res) => {
  try {
    const { messages } = req.body;

    const accommodations = await Accommodation.find({ isAvailable: true }).lean();

    const accommodationSummary = accommodations.map(a => ({
      id: a._id,
      title: a.title,
      price: a.price,
      distance: a.distance,
      distanceUnit: a.distanceUnit,
      gender: a.gender,
      availableRooms: a.availableRooms,
      facilities: a.facilities,
      address: a.address,
    }));

    const userMessage = messages[messages.length - 1]?.content?.toLowerCase() || "";

    let aiResponse = "";
    let filters = null;

    // ─── Extract filters from ANY message ───────────────────────────
    const extractedFilters = {};

    // Price extraction
    // "under 20000" / "below 15000" / "max 10000" / "less than 25000"
    const maxPriceMatch = userMessage.match(/(?:under|below|max(?:imum)?|less than|up to|within)\s*(?:rs\.?)?\s*([\d,]+)/i)
      || userMessage.match(/(?:rs\.?)\s*([\d,]+)\s*(?:max|maximum|or less|below|under)?/i)
      || userMessage.match(/([\d,]+)\s*(?:or less|and below|max)/i);
    if (maxPriceMatch) {
      extractedFilters.maxPrice = maxPriceMatch[1].replace(/,/g, "");
    }

    // "between 10000 and 20000" / "10000 to 20000"
    const rangeMatch = userMessage.match(/([\d,]+)\s*(?:to|-|and)\s*([\d,]+)/);
    if (rangeMatch) {
      extractedFilters.minPrice = rangeMatch[1].replace(/,/g, "");
      extractedFilters.maxPrice = rangeMatch[2].replace(/,/g, "");
    }

    // "above 5000" / "min 8000" / "at least 10000"
    const minPriceMatch = userMessage.match(/(?:above|min(?:imum)?|at least|more than|over)\s*(?:rs\.?)?\s*([\d,]+)/i);
    if (minPriceMatch) {
      extractedFilters.minPrice = minPriceMatch[1].replace(/,/g, "");
    }

    // Distance extraction
    // "within 2km" / "2 km" / "less than 3km" / "under 5 km"
    const distanceMatch = userMessage.match(/(?:within|under|less than|below|max)?\s*([\d.]+)\s*km/i)
      || userMessage.match(/(?:within|under|less than|below|max)\s*([\d.]+)\s*(?:km|kilometers?|kilometres?)/i);
    if (distanceMatch) {
      extractedFilters.maxDistance = distanceMatch[1];
    }

    // Gender extraction
    if (userMessage.match(/\b(female|girls?|ladies|women)\b/i)) {
      extractedFilters.gender = "Female";
    } else if (userMessage.match(/\b(male|boys?|men|gents)\b/i)) {
      extractedFilters.gender = "Male";
    }

    // Facilities extraction
    const facilityKeywords = {
      "wifi": "WiFi",
      "wi-fi": "WiFi",
      "internet": "WiFi",
      "parking": "Parking",
      "kitchen": "Kitchen",
      "air conditioning": "Air Conditioning",
      "ac": "Air Conditioning",
      "a/c": "Air Conditioning",
      "hot water": "Hot Water",
      "security": "Security",
      "study room": "Study Room",
      "cctv": "CCTV",
      "furnished": "Furnished",
      "water included": "Water Included",
      "electricity included": "Electricity Included",
    };

    const matchedFacilities = [];
    for (const [keyword, facilityName] of Object.entries(facilityKeywords)) {
      if (userMessage.includes(keyword)) {
        matchedFacilities.push(facilityName);
      }
    }
    if (matchedFacilities.length > 0) {
      extractedFilters.facilities = matchedFacilities;
    }

    // ─── Build Response ───────────────────────────────────────────────
    const hasFilters = Object.keys(extractedFilters).length > 0;

    if (userMessage.includes("hello") || userMessage.includes("hi") || userMessage === "hello, i need help finding accommodation.") {
      aiResponse = "👋 Hi! I'm your accommodation assistant. To help you find the perfect place, tell me:\n1. What's your budget? (e.g. under Rs. 15,000)\n2. How far from campus? (e.g. within 3km)\n3. Any gender preference?\n4. Facilities you need? (WiFi, Kitchen, etc.)";

    } else if (hasFilters) {
      // Apply filters and give smart response
      filters = extractedFilters;

      // Filter accommodations to show count
      const matched = accommodationSummary.filter(a => {
        if (filters.minPrice && a.price < Number(filters.minPrice)) return false;
        if (filters.maxPrice && a.price > Number(filters.maxPrice)) return false;
        if (filters.maxDistance && a.distance > Number(filters.maxDistance)) return false;
        if (filters.gender && a.gender !== "Any" && a.gender !== filters.gender) return false;
        if (filters.facilities?.length > 0) {
          const placeFacs = (a.facilities || []).map(f => f.toLowerCase());
          return filters.facilities.every(f => placeFacs.includes(f.toLowerCase()));
        }
        return true;
      });

      // Build a human-readable summary of applied filters
      const filterSummary = [];
      if (filters.minPrice && filters.maxPrice) filterSummary.push(`💰 Rs. ${Number(filters.minPrice).toLocaleString()} – Rs. ${Number(filters.maxPrice).toLocaleString()}`);
      else if (filters.maxPrice) filterSummary.push(`💰 Under Rs. ${Number(filters.maxPrice).toLocaleString()}`);
      else if (filters.minPrice) filterSummary.push(`💰 Above Rs. ${Number(filters.minPrice).toLocaleString()}`);
      if (filters.maxDistance) filterSummary.push(`📍 Within ${filters.maxDistance} km`);
      if (filters.gender) filterSummary.push(`👤 ${filters.gender} only`);
      if (filters.facilities?.length) filterSummary.push(`🏠 ${filters.facilities.join(", ")}`);

      aiResponse = `✅ Got it! I've applied your filters:\n${filterSummary.join("\n")}\n\n`;

      if (matched.length > 0) {
        aiResponse += `Found **${matched.length}** matching place${matched.length !== 1 ? "s" : ""}! Here are the top results:\n\n`;
        matched.slice(0, 3).forEach((acc, idx) => {
          aiResponse += `${idx + 1}. ${acc.title} — Rs. ${acc.price?.toLocaleString()}/month\n   📍 ${acc.distance} ${acc.distanceUnit} from campus\n   👥 ${acc.gender || "Any"}\n\n`;
        });
        aiResponse += "Scroll up to see all results! Need to refine further?";
      } else {
        aiResponse += "😕 No exact matches found. Try relaxing the filters a bit — e.g. increase budget or distance.";
        filters = null; // Don't apply empty results
      }

    } else if (userMessage.match(/\b(budget|price|rent|cost|afford)\b/i)) {
      aiResponse = "💰 What's your monthly budget range?\n\n- Under Rs. 10,000\n- Rs. 10,000 – 20,000\n- Rs. 20,000 – 30,000\n- Above Rs. 30,000\n\nJust type something like \"under 15000\" or \"between 10000 and 20000\"!";

    } else if (userMessage.match(/\b(distance|far|close|near|km|campus)\b/i)) {
      aiResponse = "📍 How far from campus are you willing to travel?\n\n- Within 1 km\n- Within 2 km\n- Within 5 km\n- More than 5 km\n\nJust say something like \"within 3km\"!";

    } else if (userMessage.match(/\b(facilit|wifi|kitchen|parking|ac|furnished)\b/i)) {
      aiResponse = "🏠 Which facilities do you need?\n\n- WiFi\n- Kitchen\n- Parking\n- Air Conditioning\n- Hot Water\n- Security\n- Study Room\n- Furnished\n- CCTV\n\nYou can mention multiple — e.g. \"WiFi and Kitchen\"!";

    } else if (accommodationSummary.length > 0) {
      const top = accommodationSummary.slice(0, 3);
      aiResponse = `✨ Here are some available places:\n\n`;
      top.forEach((acc, idx) => {
        aiResponse += `${idx + 1}. ${acc.title} — Rs. ${acc.price?.toLocaleString()}/month\n   📍 ${acc.distance} ${acc.distanceUnit} | 👥 ${acc.gender || "Any"}\n\n`;
      });
      aiResponse += "Tell me your budget, distance, or facilities to filter these results!";

    } else {
      aiResponse = "I'm here to help! 🏠 Tell me:\n- Budget (e.g. under Rs. 15,000)\n- Distance (e.g. within 2km)\n- Gender preference\n- Facilities needed\n\nLet's find your perfect place!";
    }

    return res.json({
      success: true,
      message: aiResponse,
      filters: filters,
    });

  } catch (err) {
    console.error("AI chat error:", err);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: "An error occurred while processing your request.",
      });
    }
  }
};