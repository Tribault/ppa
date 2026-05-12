const Poster = require('../models/Poster')
const Booking = require('../models/Booking')
const Sale = require('../models/Sale')
const User = require('../models/User')
const { computeStockInfo } = require('../utils/stock')
const fr = require('../locales/fr')

exports.createOrUpdateBooking = async (req, res) => {
  try {
    const { posterId, quantity, userId, status } = req.body

    // basic validations
    if (!posterId || !userId || typeof quantity !== 'number') {
      return res.status(400).json({ error: fr.booking.missingFields })
    }

    const poster = await Poster.findById(posterId)
    if (!poster) return res.status(404).json({ error: fr.booking.posterNotFound })

    const user = await User.findById(userId)
    if (!user) return res.status(404).json({ error: fr.booking.userNotFound })

    // compute stock info before modification
    const stockInfo = await computeStockInfo(poster._id, poster.totalStock)

    let booking = await Booking.findOne({ user: userId, poster: posterId })
    let isNew = false

    if (booking) {
      // UPDATE existing booking (quantity is absolute)
      const allowedMax = (stockInfo.availableStock || 0) + (booking.quantity || 0)

      if (quantity > allowedMax) {
        return res.status(400).json({ error: fr.booking.notEnoughStock })
      }

      booking.quantity = quantity
      if (status) booking.status = status

      await booking.save()

      // handle sale creation/deletion after save
      if (status) {
        if (status === 'validated') {
          const existingSale = await Sale.findOne({ user: booking.user, poster: booking.poster })
          if (!existingSale) {
            await Sale.create({
              quantity: booking.quantity,
              poster: booking.poster,
              user: booking.user,
              validatedBy: req.user ? req.user._id : undefined,
              priceAtSale: booking.priceAtBooking
            })
          }
        } else if (status === 'pending') {
          await Sale.deleteOne({ user: booking.user, poster: booking.poster })
        }
      }

      // populate then attach fresh stockInfo
      await booking.populate([{ path: 'poster' }, { path: 'user', select: 'email' }])
      const result = booking.toObject()
      result.poster.stockInfo = await computeStockInfo(poster._id, poster.totalStock)

      return res.status(200).json(result)
    } else {
      // CREATE new booking
      if (quantity > (stockInfo.availableStock || 0)) {
        return res.status(400).json({ error: fr.booking.notEnoughStock })
      }

      booking = new Booking({
        user: user._id,
        poster: poster._id,
        quantity,
        status: status || 'pending',
        priceAtBooking: poster.price
      })

      await booking.save()
      isNew = true

      // if the booking is created already validated, create a sale
      if (booking.status === 'validated') {
        await Sale.create({
          quantity: booking.quantity,
          poster: booking.poster,
          user: booking.user,
          validatedBy: req.user ? req.user._id : undefined,
          priceAtSale: booking.priceAtBooking
        })
      }

      // populate then attach fresh stockInfo
      await booking.populate([{ path: 'poster' }, { path: 'user', select: 'email' }])
      const result = booking.toObject()
      result.poster.stockInfo = await computeStockInfo(poster._id, poster.totalStock)

      return res.status(isNew ? 201 : 200).json(result)
    }
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: fr.booking.serverError })
  }
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

    const [bookings, total] = await Promise.all([
     Booking.find(filter)
    .populate('user')
    .populate('poster')
    .sort({ title: 1 })
    .skip(skip)
    .limit(limit),
    Booking.countDocuments(filter)
  ])

  const enriched = await Promise.all(
    bookings.map(async (b) => {
      const obj = b.toObject()
      const stockInfo = await computeStockInfo(obj.poster._id, obj.poster.totalStock)
      obj.poster.stockInfo = stockInfo
      return obj
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

  if (!booking) return res.status(404).json({ error: fr.booking.notFound });

  if (
    booking.user.toString() !== req.user.id &&
    req.user.role !== 'admin'
  ) {
    return res.status(403).json({ error: fr.booking.notAuthorized });
  }

  if (booking.status !== 'pending') {
    return res.status(400).json({ error: fr.booking.onlyPendingCanBeCancelled });
  }

  await Booking.findByIdAndDelete(req.params.id)

  res.json({ message: fr.booking.cancelled });
}

