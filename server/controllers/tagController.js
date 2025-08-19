const Tag = require('../models/Tag')

exports.createTag =  async (req, res) => {
  try {
    const tag = new Tag(req.body)
    await tag.save()
    res.json(tag)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

exports.getTags =  async (req, res) => {
  const tags = await Tag.find()
  res.json(tags)
}