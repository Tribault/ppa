const User = require('../models/User')
const bcrypt = require('bcryptjs')
const fr = require('../locales/fr')

exports.getUsers = async(req, res) => {
    try {

    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 20
    const skip = (page -1) * limit  

    const {q} = req.query
    const filter = {}

    if(q) filter.email = {$regex:q, $options:"i"}

        const [users, total] = await Promise.all([
         User.find(filter).select('-password')
        .sort({ title: 1 })
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
    res.status(500).json({ error: fr.user.failedToFetch })
  }
}

exports.getUser = async(req, res) => {
    try {
    const user = await User.findById(req.params.id).select('-password')
    res.json(user)
     } catch (err) {
    res.status(500).json({ error: fr.user.failedToFetchOne })
  }
}

exports.createUser = async (req, res) => {
  const { email, password, role } = req.body
  const existing = await User.findOne({ email })
  if (existing) return res.status(400).json({ error: fr.user.emailAlreadyInUse })
  const user = new User({ email, password, role })
  await user.save()
  const userObj = user.toObject()
  delete userObj.password
  res.status(201).json({ message: fr.user.created, user: userObj })
}

exports.updateUser = async (req, res) => {
    try {
    const { email, password, role } = req.body
    const updateData = { email, role }

    if (password) {
      updateData.password = await bcrypt.hash(password, 10)
    }

    const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true }).select('-password')
    if (!user) return res.status(404).json({ error: fr.user.notFound })
    res.json({ message: fr.user.updated, user })
  } catch (err) {
    res.status(500).json({ error: fr.user.failedToUpdate })
  }
}

exports.deleteUser = async (req, res) => {
     try {
    const poster = await User.findByIdAndDelete(req.params.id)
    res.json({ message: fr.user.deleted })
} catch (err) {
    res.status(500).json({ error: fr.user.failedToDelete })
  }
}