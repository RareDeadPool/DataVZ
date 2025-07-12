const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const excelRoutes = require('./routes/excelRoutes');
const projectRoutes = require('./routes/projectRoutes');
const chartRoutes = require('./routes/chartRoutes');
const activityRoutes = require('./routes/activityRoutes');

const aiRoutes = require('./routes/aiRoutes');
const supportRoutes = require('./routes/supportRoutes');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('./models/User');
const jwt = require('jsonwebtoken');

dotenv.config();

const app = express();

// Environment variables with defaults
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dataviz';
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
const SESSION_SECRET = process.env.SESSION_SECRET || 'your-super-secret-session-key-change-this-in-production';

// Middleware
app.use(cors({
  origin: '*',
  credentials: true,
}));
app.use(express.json());
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());

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

app.use('/api/ai', aiRoutes);
app.use('/api/support', supportRoutes);
app.use('/uploads', express.static('uploads'));

passport.use(new GoogleStrategy({
  clientID: '121125963532-jf9m6al7vt3c5m7rv4m4e7ns30tho85g.apps.googleusercontent.com',
  clientSecret: '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',
  callbackURL: '/api/auth/google/callback',
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ email: profile.emails[0].value });
    if (!user) {
      user = await User.create({
        name: profile.displayName,
        email: profile.emails[0].value,
        password: Math.random().toString(36), // random password, not used
        avatar: profile.photos && profile.photos[0] ? profile.photos[0].value : '',
      });
    }
    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

app.get('/api/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/api/auth/google/callback', passport.authenticate('google', { failureRedirect: '/' }), (req, res) => {
  // Issue JWT and redirect to frontend with token
  const token = jwt.sign({ userId: req.user._id, role: req.user.role, email: req.user.email }, JWT_SECRET, { expiresIn: '7d' });
  // Redirect to frontend with token as query param
  res.redirect(`http://localhost:5173/auth?token=${token}`);
});

const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));