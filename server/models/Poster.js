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
    totalStock: Number,
    forSale: {type: Boolean, default: false}
})


module.exports = mongoose.model('Poster', posterSchema)