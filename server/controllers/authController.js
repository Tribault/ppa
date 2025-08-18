const User = require('../models/User')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const sendEmail = require('../utils/mailer')

const generateToken = (user) => {
    return jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: '1d'})
}

exports.signup = async (req, res) => {
    try {
        const user = await User.create(req.body)
        res.json({token: generateToken(user), user})
    }catch(err){
        res.status(400).json({message: err.message})
    }
}

exports.login = async (req, res) => {
    const {username, password} = req.body
    const user = await User.findOne({username})
    if(!user || !(await user.comparePassword(password))){
        return res.status(401).json({message: 'Invalid credentials'})
    }
    res.json({token: generateToken(user), user})
}

exports.fetchUser = async (req, res) => {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    }

exports.forgotPassword = async (req, res) => {
  const { email } = req.body

  try {
    const user = await User.findOne({ email })
    if (!user) {
      // Always respond the same way for security
      return res.json({ message: 'If an account exists, a reset link has been sent' })
    }

    // Generate token
    const token = crypto.randomBytes(32).toString('hex')
    user.resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex')
    user.resetPasswordExpires = Date.now() + 1000 * 60 * 15 // 15 minutes
    await user.save()

    // Build reset link
    const resetLink = `http://localhost:5173/reset-password?token=${token}`

     await sendEmail(
      user.email,
      'Password Reset Request',
      `
        <p>Hello ${user.username},</p>
        <p>You requested a password reset. Click below to reset your password:</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>This link expires in 15 minutes.</p>
        <p>If you didn’t request this, ignore this email.</p>
      `
    )


    res.json({ message: 'If an account exists, a reset link has been sent' })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}

exports.resetPassword = async (req, res) => {
  const { token, password } = req.body

  try {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex')

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    })

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' })
    }

    user.password = password // will be hashed by pre-save hook
    user.resetPasswordToken = undefined
    user.resetPasswordExpires = undefined
    await user.save()

    res.json({ message: 'Password successfully reset' })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}