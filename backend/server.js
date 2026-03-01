require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { v2: cloudinary } = require('cloudinary');
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./src/swagger");

// Import routes
const bagRoutes = require('./src/routes/bags');
const clothRoutes = require('./src/routes/clothes');
const exportRoutes = require('./src/routes/export');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Swagger - expose in dev mode (works on both local and Render)
if (process.env.NODE_ENV === "dev") {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log("📚 Swagger UI enabled");
}

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/api/bags', bagRoutes);
app.use('/api/clothes', clothRoutes);
app.use('/api/export', exportRoutes);

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [General]
 *     responses:
 *       200:
 *         description: Server is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string }
 *                 timestamp: { type: string, format: date-time }
 */
// Root health endpoint for cloud platform health checks (e.g., Render)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API health endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

//const PORT = process.env.PORT || 5000;
const PORT = process.env.PORT || 10000;
// Bind to 0.0.0.0 on Render/cloud platforms, localhost for local dev
// Render sets RENDER environment variable automatically
// const HOST = process.env.RENDER ? '0.0.0.0' : 'localhost';
const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`🚀 Server running on ${HOST}:${PORT}`);
  if (process.env.NODE_ENV === "dev") {
    const swaggerUrl = process.env.RENDER
      ? `https://${process.env.RENDER_EXTERNAL_HOSTNAME}/api-docs`
      : `http://localhost:${PORT}/api-docs`;
    console.log(`📚 Swagger UI available at ${swaggerUrl}`);
  }
});
