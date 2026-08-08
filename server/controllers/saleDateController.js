const SaleDate = require('../models/SaleDate')

exports.getSaleDate = async (req, res) => {
  const saleDate = await SaleDate.findOne().sort({ updatedAt: -1 })
  res.json(saleDate)
}

exports.upsertSaleDate = async (req, res) => {
  const { date } = req.body
  if (!date || isNaN(Date.parse(date))) {
    return res.status(400).json({ message: req.t.saleDate.invalidDate })
  }

  let saleDate = await SaleDate.findOne()
  if (saleDate) {
    saleDate.date = date
    saleDate.updatedAt = Date.now()
    await saleDate.save()
  } else {
    saleDate = await SaleDate.create({ date })
  }
  res.json(saleDate)
}
