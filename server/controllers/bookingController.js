const Poster = require('../models/Poster')
const Booking = require('../models/Booking')
const Sale = require('../models/Sale')
const User = require('../models/User')

exports.createOrUpdateBooking = async (req, res) => {
  try {
    const { posterId, quantity, userId } = req.body;

    const poster = await Poster.findById(posterId);
    if (!poster) return res.status(404).json({ error: 'Affiche introuvable' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'Client introuvable' });

    let booking = await Booking.findOne({ user: userId, poster: posterId });

    if (booking) {
      const newQuantity = booking.quantity + quantity;

      if (newQuantity > poster.totalStock) {
        return res.status(400).json({ error: 'Pas assez de stock pour réserver.' });
      }

      booking.quantity = newQuantity;
      await booking.save();

      return res.status(200).json(booking);
    } else {
      if (quantity > poster.totalStock) {
        return res.status(400).json({ error: 'Pas assez de stock pour réserver.' });
      }

      booking = new Booking({
        user: user._id,
        poster: poster._id,
        quantity,
        priceAtBooking: poster.price
      });

      await booking.save();
      return res.status(201).json(booking);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};


exports.updateBooking = async (req, res) => {
  try {
  const bookingId = req.params.id
    const { status, ...rest } = req.body

    let booking = await Booking.findById(bookingId)
    if (!booking) return res.status(404).json({ message: "Booking not found" })

      Object.assign(booking, rest)

     if (status && status !== booking.status) {
      booking.status = status

      if (status === "validated") {
        const existingSale = await Sale.findOne({ booking: booking._id })
        if (!existingSale) {
          await Sale.create({
            booking: booking._id,
            quantity: booking.quantity,
            poster: booking.poster,
            user: booking.user,
            validatedBy: req.user._id, 
            priceAtSale: booking.priceAtBooking
        })
      } else if (status === "pending") {
        await Sale.deleteOne({ booking: booking._id })
      }
}}

  await booking.save()
    res.json(booking)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Failed to update booking" })
  }
}

exports.getBookings = async (req, res) => {
      const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 20
    const skip = (page -1) * limit  
  

  let filter = {}

    if (!req.user.role == 'admin') {
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

  res.json({
      data: bookings,
      total,
      page,
      pages: Math.ceil(total / limit)
    })

}

exports.getUserBookings = async (req, res) => {
   const bookings = await Booking.find({ user: req.params.userId })
    .populate('poster')
    .lean()

  await Promise.all(
  bookings.map(async (booking) => {
    if (booking.poster && booking.poster._id) {
      const posterDoc = await Poster.findById(booking.poster._id);
      const availableStock = await posterDoc.getAvailableStock();
      booking.poster.availableStock = availableStock;
    }
  })
)

  res.json(bookings);
}


exports.getPosterBookings = async (req, res) => {
  const bookings = await Booking.find({ poster: req.params.posterId })
    .populate('user');
  res.json(bookings);
}

exports.deleteBooking = async (req, res) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) return res.status(404).json({ error: 'Booking not found' });

  if (
    booking.user.toString() !== req.user.id &&
    req.user.role !== 'admin'
  ) {
    return res.status(403).json({ error: 'Not authorized' });
  }

  if (booking.status !== 'pending') {
    return res.status(400).json({ error: 'Only pending bookings can be cancelled' });
  }

  await Booking.findByIdAndDelete(req.params.id)

  res.json({ message: 'Booking cancelled' });
}

