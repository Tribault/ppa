const Poster = require('../models/Poster')
const fs = require('fs')
const path = require('path')
const { computeStockInfo } = require('../utils/stock')

exports.getPosters = async (req, res) => {
  const forSale = req.query.forSale
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 20
  const skip = (page - 1) * limit

  const { q } = req.query

  const filter = {}
  if (q) filter.title = { $regex: q, $options: 'i' }
  if (forSale) filter.forSale = true

  const [posters, total] = await Promise.all([
    Poster.find(filter)
      .populate('tags')
      .sort({ title: 1 })
      .skip(skip)
      .limit(limit),
    Poster.countDocuments(filter)
  ])

  // enrich each poster with stockInfo
  const postersWithStockInfo = await Promise.all(
    posters.map(async (poster) => {
      const stockInfo = await computeStockInfo(poster._id, poster.totalStock)
      return {
        ...poster.toObject(),
        stockInfo
      }
    })
  )

  res.json({
    data: postersWithStockInfo,
    total,
    page,
    pages: Math.ceil(total / limit)
  })
}

exports.getPoster = async (req, res) => {
  try {
    const poster = await Poster.findById(req.params.id).populate('tags')
    if (!poster) return res.status(404).json({ message: "Poster not found" })

    // Compute stock info
    const confirmedBookings = await Booking.aggregate([
      { $match: { poster: poster._id, status: 'confirmed' } },
      { $group: { _id: null, total: { $sum: '$quantity' } } }
    ])

    const pendingBookings = await Booking.aggregate([
      { $match: { poster: poster._id, status: 'pending' } },
      { $group: { _id: null, total: { $sum: '$quantity' } } }
    ])

    const confirmed = confirmedBookings[0]?.total || 0
    const pending = pendingBookings[0]?.total || 0
    const availableStock = poster.totalStock - confirmed - pending

    const posterWithStock = {
      ...poster.toObject(),
      stockInfo: {
        confirmed,
        pending,
        availableStock
      }
    }

    res.json(posterWithStock)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Server error" })
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

  try {
    // Handle image replacement
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

    // 🔑 Add stockInfo before responding
    const stockInfo = await computeStockInfo(poster._id, poster.totalStock)
    const posterObj = poster.toObject()
    posterObj.stockInfo = stockInfo

    res.json(posterObj)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Erreur serveur" })
  }
}

exports.deletePoster = async (req, res) => {
    const poster = await Poster.findByIdAndDelete(req.params.id)
    res.json({message: 'Poster deleted'})
}