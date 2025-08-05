const User = require('../models/User')

exports.getUsers = async(req, res) => {
    try {
    const users = await User.find().select('-password')
    res.json(users)
    } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' })
  }
}

exports.getUser = async(req, res) => {
    try {
    const user = await User.findById(req.params.id).select('-password')
    res.json(user)
     } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user' })
  }
}

exports.createUser = async (req, res) => {
   const { name, email, password, role } = req.body
    const existing = await User.findOne({ email })
    if (existing) return res.status(400).json({ error: 'Email already in use' })
    const user = new User({ name, email, password, role })
    await user.save()
    res.status(201).json({ message: 'User created', user: { ...user._doc, password: undefined } })
}

exports.updateUser = async (req, res) => {
    try {
    const { name, email, password, role } = req.body
    const updateData = { name, email, role }

    if (password) {
      updateData.password = await bcrypt.hash(password, 10)
    }

    const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true }).select('-password')
    if (!user) return res.status(404).json({ error: 'User not found' })
    res.json({ message: 'User updated', user })
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user' })
  }
}

exports.deleteUser = async (req, res) => {
     try {
    const poster = await User.findByIdAndDelete(req.params.id)
     if (!user) return res.status(404).json({ error: 'User not found' })
    res.json({message: 'User deleted'})
} catch (err) {
    res.status(500).json({ error: 'Failed to delete user' })
  }
}