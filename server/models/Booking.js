const mongoose = require('mongoose')

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  poster: { type: mongoose.Schema.Types.ObjectId, ref: 'Poster', required: true },
  quantity: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'validated', 'cancelled'], default: 'pending' },
  bookedAt: { type: Date, default: Date.now },
  priceAtBooking: { type: Number, required: true }
});

module.exports = mongoose.model('Booking', bookingSchema)
