import Booking from '../models/Booking';
import Poster from '../models/Poster';

// POST /api/bookings

exports.createBooking =  async (req, res) => {
  const { posterId, quantity } = req.body;
  const userId = req.user.id;

  const poster = await Poster.findById(posterId);
  if (!poster) return res.status(404).json({ error: 'Poster not found' });

  const pendingBookings = await Booking.aggregate([
    { $match: { poster: poster._id, status: 'pending' } },
    { $group: { _id: null, total: { $sum: '$quantity' } } }
  ]);
  const reserved = pendingBookings[0]?.total || 0;

  const available = poster.totalStock - reserved;

  if (quantity <= 0 || quantity > available) {
    return res.status(400).json({ error: 'Not enough stock available' });
  }

  const booking = new Booking({
    user: userId,
    poster: poster._id,
    quantity,
    status: 'pending'
  });

  await booking.save();

  res.json({ message: 'Booking successful', booking });
}
