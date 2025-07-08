const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const excelRoutes = require('./routes/excelRoutes');
const projectRoutes = require('./routes/projectRoutes');
const chartRoutes = require('./routes/chartRoutes');
const activityRoutes = require('./routes/activityRoutes');
const teamRoutes = require('./routes/teamRoutes');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Basic route
app.get('/', (req, res) => {
  res.send('API is running...');
});

app.use('/api/auth', authRoutes);
app.use('/api/excel', excelRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/charts', chartRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/teams', teamRoutes);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// --- Socket.IO setup ---
const { Server } = require('socket.io');
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173', // Use your frontend URL exactly
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Join a project or file room
  socket.on('join-room', (roomId, user) => {
    socket.join(roomId);
    socket.to(roomId).emit('user-joined', user);
    // Optionally, broadcast current presence
  });

  // Project-wide: Excel data edit
  socket.on('data-edit', (projectId, change) => {
    socket.to(projectId).emit('data-edit', change);
  });

  // Project-wide: Chart create/edit
  socket.on('chart-edit', (projectId, chart) => {
    socket.to(projectId).emit('chart-edit', chart);
  });

  // Presence
  socket.on('presence', (projectId, presence) => {
    socket.to(projectId).emit('presence', presence);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
    // Optionally, broadcast presence update
  });
});