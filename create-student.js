const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

async function createTestStudent() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/campusconnect');

    // Check if test student already exists
    const existingStudent = await User.findOne({ email: 'student@campusconnect.lk' });
    if (existingStudent) {
      console.log('Test student already exists!');
      console.log('Email: student@campusconnect.lk');
      console.log('Password: Student123');
      process.exit(0);
    }

    // Create test student
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Student123', salt);

    const student = await User.create({
      studentId: 'TEST001',
      name: 'Test Student',
      email: 'student@campusconnect.lk',
      password: hashedPassword,
      role: 'student'
    });

    console.log('✅ Test student created successfully!');
    console.log('Email: student@campusconnect.lk');
    console.log('Password: Student123');
    console.log('Student ID:', student._id);

    process.exit(0);
  } catch (err) {
    console.error('Error creating test student:', err);
    process.exit(1);
  }
}

createTestStudent();