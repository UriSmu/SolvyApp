require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/auth', authRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 SolvyApp Backend running on port ${PORT}`);
    console.log(`📧 Email configured: ${process.env.EMAIL_FROM || 'Not set'}`);
    console.log(`🔗 Magic link base URL: ${process.env.MAGIC_LINK_BASE_URL || 'Not set'}`);
    console.log(`⏱️  Token expiration: ${process.env.MAGIC_LINK_EXPIRATION || 60} minutes`);
  });
}

module.exports = app;
