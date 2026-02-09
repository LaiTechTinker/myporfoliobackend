import express from 'express';
import serverless from 'serverless-http';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import connectDB from '../config/database.js';
import projectRoutes from '../routes/projects.js';
import contactRoutes from '../routes/contacts.js';
import adminRoutes from '../routes/admin.js';

dotenv.config();

// Connect to database
// connectDB();

const app = express();

// Middleware
app.use(cors({
  origin:"*"
}));
let isConnected = false;

const connectDatabase = async () => {
  if (!isConnected) {
    await connectDB();
    isConnected = true;
  }
};

app.use(async (req, res, next) => {
  await connectDatabase();
  next();
});
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));


app.get("/", (req, res) => {
  res.send("API is working");
});
// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/projects', projectRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Portfolio API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Validation Error',
      errors: Object.values(err.errors).map(e => e.message)
    });
  }

  if (err.code === 11000) {
    return res.status(400).json({
      message: 'Duplicate field value',
      field: Object.keys(err.keyValue)[0]
    });
  }

  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

export default serverless(app);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
