const mongoose = require('mongoose')

const saleDateSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  updatedAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('SaleDate', saleDateSchema)
