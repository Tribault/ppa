const Tag = require('../models/Tag')
const Poster = require('../models/Poster')

exports.createTag =  async (req, res) => {
  try {
    const tag = new Tag(req.body)
    await tag.save()
    res.json(tag)
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: req.t.validation.nameAlreadyInUse })
    if (err.errors?.name) return res.status(400).json({ message: req.t.validation.nameRequired })
    res.status(400).json({ message: req.t.tag.serverError })
  }
}

exports.getTags =  async (req, res) => {
  const tags = await Tag.find()
  res.json(tags)
}

exports.deleteTag = async (req, res) => {
  const tag = await Tag.findByIdAndDelete(req.params.id)
  if (!tag) return res.status(404).json({ message: req.t.tag.notFound })

  await Poster.updateMany({ tags: tag._id }, { $pull: { tags: tag._id } })

  res.json({ message: req.t.tag.deleted })
}