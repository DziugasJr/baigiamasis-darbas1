import User from './models/userModel.js';
import Account from './models/accountModel.js';
import express from 'express';
import { connect } from 'mongoose';

import multer from 'multer';
const upload = multer({ dest: 'uploads/' });

const app = express();

import cors from 'cors';
app.use(cors());

// Middleware to parse JSON data
app.use(express.json());

// Connect to MongoDB before defining routes
connect('mongodb://localhost:27017/virtualbank')
  .then(() => {
    console.log('Connected to MongoDB');
    // Start the server only after successful DB connection
    const PORT = 3000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log('Nepavyko prisijungti prie serverio', err);
    process.exit(1); // Exit the process if DB connection fails
  });

app.post('/test/create-user', upload.single('passportCopy'), async (req, res) => {
  try {
    const { firstName, lastName, personalCode, password } = req.body;
    if (!firstName || !lastName || !personalCode || !password || !req.file) {
      return res.status(400).json({ message: 'Visi laukai privalomi' });
    }
    // Patikrinimas ar vartotojas jau egzistuoja
    const existingUser = await User.findOne({ personalCode });
    if (existingUser) {
      return res.status(409).json({ message: 'User with this personal code already exists' });
    }
    // Sukuriamas naujas vartotojas
    const user = new User({
      firstName,
      lastName,
      personalCode,
      password,
      passportCopy: req.file.filename
    });
    await user.save();
    res.status(201).json({ message: 'User created successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create user', error: error.message });
  }
});

// Basic route to test server
app.get('/', (req, res) => {
  res.send('Welcome to the Virtual Bank!');
});

// Helper function to validate Lithuanian personal code
function isValidPersonalCode(code) {
  // Check format: 11 digits, first digit 1-6, valid month/day
  if (!/^[1-6]\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}\d$/.test(code)) {
    return false;
  }
  // Checksum validation
  const digits = code.split('').map(Number);
  const weights1 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 1];
  const weights2 = [3, 4, 5, 6, 7, 8, 9, 1, 2, 3];

  let sum = digits.slice(0, 10).reduce((acc, d, i) => acc + d * weights1[i], 0);
  let remainder = sum % 11;
  let control = remainder < 10 ? remainder : null;

  if (control === null) {
    sum = digits.slice(0, 10).reduce((acc, d, i) => acc + d * weights2[i], 0);
    remainder = sum % 11;
    control = remainder < 10 ? remainder : 0;
  }

  return digits[10] === control;
}

// (First occurrence kept)


// Helper function to generate a random IBAN (simple version for demo)
function generateIban() {
  const country = 'LT';
  const checkDigits = Math.floor(10 + Math.random() * 90); // 2 digits
  const bankCode = '10000'; // 5 digits (can be changed if needed)
  const accountNumber = String(Math.floor(10000000000 + Math.random() * 90000000000)); // 11 digits
  return `${country}${checkDigits}${bankCode}${accountNumber}`;
}

// Route to create a new account for a user
app.post('/accounts', async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ message: 'userId is required' });
    }
    // Validate userId is a valid ObjectId
    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid userId format' });
    }
    // Optionally, check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const iban = generateIban();
   const account = new Account({ user: userId, iban, balance: 0 });
    await account.save();
    res.status(201).json({ message: 'Account created successfully', account });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create account', error: error.message });
  }
});

// Route to delete an account
app.delete('/accounts/:id', async (req, res) => {
  try {
    const account = await Account.findById(req.params.id);
    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }
    if (account.balance > 0) {
      return res.status(400).json({ message: 'Cannot delete account with balance greater than 0' });
    }
    await Account.findByIdAndDelete(req.params.id);
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete account', error: error.message });
  }
});
