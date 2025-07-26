import mongoose from 'mongoose';

const saleSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  poster: { type: mongoose.Schema.Types.ObjectId, ref: 'Poster', required: true },
  quantity: { type: Number, required: true },
  validatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Booking', bookingSchema)
