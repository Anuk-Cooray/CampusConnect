const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const { createServer } = require('http');
const { Server } = require('socket.io');
const aiChatRoutes = require("./routes/aiChat");
const setupChatSocket = require('./socket/chatSocket');

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: true,
    methods: ["GET", "POST"],
    credentials: true,
  }
});

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/marketplace', require('./routes/marketplace'));
app.use('/api/accommodation', require('./routes/accommodation'));
app.use('/api/accommodations', require('./routes/accommodation'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/profiles', require('./routes/profiles'));
app.use('/api/notifications', require('./routes/notifications'));
app.use("/api/time", require("./routes/timeManagement"));
app.use("/api/ai", require("./routes/aiChat"));


connectDB();

setupChatSocket(io);

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

app.use((error, req, res, next) => {
  if (error instanceof require('multer').MulterError) {
    return res.status(400).json({ message: `Multer error: ${error.message}` });
  }
  next();
});

app.get('/', (req, res) => {
  res.send('CampusConnect API running');
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
