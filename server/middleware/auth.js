const jwt = require('jsonwebtoken')
const User = require('../models/User')

exports.authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: req.t.auth.noToken })
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    const user = await User.findById(decoded.id).select('email role isVerified')

    if (!user) {
      return res.status(401).json({ message: req.t.auth.userNotFound })
    }

    if (!user.isVerified) {
      return res.status(403).json({ message: req.t.auth.emailNotVerified })
    }

    req.user = user
    next()
  } catch (err) {
    return res.status(401).json({ message: req.t.auth.invalidOrExpiredToken })
  }
}

exports.optionalAuthenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next()
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.id).select('email role isVerified')
    if (user && user.isVerified) {
      req.user = user
    }
  } catch (err) {
  }

  next()
}

exports.authorize = (...roles) => {
    return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: req.t.auth.notAuthenticated })
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: req.t.auth.forbidden })
    }

    next()
  }
}