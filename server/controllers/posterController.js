const Poster = require('../models/Poster')

exports.getAllPosters = async(req, res) => {
    const posters = await Poster.find()
    res.json(posters)
}

exports.createPoster = async (req, res) => {
    const {title, description} = req.body
    const image = req.file?.filename || ''
    const poster = await Poster.create({title, description, image})
    res.json(poster)
}

exports.updatePoster = async (req, res) => {
    const updated = await Poster.findByIdAndUpdate(req.params.id, req.body, {new: true})
    res.json(updated)
}

exports.deletePoster = async (req, res) => {
    const poster = await Poster.findByIdAndDelete(req.params.id)
    res.json({message: 'Poster deleted'})
}

exports.validateBooking = async (req, res) => {
  const poster = await Poster.findById(req.params.posterId);

  const booking = poster.bookings.id(req.params.bookingId);
  if (!booking) return res.status(404).json({ error: 'Booking not found' });

  if (booking.status === 'validated') {
    return res.status(400).json({ error: 'Booking already validated' });
  }

  // Mark booking as validated
  booking.status = 'validated';
  await poster.save();

  // Create sale record
  const sale = new Sale({
    user: booking.user,
    poster: poster._id,
    quantity: booking.quantity
  });

  await sale.save();

  res.json({ message: 'Booking validated and sale recorded' });
}