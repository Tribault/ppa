const mongoose = require('mongoose')

const posterSchema = new mongoose.Schema({
    title : String,
    description : String,
    image : String,
    quantity: {type: Number, default: 1},
    isBooked: {type: Boolean, default: false},
    bookedBy: {type: mongoose.Schema.Types.ObjectId, ref:'User', default: null }
})

module.exports = mongoose.model('Poster', posterSchema)