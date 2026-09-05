const converter = require('json-2-csv');
const mongoose = require('mongoose')
const Booking = require('../models/Booking')

const SORTABLE_SALE_FIELDS = {
  reference: 'reference',
  posterTitle: 'poster.title',
  buyerEmail: 'user.email',
  unitPrice: 'priceAtBooking',
  quantity: 'quantity',
  totalPrice: 'totalPrice',
  soldBy: 'validatedBy.email',
  validatedAt: 'validatedAt',
}

exports.getSales = async(req, res) => {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 20
    const skip = (page -1) * limit

   const { startDate, endDate } = req.query
    const filter = { status: 'validated' }

    if (startDate || endDate) {
      filter.validatedAt = {}
      if (startDate) filter.validatedAt.$gte = new Date(startDate)
      if (endDate) {
        const end = new Date(endDate)
        end.setDate(end.getDate() + 1)
        filter.validatedAt.$lte = end
      }
    }

  const sortField = SORTABLE_SALE_FIELDS[req.query.sortBy] || 'validatedAt'
  const sortDirection = req.query.sortDir === 'asc' ? 1 : -1

  const [sales, total] = await Promise.all([
    Booking.aggregate([
      { $match: filter },
      { $lookup: { from: 'users', localField: 'user', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $lookup: { from: 'users', localField: 'validatedBy', foreignField: '_id', as: 'validatedBy' } },
      { $unwind: { path: '$validatedBy', preserveNullAndEmptyArrays: true } },
      { $lookup: { from: 'posters', localField: 'poster', foreignField: '_id', as: 'poster' } },
      { $unwind: '$poster' },
      { $addFields: { totalPrice: { $multiply: ['$quantity', '$priceAtBooking'] }, priceAtSale: '$priceAtBooking' } },
      { $project: { 'user.password': 0, 'validatedBy.password': 0 } },
      { $sort: { [sortField]: sortDirection } },
      { $skip: skip },
      { $limit: limit },
    ]),
    Booking.countDocuments(filter)
  ])

  res.json({ data: sales, total, page, pages: Math.ceil(total / limit) })
}

exports.getUserSales = async(req, res) => {
    const sales = await Booking.find({ user: req.params.userId, status: 'validated' }).populate('poster');
  res.json(sales);
}

exports.getPosterSales = async(req, res) => {
    const sales = await Booking.find({ poster: req.params.posterId, status: 'validated' }).populate('user');
  res.json(sales);
}

exports.exportSalesCSV = async (req, res) => {
  try {
    const { startDate, endDate, buyerId, posterId } = req.query;
    const filter = { status: 'validated' };
    if (startDate || endDate) {
      filter.validatedAt = {};
      if (startDate) filter.validatedAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setDate(end.getDate() + 1);
        filter.validatedAt.$lte = end;
      }
    }
    if (buyerId && mongoose.Types.ObjectId.isValid(buyerId)) filter.user = buyerId;
    if (posterId && mongoose.Types.ObjectId.isValid(posterId)) filter.poster = posterId;

    const sales = await Booking.find(filter)
      .populate('user', 'email')
      .populate('poster', 'title price')
      .populate('validatedBy', 'email');

    const data = sales.map(s => ({
      user: s.user?.email || 'Unknown',
      poster: s.poster?.title || 'Unknown',
      quantity: s.quantity,
      priceAtSale: s.priceAtBooking,
      total: (s.priceAtBooking * s.quantity).toFixed(2),
      validatedAt: s.validatedAt.toISOString(),
      validatedBy: s.validatedBy?.email || 'Unknown',
    }));

    const csv = converter.json2csv(data)
    res.header('Content-Type', 'text/csv');
    res.attachment(`sales_${new Date().toISOString().split('T')[0]}.csv`);
    res.send(csv);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: req.t.sale.exportError });
  }
};
