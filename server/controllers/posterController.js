const Poster = require('../models/Poster')

exports.getAllPosters = async(req, res) => {
    const posters = await Poster.find()

    const withAvailableStock = await Promise.all(
        posters.map(async (poster) => {
            const available = await poster.getAvailableStock()
            return{
                ...poster.toObject(),
                availableStock: available
            }
        })
    )
    res.json(withAvailableStock)
}

exports.createPoster = async (req, res) => {
    const {title, size, price, note, totalStock} = req.body
    const image = req.file?.filename || ''
    const poster = await Poster.create({title, size, price, note, totalStock, image})
    res.json(poster)
}

exports.updatePoster = async (req, res) => {
    const updated = await Poster.findByIdAndUpdate(req.params.id, req.body, {new: true})
    res.json(updated)
}

exports.deletePoster = async (req, res) => {
    const poster = await Poster.findByIdAndDelete(req.params.id)
    res.json({message: 'Poster deleted'})
}