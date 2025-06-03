import { Schema, model } from 'mongoose';

const accountSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  iban: { type: String, required: true, unique: true },
  balance: { type: Number, default: 0 },
});

const Account = model('Account', accountSchema);
export default Account;