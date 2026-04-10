const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const Accommodation = require('../models/Accommodation');

if (!fs.existsSync('uploads/accommodations')) {
  fs.mkdirSync('uploads/accommodations', { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
  cb(null, 'uploads/accommodations/');
},
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '-'));
  },
});
const uploads = multer({ storage: storage });

const normalizeAccommodation = (doc) => {
  const photos = Array.isArray(doc.photos) ? doc.photos : Array.isArray(doc.imageUrls) ? doc.imageUrls : [];
  const owner = doc.owner || {
    name: doc.ownerName || 'Owner',
    phone: doc.contactNumber || 'N/A',
    email: 'N/A',
  };
  const price = Number(doc.price ?? doc.rent ?? 0);
  const distance = Number(doc.distance ?? 0);
  const availableRooms = Number(doc.availableRooms ?? 0);

  return {
    ...doc.toObject(),
    photos,
    owner,
    price,
    distance,
    distanceUnit: doc.distanceUnit || 'km',
    gender: doc.gender || 'Any',
    facilities: Array.isArray(doc.facilities) ? doc.facilities : [],
    availableRooms,
    isAvailable: typeof doc.isAvailable === 'boolean' ? doc.isAvailable : availableRooms > 0,
  };
};

// @route   GET /api/accommodation
router.get('/', async (req, res) => {
  try {
    const places = await Accommodation.find().sort({ createdAt: -1 });
    res.json(places.map(normalizeAccommodation));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/accommodation (Student OR Admin)
router.post('/', uploads.array('photos', 5), async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      distance,
      distanceUnit = 'km',
      address,
      propertyType = 'Room',
      gender = 'Any',
      ownerName,
      ownerPhone,
      ownerEmail,
      availableRooms = 1,
      facilities,
    } = req.body;

    const photos = Array.isArray(req.files) ? req.files.map((file) => file.path) : [];
    const facilitiesArr = typeof facilities === 'string' ? JSON.parse(facilities) : Array.isArray(facilities) ? facilities : [];
    const priceNum = Number(price);
    const distanceNum = Number(distance);
    const roomsNum = Number(availableRooms);

    if (photos.length < 2) {
      return res.status(400).json({ message: 'Please upload at least 2 photos' });
    }
    if (photos.length > 5) {
      return res.status(400).json({ message: 'Maximum 5 photos allowed' });
    }

    // Validation
    if (!title || !description || !price || !distance || !address || !ownerName || !ownerPhone || !ownerEmail) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    if (isNaN(priceNum) || priceNum <= 0) {
      return res.status(400).json({ message: 'Price must be a positive number' });
    }
    if (isNaN(distanceNum) || distanceNum < 0) {
      return res.status(400).json({ message: 'Distance must be a valid number' });
    }

    const newPlace = new Accommodation({
      title,
      description,
      price: priceNum,
      distance: distanceNum,
      distanceUnit,
      address,
      propertyType,
      photos,
      facilities: facilitiesArr,
      owner: {
        name: ownerName,
        phone: ownerPhone,
        email: ownerEmail,
      },
      gender,
      availableRooms: roomsNum,
      isAvailable: roomsNum > 0,
      createdBy: null,
    });
    await newPlace.save();
    res.status(201).json(newPlace);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message).join('; ');
      return res.status(400).json({ message: messages });
    }
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/accommodation/:id
router.get('/:id', async (req, res) => {
  try {
    if (!/^[0-9a-fA-F]{24}$/.test(req.params.id)) {
      return res.status(400).json({ message: 'Invalid accommodation id' });
    }
    const place = await Accommodation.findById(req.params.id);
    if (!place) return res.status(404).json({ message: 'Accommodation not found' });
    res.json(normalizeAccommodation(place));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/accommodation/:id
router.put('/:id', uploads.array('photos', 5), async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      distance,
      distanceUnit = 'km',
      address,
      propertyType = 'Room',
      gender = 'Any',
      ownerName,
      ownerPhone,
      ownerEmail,
      availableRooms = 1,
      facilities,
      keepPhotos,
    } = req.body;

    const photos = Array.isArray(req.files) ? req.files.map((file) => file.path) : [];
    const facilitiesArr = typeof facilities === 'string' ? JSON.parse(facilities) : Array.isArray(facilities) ? facilities : [];
    const priceNum = Number(price);
    const distanceNum = Number(distance);
    const roomsNum = Number(availableRooms);
    const keepPhotosArr = typeof keepPhotos === 'string'
      ? (() => {
          try {
            return JSON.parse(keepPhotos);
          } catch {
            return [keepPhotos];
          }
        })()
      : Array.isArray(keepPhotos)
        ? keepPhotos
        : [];

    const updatedPhotos = [...keepPhotosArr, ...photos];
    if (updatedPhotos.length < 2) {
      return res.status(400).json({ message: 'Please keep or upload at least 2 photos' });
    }
    if (updatedPhotos.length > 5) {
      return res.status(400).json({ message: 'Maximum 5 photos allowed' });
    }

    const updateData = {
      title,
      description,
      price: priceNum,
      distance: distanceNum,
      distanceUnit,
      address,
      propertyType,
      photos: updatedPhotos,
      facilities: facilitiesArr,
      owner: {
        name: ownerName,
        phone: ownerPhone,
        email: ownerEmail,
      },
      gender,
      availableRooms: roomsNum,
      isAvailable: roomsNum > 0,
    };

    const updatedPlace = await Accommodation.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!updatedPlace) return res.status(404).json({ message: 'Accommodation not found' });
    res.json(updatedPlace);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message).join('; ');
      return res.status(400).json({ message: messages });
    }
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/accommodation/:id/status (Admin Approve/Reject)
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const updatedPlace = await Accommodation.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json(updatedPlace);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/accommodation/:id
router.delete('/:id', async (req, res) => {
  try {
    await Accommodation.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

