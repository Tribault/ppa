const Poster = require('../models/Poster')
const Booking = require('../models/Booking')
const fs = require('fs')
const path = require('path')
const { computeStockInfo } = require('../utils/stock')

exports.getPosters = async (req, res) => {
  const forSale = req.query.forSale
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 20
  const skip = (page - 1) * limit

  const { q, sort, country, genre, tags } = req.query

  const filter = {}
  if (q) filter.title = { $regex: q, $options: 'i' }
  if (forSale) filter.forSale = true
  if (country) filter.country = country
  if (genre) filter.genre = genre
  if (tags) filter.tags = tags

  const sortOption = sort === 'newest' ? { createdAt: -1 } : { title: 1 }

  const isAdmin = req.user?.role === 'admin'

  const query = Poster.find(filter).populate('tags')
  if (isAdmin) query.populate('locations')

  const [posters, total] = await Promise.all([
    query.sort(sortOption).skip(skip).limit(limit),
    Poster.countDocuments(filter)
  ])

  // enrich each poster with stockInfo
  const postersWithStockInfo = await Promise.all(
    posters.map(async (poster) => {
      const stockInfo = await computeStockInfo(poster._id, poster.totalStock)
      const posterObj = { ...poster.toObject(), stockInfo }
      if (!isAdmin) delete posterObj.locations
      return posterObj
    })
  )

  res.json({
    data: postersWithStockInfo,
    total,
    page,
    pages: Math.ceil(total / limit)
  })
}

exports.getPosterFilters = async (req, res) => {
  const filter = {}
  if (req.query.forSale) filter.forSale = true

  const [countries, genres] = await Promise.all([
    Poster.distinct('country', filter),
    Poster.distinct('genre', filter),
  ])

  res.json({
    countries: countries.filter(Boolean).sort(),
    genres: genres.filter(Boolean).sort(),
  })
}

exports.getPoster = async (req, res) => {
  try {
    const isAdmin = req.user?.role === 'admin'
    const query = Poster.findById(req.params.id).populate('tags')
    if (isAdmin) query.populate('locations')
    const poster = await query
    if (!poster) return res.status(404).json({ message: req.t.poster.notFound })

    // Compute stock info
    const confirmedBookings = await Booking.aggregate([
      { $match: { poster: poster._id, status: 'validated' } },
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
    if (!isAdmin) delete posterWithStock.locations

    res.json(posterWithStock)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: req.t.poster.serverError })
  }
}

exports.createPoster = async (req, res) => {
    const {title, size, price, note, totalStock, tags, locations, filmmaker, year, mainActors, genre, country, image: bodyImage} = req.body
    const image = req.file?.filename || bodyImage || ''
    const poster = await Poster.create({title, size, price, note, totalStock, image, tags, locations, filmmaker, year, mainActors, genre, country})
    res.json(poster)
}

exports.updatePoster = async (req, res) => {
  const { id } = req.params
  const poster = await Poster.findById(id)
  if (!poster) return res.status(404).json({ message: req.t.poster.notFound })

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
    res.status(500).json({ message: req.t.poster.serverError })
  }
}

exports.deletePoster = async (req, res) => {
    const poster = await Poster.findByIdAndDelete(req.params.id)
    res.json({ message: req.t.poster.deleted })
}