const Poster = require('../models/Poster')
const Booking = require('../models/Booking')
const User = require('../models/User')
const { computeStockInfo } = require('../utils/stock')
const sendEmail = require('../utils/mailer')
const t = require('../locales/fr')

function alertAdminOfNewBooking(userEmail, reference, bookings) {
  if (!process.env.ADMIN_EMAIL) return
  sendEmail(
    process.env.ADMIN_EMAIL,
    t.email.newBookingAdminSubject,
    t.email.newBookingAdminBody(userEmail, reference, bookings)
  ).catch((err) => console.error('Failed to send admin new-booking alert', err))
}

exports.createOrUpdateBooking = async (req, res) => {
  try {
    const isAdmin = req.user.role === 'admin'
    const { posterId, quantity } = req.body

    // Non-admins can only ever book/update for themselves and can't set status directly
    // (status flows through the admin validation workflow) — ignore anything they send for these.
    const userId = isAdmin ? req.body.userId : req.user.id
    const status = isAdmin ? req.body.status : undefined

    // basic validations
    if (!posterId || !userId || typeof quantity !== 'number') {
      return res.status(400).json({ error: req.t.booking.missingFields })
    }

    const poster = await Poster.findById(posterId)
    if (!poster) return res.status(404).json({ error: req.t.booking.posterNotFound })

    const user = await User.findById(userId)
    if (!user) return res.status(404).json({ error: req.t.booking.userNotFound })

    // compute stock info before modification
    const stockInfo = await computeStockInfo(poster._id, poster.totalStock)

    let booking = await Booking.findOne({ user: userId, poster: posterId })
    let isNew = false

    if (booking) {
      // UPDATE existing booking (quantity is absolute)
      const allowedMax = (stockInfo.availableStock || 0) + (booking.quantity || 0)

      if (quantity > allowedMax) {
        return res.status(400).json({ error: req.t.booking.notEnoughStock })
      }

      booking.quantity = quantity
      if (status) booking.status = status

      if (status) {
        if (status === 'validated') {
          if (!booking.validatedAt) {
            booking.validatedAt = new Date()
            booking.validatedBy = req.user ? req.user._id : undefined
          }
        } else {
          booking.validatedAt = null
          booking.validatedBy = null
        }
      }

      await booking.save()

      // populate then attach fresh stockInfo
      await booking.populate([{ path: 'poster' }, { path: 'user', select: 'email' }])
      const result = booking.toObject()
      result.poster.stockInfo = await computeStockInfo(poster._id, poster.totalStock)

      return res.status(200).json(result)
    } else {
      // CREATE new booking
      if (quantity > (stockInfo.availableStock || 0)) {
        return res.status(400).json({ error: req.t.booking.notEnoughStock })
      }

      booking = new Booking({
        user: user._id,
        poster: poster._id,
        quantity,
        status: status || 'pending',
        priceAtBooking: poster.price
      })

      if (booking.status === 'validated') {
        booking.validatedAt = new Date()
        booking.validatedBy = req.user ? req.user._id : undefined
      }

      await booking.save()
      isNew = true

      // populate then attach fresh stockInfo
      await booking.populate([{ path: 'poster' }, { path: 'user', select: 'email' }])
      const result = booking.toObject()
      result.poster.stockInfo = await computeStockInfo(poster._id, poster.totalStock)

      alertAdminOfNewBooking(user.email, result.reference, [result])

      return res.status(isNew ? 201 : 200).json(result)
    }
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: req.t.booking.serverError })
  }
}


