const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' },
  );
};

router.post('/register', async (req, res) => {
  try {
    const { name, studentId, email, password } = req.body;

    if (!name || !studentId || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const passwordRegex = /^(?=.*[0-9]).{8,}$/;
    if (!passwordRegex.test(password)) {
      return res
        .status(400)
        .json({ message: 'Password must be at least 8 characters long and include a number.' });
    }

    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { studentId }],
    });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: 'A user with this email or student ID already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      studentId,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'Student',
    });

    const token = generateToken(user);

    return res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        studentId: user.studentId,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user);

    return res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        studentId: user.studentId,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

