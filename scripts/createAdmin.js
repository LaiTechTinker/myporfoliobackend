const mongoose = require('mongoose');
const Admin = require('../models/Admin');
require('dotenv').config();

const createInitialAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ username: 'admin' });
    if (existingAdmin) {
      console.log('Admin already exists!');
      console.log('Username: admin');
      console.log('Password: admin123');
      process.exit(0);
    }

    // Create initial admin using static method
    await Admin.createAdmin('admin', 'admin123');
    console.log('✅ Initial admin created successfully!');
    console.log('Username: admin');
    console.log('Password: admin123');
    console.log('\n🔐 Please change the password after first login for security!');

  } catch (error) {
    console.error('Error creating admin:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Run the script
createInitialAdmin();
