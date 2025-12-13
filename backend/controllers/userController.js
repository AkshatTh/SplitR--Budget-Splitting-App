const asyncHandler = require('express-async-handler');
const User = require('../models/User');


const registerUser = asyncHandler(async (req, res) => {
  
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Please add all fields');
  }
  res.status(200).json({ message: 'Register User Code Works!' });
});

module.exports = {
  registerUser,
};