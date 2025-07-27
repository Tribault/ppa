const Poster = require('../models/Poster')
const Booking = require('../models/Booking')
const Sale = require('../models/Sale')

// POST /api/bookings

exports.createBooking =  async (req, res) => {
  const { posterId, quantity } = req.body;
  const userId = req.user.id;

  const poster = await Poster.findById(posterId);
  if (!poster) return res.status(404).json({ error: 'Poster not found' });

  if (quantity > poster.totalStock)
    return res.status(400).json({ error: 'Not enough stock' });

  const booking = new Booking({
    user: req.user.id,
    poster: poster._id,
    quantity,
    priceAtBooking: poster.price
  });

  await booking.save();
  res.status(201).json(booking);
}

exports.validateBooking = async (req, res) => {

  const booking = await Booking.findById(req.params.bookingId);
  if (!booking) return res.status(404).json({ error: 'Booking not found' });

  if (booking.status !== 'pending')
    return res.status(400).json({ error: 'Booking already validated' });

  const poster = await Poster.findById(booking.poster)
  if (booking.quantity > poster.totalStock)
  return res.status(400).json({ error: 'Not enough stock to validate this booking' })
  poster.totalStock -= booking.quantity
  await poster.save()

  booking.status = 'validated'
  await booking.save()

  const sale = new Sale({
    user: booking.user,
    poster: booking.poster,
    quantity: booking.quantity,
    priceAtSale: booking.priceAtBooking
  });

  await sale.save();
  res.status(201).json({ message: 'Booking validated and sale recorded' });
}

exports.getBookings = async (res) => {
 const bookings = await Booking.find()
    .populate('user')
    .populate('poster');
  res.json(bookings);
}

exports.getUserBookings = async (req, res) => {
   const bookings = await Booking.find({ user: req.params.userId })
    .populate('poster');
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
    !req.user.isAdmin
  ) {
    return res.status(403).json({ error: 'Not authorized' });
  }

  if (booking.status !== 'pending') {
    return res.status(400).json({ error: 'Only pending bookings can be cancelled' });
  }

  await booking.remove();
  res.json({ message: 'Booking cancelled' });
}

