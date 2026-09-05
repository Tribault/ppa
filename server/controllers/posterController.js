const Poster = require('../models/Poster')
const fs = require('fs')
const path = require('path')
const { computeStockInfo } = require('../utils/stock')

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function genreFilterRegex(genre) {
  return new RegExp(`(^|,\\s*)${escapeRegex(genre)}\\s*(,|$)`, 'i')
}

exports.getPosters = async (req, res) => {
  const forSale = req.query.forSale
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 20
  const skip = (page - 1) * limit

  const { q, sort, sortBy, sortDir, country, genre, tags } = req.query

  const filter = {}
  if (q) filter.title = { $regex: q, $options: 'i' }
  if (forSale) filter.forSale = true
  if (country) filter.country = country
  if (genre) filter.genre = genreFilterRegex(genre)
  if (tags) filter.tags = tags

  const SORTABLE_POSTER_FIELDS = ['title', 'size', 'price', 'totalStock', 'forSale', 'createdAt']
  const sortOption = SORTABLE_POSTER_FIELDS.includes(sortBy)
    ? { [sortBy]: sortDir === 'desc' ? -1 : 1 }
    : sort === 'newest' ? { createdAt: -1 } : { title: 1 }

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

  const [countries, rawGenres] = await Promise.all([
    Poster.distinct('country', filter),
    Poster.distinct('genre', filter),
  ])

  const genres = [...new Set(
    rawGenres.flatMap((g) => (g || '').split(',').map((part) => part.trim()).filter(Boolean))
  )].sort()

  res.json({
    countries: countries.filter(Boolean).sort(),
    genres,
  })
}

exports.checkDuplicateTitle = async (req, res) => {
  const title = (req.query.title || '').trim()
  if (!title) return res.json({ exists: false })

  const filter = { title: { $regex: `^${escapeRegex(title)}$`, $options: 'i' } }
  if (req.query.excludeId) filter._id = { $ne: req.query.excludeId }

  const poster = await Poster.findOne(filter).select('_id title')
  res.json({ exists: !!poster, poster: poster ? { _id: poster._id, title: poster.title } : null })
}

exports.getPoster = async (req, res) => {
  try {
    const isAdmin = req.user?.role === 'admin'
    const query = Poster.findById(req.params.id).populate('tags')
    if (isAdmin) query.populate('locations')
    const poster = await query
    if (!poster) return res.status(404).json({ message: req.t.poster.notFound })

    const stockInfo = await computeStockInfo(poster._id, poster.totalStock)

    const posterWithStock = {
      ...poster.toObject(),
      stockInfo
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