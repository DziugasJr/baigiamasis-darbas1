const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  iban: { type: String, required: true, unique: true },
  balance: { type: Number, default: 0 },
});

const Account = mongoose.model('Account', accountSchema);
module.exports = Account;