exports.createBasket = async (req, res) => {
  try {
    const { items } = req.body
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: req.t.booking.missingFields })
    }

    const userId = req.user.id
    const plans = []

    for (const item of items) {
      const { posterId, quantity } = item || {}
      if (!posterId || typeof quantity !== 'number' || quantity < 1) {
        return res.status(400).json({ error: req.t.booking.missingFields })
      }

      const poster = await Poster.findById(posterId)
      if (!poster) return res.status(404).json({ error: req.t.booking.posterNotFound })

      const stockInfo = await computeStockInfo(poster._id, poster.totalStock)
      const existing = await Booking.findOne({ user: userId, poster: posterId })
      const allowedMax = (stockInfo.availableStock || 0) + (existing?.quantity || 0)

      if (quantity > allowedMax) {
        return res.status(400).json({ error: req.t.booking.notEnoughStock })
      }

      plans.push({ poster, quantity, existing })
    }

    const saved = []
    for (const { poster, quantity, existing } of plans) {
      const booking = existing || new Booking({
        user: userId,
        poster: poster._id,
        status: 'pending',
        priceAtBooking: poster.price
      })
      booking.quantity = quantity
      await booking.save()
      saved.push(booking)
    }

    const populated = await Promise.all(saved.map(async (b) => {
      await b.populate([{ path: 'poster' }, { path: 'user', select: 'email' }])
      const obj = b.toObject()
      obj.poster.stockInfo = await computeStockInfo(obj.poster._id, obj.poster.totalStock)
      return obj
    }))

    if (populated.length) {
      alertAdminOfNewBooking(populated[0].user.email, populated[0].reference, populated)
    }

    res.status(201).json({ reference: populated[0]?.reference || null, bookings: populated })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: req.t.booking.serverError })
  }
}

exports.updateBasketStatus = async (req, res) => {
  try {
    const { reference } = req.params
    const { status } = req.body

    if (!['ready', 'validated'].includes(status)) {
      return res.status(400).json({ error: req.t.booking.invalidStatus })
    }

    const bookings = await Booking.find({ reference })
    if (bookings.length === 0) return res.status(404).json({ error: req.t.booking.notFound })

    for (const booking of bookings) {
      booking.status = status
      if (status === 'validated') {
        if (!booking.validatedAt) {
          booking.validatedAt = new Date()
          booking.validatedBy = req.user._id
        }
      } else {
        booking.validatedAt = null
        booking.validatedBy = null
      }
      await booking.save()
    }

    res.json({ message: req.t.booking.basketUpdated })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: req.t.booking.serverError })
  }
}

const SORTABLE_BOOKING_FIELDS = {
  reference: 'reference',
  userEmail: 'user.email',
  posterTitle: 'poster.title',
  quantity: 'quantity',
  totalPrice: 'totalPrice',
  bookedAt: 'bookedAt',
  status: 'status',
}

exports.getBookings = async (req, res) => {
      const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 20
    const skip = (page -1) * limit


  let filter = {}

    if (req.user.role !== 'admin') {
      filter.user = req.user._id
    } else if (!req.query.all) {
      filter.user = req.user._id
    }

    if (req.query.q && req.user.role === 'admin') {
      const matchingUsers = await User.find({
        email: { $regex: req.query.q, $options: 'i' }
      }).select('_id')
      filter.user = { $in: matchingUsers.map(u => u._id) }
    }

  const sortField = SORTABLE_BOOKING_FIELDS[req.query.sortBy] || 'bookedAt'
  const sortDirection = req.query.sortDir === 'asc' ? 1 : -1

    const [bookings, total] = await Promise.all([
    Booking.aggregate([
      { $match: filter },
      { $lookup: { from: 'users', localField: 'user', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $lookup: { from: 'posters', localField: 'poster', foreignField: '_id', as: 'poster' } },
      { $unwind: '$poster' },
      { $addFields: { totalPrice: { $multiply: ['$quantity', '$priceAtBooking'] } } },
      { $project: { 'user.password': 0 } },
      { $sort: { [sortField]: sortDirection } },
      { $skip: skip },
      { $limit: limit },
    ]),
    Booking.countDocuments(filter)
  ])

  const enriched = await Promise.all(
    bookings.map(async (b) => {
      const stockInfo = await computeStockInfo(b.poster._id, b.poster.totalStock)
      b.poster.stockInfo = stockInfo
      return b
    })
  )

  res.json({
    data: enriched,
    total,
    page,
    pages: Math.ceil(total / limit)
  })
}

exports.deleteBooking = async (req, res) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) return res.status(404).json({ error: req.t.booking.notFound });

  if (
    booking.user.toString() !== req.user.id &&
    req.user.role !== 'admin'
  ) {
    return res.status(403).json({ error: req.t.booking.notAuthorized });
  }

  if (booking.status !== 'pending') {
    return res.status(400).json({ error: req.t.booking.onlyPendingCanBeCancelled });
  }

  await Booking.findByIdAndDelete(req.params.id)

  res.json({ message: req.t.booking.cancelled });
}

