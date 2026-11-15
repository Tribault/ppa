const Location = require('../models/Location')
const Poster = require('../models/Poster')

exports.createLocation = async (req, res) => {
  try {
    const location = new Location(req.body)
    await location.save()
    res.json(location)
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: req.t.validation.nameAlreadyInUse })
    if (err.errors?.name) return res.status(400).json({ message: req.t.validation.nameRequired })
    res.status(400).json({ message: req.t.location.serverError })
  }
}

exports.getLocations = async (req, res) => {
  const locations = await Location.find()
  res.json(locations)
}

exports.deleteLocation = async (req, res) => {
  const location = await Location.findByIdAndDelete(req.params.id)
  if (!location) return res.status(404).json({ message: req.t.location.notFound })

  await Poster.updateMany({ locations: location._id }, { $pull: { locations: location._id } })

  res.json({ message: req.t.location.deleted })
}

// Renaming keeps the same id, so every poster using it shows the new name.
exports.updateLocation = async (req, res) => {
  const name = typeof req.body.name === 'string' ? req.body.name.trim() : ''
  if (!name) return res.status(400).json({ message: req.t.validation.nameRequired })
  try {
    const location = await Location.findByIdAndUpdate(req.params.id, { name }, { new: true, runValidators: true })
    if (!location) return res.status(404).json({ message: req.t.location.notFound })
    res.json(location)
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: req.t.validation.nameAlreadyInUse })
    res.status(400).json({ message: req.t.location.serverError })
  }
}
