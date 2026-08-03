const Message = require('../models/Message')

exports.getMessage =  async (req, res) => {
  try {
    const msg = await Message.findOne().sort({ updatedAt: -1 })
    res.json(msg)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

exports.upsertMessage =  async (req, res) => {
 const { content } = req.body
  let msg = await Message.findOne()
  if (msg) {
    msg.content = content
    msg.updatedAt = Date.now()
    await msg.save()
  } else {
    msg = await Message.create({ content })
  }
  res.json(msg)
}

exports.toggleBooking =  async (req, res) => {
  let msg = await Message.findOne()
  if (msg) {
    msg.bookingAllowed = !msg.bookingAllowed
    await msg.save()
  } else {
    msg = await Message.create({ content: req.t.message.defaultContent })
  }
  res.json(msg)
}