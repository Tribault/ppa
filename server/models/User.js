const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const validator = require('validator')
const crypto = require('crypto')

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    validate: validator.isEmail,
  },
  password: { type: String, required: true },
   role: {type: String, enum: ['user', 'admin'], default: 'user'},
  isVerified: { type: Boolean, default: false },
  verificationToken: String,
  verificationTokenExpires: Date,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
})

//hash passwords
userSchema.pre('save', async function (params) {
    if (!this.isModified('password')) return
    this.password = await bcrypt.hash(this.password, 10)
})

userSchema.methods.comparePassword = function (password){
    return bcrypt.compare(password, this.password)
}

userSchema.methods.generateVerificationToken = function () {
  const token = crypto.randomBytes(32).toString('hex')
  this.verificationToken = crypto.createHash('sha256').update(token).digest('hex')
  this.verificationTokenExpires = Date.now() + 1000 * 60 * 60 * 24 * 2// 24h
  return token
}

module.exports = mongoose.model('User', userSchema)
