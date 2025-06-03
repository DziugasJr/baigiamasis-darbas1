const User = require('./models/userModel');
const Account = require('./models/accountModel');
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();

// Middleware to parse JSON data
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/virtual-bank', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.log('Error connecting to MongoDB:', err));

// Basic route to test server
app.get('/', (req, res) => {
  res.send('Welcome to the Virtual Bank!');
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Test route to create a new user
app.post('/test/create-user', async (req, res) => {
  const { firstName, lastName, personalCode, password } = req.body;

  const user = new User({ firstName, lastName, personalCode, password });
  await user.save();
  res.status(201).json({ message: 'User created successfully', user });
});