const mongoose = require('mongoose')

const saleSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  poster: { type: mongoose.Schema.Types.ObjectId, ref: 'Poster', required: true },
  quantity: { type: Number, required: true },
  validatedAt: { type: Date, default: Date.now },
  validatedBy: {type: mongoose.Schema.ObjectId, ref: 'User', required: true},
  priceAtSale: { type: Number, required: true }
});

module.exports = mongoose.model('Sale', saleSchema)
