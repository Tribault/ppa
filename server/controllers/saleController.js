const Sale = require('../models/Sale')

exports.getSales = async(req, res) => {
   const sales = await Sale.find()
    .populate('user')
    .populate('poster');
  res.json(sales);
}

exports.getUserSales = async(req, res) => {
    const sales = await Sale.find({ user: req.params.userId })
    .populate('poster');
  res.json(sales);
}

exports.getPosterSales = async(req, res) => {
    const sales = await Sale.find({ poster: req.params.posterId })
    .populate('user');
  res.json(sales);
}