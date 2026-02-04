import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Load environment variables
dotenv.config();

// User schema (simplified version)
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

async function createAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@plantdi.com' });
    
    if (existingAdmin) {
      console.log('❌ Admin user already exists with email: admin@plantdi.com');
      console.log('Use these credentials to login:');
      console.log('Email: admin@plantdi.com');
      console.log('Password: admin123');
      process.exit(0);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@plantdi.com',
      password: hashedPassword,
      role: 'admin'
    });

    console.log('✅ Admin user created successfully!');
    console.log('\n📧 Login Credentials:');
    console.log('Email: admin@plantdi.com');
    console.log('Password: admin123');
    console.log('\n⚠️  Please change the password after first login!');

    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
}

createAdmin();
