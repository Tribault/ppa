const mongoose = require('mongoose')

const posterSchema = new mongoose.Schema({
    title : String,
    size : String,
    price: {
        type: Number,
        required: true,
        min: 0
    },
    note : String,
    image : String,
    totalStock: Number
})

posterSchema.methods.getAvailableStock = async function(){
    const Booking = mongoose.model('Booking')

    const result = await Booking.aggregate([
        {
      $match: {
        poster: this._id,
        status: 'pending'
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$quantity' }
      }
    }
    ])

    const bookedQty = result[0]?.total || 0
    return this.totalStock - bookedQty
}

module.exports = mongoose.model('Poster', posterSchema)