const mongoose = require('mongoose')
const Counter = require('./Counter')

const bookingSchema = new mongoose.Schema({
  reference: { type: String },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  poster: { type: mongoose.Schema.Types.ObjectId, ref: 'Poster', required: true },
  quantity: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'ready', 'validated', 'cancelled'], default: 'pending' },
  bookedAt: { type: Date, default: Date.now },
  priceAtBooking: { type: Number, required: true },
  validatedAt: { type: Date, default: null },
  validatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  reminder7SentAt: { type: Date, default: null },
  reminder1SentAt: { type: Date, default: null },
  overdueReminderSentAt: { type: Date, default: null },
  adminOverdue7SentAt: { type: Date, default: null },
  adminOverdue30SentAt: { type: Date, default: null }
});

bookingSchema.index({ user: 1, poster: 1 }, { unique: true })

bookingSchema.pre('save', async function (next) {
  if (this.reference) return next()

  const openBasketBooking = await this.constructor.findOne({
    user: this.user,
    status: { $in: ['pending', 'ready'] },
    reference: { $ne: null },
  })
  if (openBasketBooking) {
    this.reference = openBasketBooking.reference
    return next()
  }

  const counter = await Counter.findByIdAndUpdate(
    'bookingReference',
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  )
  this.reference = `RES-${String(counter.seq).padStart(6, '0')}`
  next()
})

module.exports = mongoose.model('Booking', bookingSchema)
