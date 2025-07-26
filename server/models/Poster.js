const mongoose = require('mongoose')

const posterSchema = new mongoose.Schema({
    title : String,
    size : String,
    price : Number,
    note : String,
    image : String,
    totalStock: Number
})

module.exports = mongoose.model('Poster', posterSchema)