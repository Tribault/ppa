const User = require('../models/User')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const sendEmail = require('../utils/mailer')

const generateToken = (u) => {
    return jwt.sign({id: u._id, role: u.role}, process.env.JWT_SECRET, {expiresIn: '1d'})
}


exports.signup = async (req, res) => {
   try {
     const { email, password } = req.body

    const existing = await User.findOne({ email })
    if (existing) return res.status(400).json({ message: 'Email already in use' })

    const user = new User({ email, password })

    // generate raw token, store its hashed form on user
    const token = crypto.randomBytes(32).toString('hex')
    user.verificationToken = crypto.createHash('sha256').update(token).digest('hex')
    user.verificationTokenExpires = Date.now() + 1000 * 60 * 60 * 24 // 24 hours

    await user.save()

    // Send link to the frontend verify page — frontend will POST the token
    const FRONT_URL = process.env.FRONTEND_URL || 'http://localhost:5173'
    const verifyLink = `${FRONT_URL}/verify-email?token=${token}`

    await sendEmail(
      user.email,
      'Verify your email',
      `<p>Hello ${user.email},</p>
       <p>Click the link to verify your email:</p>
       <a href="${verifyLink}">${verifyLink}</a>
       <p>This link expires in 24 hours.</p>`
    )

    return res.json({ message: 'Signup successful — check your email for verification link.' })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

exports.verifyEmail = async (req, res) => {
  const { token } = req.body
   if (!token) return res.status(400).json({ message: 'Missing token' })

  try {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex')
    const user = await User.findOne({
      verificationToken: hashedToken,
      verificationTokenExpires: { $gt: Date.now() },
    })

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification token' })
    }

    user.isVerified = true
    user.verificationToken = undefined
    user.verificationTokenExpires = undefined
    await user.save()

    res.json({ message: 'Email verified successfully! You can now log in.' })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}

exports.login = async (req, res) => {
   const { email, password } = req.body
  const user = await User.findOne({ email })
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: 'Invalid credentials' })
  }

  if (!user.isVerified) {
    return res.status(403).json({ message: 'Not verified.' })
  }

  res.json({ token: generateToken(user), user })
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
    const FRONT_URL = process.env.FRONTEND_URL || 'http://localhost:5173'
    const resetLink = `${FRONT_URL}/reset-password?token=${token}`

     await sendEmail(
      user.email,
      'Password Reset Request',
      `
        <p>Hello ${user.email},</p>
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

exports.resendEmail = async (req, res) => {
  const { email } = req.body
  try {
    const user = await User.findOne({ email })

    if (!user) {
      // Do not reveal if user exists for security reasons
      return res.json({ message: 'If your account exists, a new verification email has been sent.' })
    }

    if (user.isVerified) {
      return res.json({ message: 'Your email is already verified.' })
    }

    // Generate a new verification token
    const token = crypto.randomBytes(32).toString('hex')
    user.verificationToken = crypto.createHash('sha256').update(token).digest('hex')
    user.verificationTokenExpires = Date.now() + 1000 * 60 * 60 * 2 // 1 hour
    await user.save()

    const verifyLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${token}`

    await sendEmail(
      user.email,
      'Verify Your Email',
      `
        <p>Hello ${user.email},</p>
        <p>Click below to verify your email:</p>
        <a href="${verifyLink}">${verifyLink}</a>
        <p>This link will expire in 1 hour.</p>
      `
    )

    res.json({ message: 'If your account exists, a new verification email has been sent.' })
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