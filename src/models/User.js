// models/User.js
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: false, unique: true },
  password: { type: String, required: false },
  role: { type: String, default: 'usuario' },
  githubId: { type: String },
});

// Antes de guardar, hashear la contraseña
userSchema.pre('save', function(next) {
  if (!this.isModified('password')) return next();

  const saltRounds = 10;
  bcrypt.hash(this.password, saltRounds, (err, hash) => {
    if (err) return next(err);

    this.password = hash;
    next();
  });
});

const UserModel = mongoose.model('User', userSchema);

export default UserModel;
