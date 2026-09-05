const User = require('../models/User')
const bcrypt = require('bcryptjs')

exports.getUsers = async(req, res) => {
    try {

    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 20
    const skip = (page -1) * limit  

    const {q, sortBy, sortDir} = req.query
    const filter = {}

    if(q) filter.email = {$regex:q, $options:"i"}

    const SORTABLE_USER_FIELDS = ['email', 'role']
    const sortField = SORTABLE_USER_FIELDS.includes(sortBy) ? sortBy : 'email'
    const sortOption = { [sortField]: sortDir === 'desc' ? -1 : 1 }

        const [users, total] = await Promise.all([
         User.find(filter).select('-password')
        .sort(sortOption)
        .skip(skip)
        .limit(limit),
        User.countDocuments(filter)
      ])
        
    res.json({
      data: users,
      total,
      page,
      pages: Math.ceil(total / limit)
    })

    } catch (err) {
    res.status(500).json({ error: req.t.user.failedToFetch })
  }
}

exports.getUser = async(req, res) => {
    try {
    const user = await User.findById(req.params.id).select('-password')
    res.json(user)
     } catch (err) {
    res.status(500).json({ error: req.t.user.failedToFetchOne })
  }
}

exports.createUser = async (req, res) => {
  try {
    const { email, password, role } = req.body
    const existing = await User.findOne({ email })
    if (existing) return res.status(400).json({ error: req.t.user.emailAlreadyInUse })
    const user = new User({ email, password, role })
    await user.save()
    const userObj = user.toObject()
    delete userObj.password
    res.status(201).json({ message: req.t.user.created, user: userObj })
  } catch (err) {
    if (err.errors?.email) {
      const error = err.errors.email.kind === 'required' ? req.t.validation.emailRequired : req.t.validation.invalidEmail
      return res.status(400).json({ error })
    }
    if (err.errors?.password) {
      return res.status(400).json({ error: req.t.validation.passwordRequired })
    }
    res.status(500).json({ error: req.t.user.failedToCreate })
  }
}

exports.updateUser = async (req, res) => {
    try {
    const isAdmin = req.user.role === 'admin'
    const isSelf = req.params.id === req.user.id

    if (!isAdmin && !isSelf) {
      return res.status(403).json({ error: req.t.user.notAuthorized })
    }

    const { email, password, role } = req.body
    const updateData = { email }
    // Only admins can change role — a self-service update must never let a user escalate themselves.
    if (isAdmin && role) updateData.role = role

    if (password) {
      updateData.password = await bcrypt.hash(password, 10)
    }

    const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true }).select('-password')
    if (!user) return res.status(404).json({ error: req.t.user.notFound })
    res.json({ message: req.t.user.updated, user })
  } catch (err) {
    res.status(500).json({ error: req.t.user.failedToUpdate })
  }
}

exports.deleteUser = async (req, res) => {
     try {
    const poster = await User.findByIdAndDelete(req.params.id)
    res.json({ message: req.t.user.deleted })
} catch (err) {
    res.status(500).json({ error: req.t.user.failedToDelete })
  }
}