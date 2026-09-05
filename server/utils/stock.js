
const Booking = require('../models/Booking')

/**
 * Compute stock info for a given poster
 * @param {ObjectId} posterId
 * @param {Number} totalStock
 * @returns {Promise<{confirmed: number, pending: number, ready: number, availableStock: number}>}
 */
async function computeStockInfo(posterId, totalStock) {
  const [confirmedAgg, pendingAgg, readyAgg] = await Promise.all([
    Booking.aggregate([
      { $match: { poster: posterId, status: 'validated' } },
      { $group: { _id: null, total: { $sum: '$quantity' } } }
    ]),
    Booking.aggregate([
      { $match: { poster: posterId, status: 'pending' } },
      { $group: { _id: null, total: { $sum: '$quantity' } } }
    ]),
    Booking.aggregate([
      { $match: { poster: posterId, status: 'ready' } },
      { $group: { _id: null, total: { $sum: '$quantity' } } }
    ])
  ])

  const confirmed = confirmedAgg[0]?.total || 0
  const pending = pendingAgg[0]?.total || 0
  const ready = readyAgg[0]?.total || 0
  const availableStock = (totalStock || 0) - confirmed - pending - ready

  return { confirmed, pending, ready, availableStock }
}

module.exports = { computeStockInfo }
