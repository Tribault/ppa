const Poster = require('../models/Poster')

exports.getAllPosters = async(req, res) => {
    const posters = await Poster.find()
    res.json(posters)
}

exports.createPoster = async (req, res) => {
    const {title, description} = req.body
    const image = req.file?.filename || ''
    const poster = await Poster.create({title, description, image})
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

exports.bookPoster = async (req, res) => {
    const poster = await Poster.findById(req.params.id)
    if(poster.isBooked) return res.status(400).json({message: 'Already booked'})
    
    poster.isBooked = true
    poster.bookedBy = req.user._id
    await poster.save()
    res.json(poster)
}