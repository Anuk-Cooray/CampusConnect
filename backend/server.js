const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/marketplace', require('./routes/marketplace'));
app.use('/api/items', require('./routes/itemRoutes'));
app.use('/api/shops', require('./routes/shopRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/accommodation', require('./routes/accommodation'));
app.use('/api/accommodations', require('./routes/accommodation'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/time', require('./routes/timeManagement'));
app.use('/api/study-bookings', require('./routes/studyBookings'));
app.use('/api/lecture-materials', require('./routes/lectureMaterials'));
app.use('/api/kuppi-sessions', require('./routes/kuppiSessions'));
app.use('/api/questions', require('./routes/questions'));
app.use('/api/profiles', require('./routes/profiles'));
app.use('/api/notifications', require('./routes/notifications'));

connectDB();

app.get('/', (req, res) => {
  res.send('CampusConnect API running');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
