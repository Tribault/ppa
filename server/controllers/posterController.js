const Poster = require('../models/Poster')
const fs = require('fs')
const path = require('path')

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
      const Booking = require('../models/Booking')

      // aggregate confirmed + pending bookings
      const aggregation = await Booking.aggregate([
        { $match: { poster: poster._id } },
        {
          $group: {
            _id: '$status',
            total: { $sum: '$quantity' }
          }
        }
      ])

      // extract counts
      const confirmed = aggregation
        ? aggregation.filter((a) => a._id === 'validated').reduce((sum, a) => sum + a.total, 0)
        : 0
      const pending = aggregation
        ? aggregation.filter((a) => a._id === 'pending').reduce((sum, a) => sum + a.total, 0)
        : 0

      const availableStock = poster.totalStock - pending - confirmed

      return {
        ...poster.toObject(),
        stockInfo: {
          confirmed,
          pending,
          availableStock
        }
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

    // Handle stock integrity check
    if (req.body.totalStock !== undefined) {
      const newStock = Number(req.body.totalStock)

      // Count confirmed bookings
      const confirmedBookings = await Booking.aggregate([
        { $match: { poster: poster._id, status: "validated" } },
        { $group: { _id: null, total: { $sum: "$quantity" } } }
      ])

      const confirmedCount = confirmedBookings[0]?.total || 0

      if (newStock < confirmedCount) {
        return res.status(400).json({
          message: `Impossible de définir le stock à ${newStock}. 
                    Il y a déjà ${confirmedCount} affiches confirmées.`
        })
      }

      poster.totalStock = newStock
    }

    // Assign other fields (excluding stock since already handled above)
    const { totalStock, ...rest } = req.body
    Object.assign(poster, rest)

    await poster.save()

    // Recalculate stock info
    const [confirmedAgg, pendingAgg] = await Promise.all([
      Booking.aggregate([
        { $match: { poster: poster._id, status: "validated" } },
        { $group: { _id: null, total: { $sum: "$quantity" } } }
      ]),
      Booking.aggregate([
        { $match: { poster: poster._id, status: "pending" } },
        { $group: { _id: null, total: { $sum: "$quantity" } } }
      ])
    ])

    const confirmed = confirmedAgg[0]?.total || 0
    const pending = pendingAgg[0]?.total || 0
    const availableStock = poster.totalStock - confirmed

    res.json({
      ...poster.toObject(),
      stockInfo: {
        confirmed,
        pending,
        availableStock
      }
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Erreur serveur" })
  }
}

exports.deletePoster = async (req, res) => {
    const poster = await Poster.findByIdAndDelete(req.params.id)
    res.json({message: 'Poster deleted'})
}