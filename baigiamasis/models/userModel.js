import { Schema, model } from 'mongoose';

const userSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  personalCode: { type: String, unique: true, required: true },
  password: { type: String, required: true }
});

const User = model('User', userSchema);
export default User;