const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema({
  content: { type: String, required: true },
  bookingAllowed: {type: Boolean, default: true},
  updatedAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Message', messageSchema)