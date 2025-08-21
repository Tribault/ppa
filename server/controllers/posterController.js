const Poster = require('../models/Poster')
const fs = require('fs')
const path = require('path')

exports.getAllPosters = async(req, res) => {
    const posters = await Poster.find().populate('tags').sort({ title: 1 })

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

exports.getPoster = async (req, res) => {
  try {
    const poster = await Poster.findById(req.params.id).populate('tags')
    if (!poster) {
      return res.status(404).json({ error: 'Poster not found' })
    }

    const availableStock = await poster.getAvailableStock()
    res.json({
      ...poster.toObject(),
      availableStock
    })
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
}

exports.createPoster = async (req, res) => {
    const {title, size, price, note, totalStock, tags} = req.body
    const image = req.file?.filename || ''
    const poster = await Poster.create({title, size, price, note, totalStock, image, tags})
    res.json(poster)
}

exports.updatePoster = async (req, res) => {
 const { id } = req.params
    const poster = await Poster.findById(id)
    if (!poster) return res.status(404).json({ message: "Poster not found" })

    if (req.file) {
      if (poster.image) {
        const oldPath = path.join("uploads", poster.image)
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath)
        }
      }
      poster.image = req.file.filename
    }

    Object.assign(poster, req.body)

    await poster.save()
    res.json(poster)
}

exports.deletePoster = async (req, res) => {
    const poster = await Poster.findByIdAndDelete(req.params.id)
    res.json({message: 'Poster deleted'})
}