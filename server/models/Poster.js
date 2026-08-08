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
    tags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }],
    locations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Location' }],
    totalStock: Number,
    forSale: {type: Boolean, default: false},
    filmmaker: String,
    year: Number,
    mainActors: [String],
    genre: String,
    country: String
}, { timestamps: true })


module.exports = mongoose.model('Poster', posterSchema)