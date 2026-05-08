const converter = require('json-2-csv');
const mongoose = require('mongoose')
const Sale = require('../models/Sale')

exports.getSales = async(req, res) => {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 20
    const skip = (page -1) * limit  

   const { startDate, endDate } = req.query
    const filter = {}

    if (startDate || endDate) {
      filter.validatedAt = {}
      if (startDate) filter.validatedAt.$gte = new Date(startDate)
      if (endDate) {
        const end = new Date(endDate)
        end.setDate(end.getDate() + 1)
        filter.validatedAt.$lte = end
      }
    }

  const [sales, total] = await Promise.all([
       Sale.find(filter)
    .populate('user')
    .populate('validatedBy')
    .populate('poster')
      .sort({ validatedAt: -1 })
      .skip(skip)
      .limit(limit),
      Sale.countDocuments(filter)
    ])

  res.json({
      data: sales,
      total,
      page,
      pages: Math.ceil(total / limit)
    })
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

exports.exportSalesCSV = async (req, res) => {
  try {
    const { startDate, endDate, buyerId, posterId } = req.query;

    // Build filter object
    const filter = {};

    if (startDate || endDate) {
      filter.validatedAt = {};
      if (startDate) filter.validatedAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setDate(end.getDate() + 1);
        filter.validatedAt.$lte = end;
      }
    }

    if (buyerId && mongoose.Types.ObjectId.isValid(buyerId)) {
      filter.user = buyerId;
    }

    if (posterId && mongoose.Types.ObjectId.isValid(posterId)) {
      filter.poster = posterId;
    }

    // Fetch with filters
    const sales = await Sale.find(filter)
      .populate('user', 'email')
      .populate('poster', 'title price');

    const data = sales.map(s => ({
      user: s.user?.email || 'Unknown',
      poster: s.poster?.title || 'Unknown',
      quantity: s.quantity,
      priceAtSale: s.priceAtSale,
      total: (s.priceAtSale * s.quantity).toFixed(2),
      validatedAt: s.validatedAt.toISOString(),
      validatedBy: s.validatedBy
    }));

    const csv = converter.json2csv(data)

    res.header('Content-Type', 'text/csv');
    res.attachment(`sales_${new Date().toISOString().split('T')[0]}.csv`);
    res.send(csv);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not export sales' });
  }
};