const Location = require('../models/Location')

exports.createLocation = async (req, res) => {
  try {
    const location = new Location(req.body)
    await location.save()
    res.json(location)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

exports.getLocations = async (req, res) => {
  const locations = await Location.find()
  res.json(locations)
}
