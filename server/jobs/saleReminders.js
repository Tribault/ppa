const Booking = require('../models/Booking')
const SaleDate = require('../models/SaleDate')
const sendEmail = require('../utils/mailer')
const t = require('../locales/fr')

function daysBetween(from, to) {
  const msPerDay = 1000 * 60 * 60 * 24
  const utcFrom = Date.UTC(from.getFullYear(), from.getMonth(), from.getDate())
  const utcTo = Date.UTC(to.getFullYear(), to.getMonth(), to.getDate())
  return Math.round((utcTo - utcFrom) / msPerDay)
}

async function sendRemindersForThreshold(thresholdDays, sentField, now = new Date()) {
  const saleDate = await SaleDate.findOne()
  if (!saleDate) return

  if (daysBetween(now, saleDate.date) !== thresholdDays) return

  const bookings = await Booking.find({ status: 'pending', [sentField]: null })
    .populate('user')
    .populate('poster')

  const bookingsByUser = new Map()
  for (const booking of bookings) {
    if (!booking.user) continue
    const entry = bookingsByUser.get(booking.user._id.toString()) || { user: booking.user, bookings: [] }
    entry.bookings.push(booking)
    bookingsByUser.set(booking.user._id.toString(), entry)
  }

  for (const { user, bookings: userBookings } of bookingsByUser.values()) {
    await sendEmail(
      user.email,
      t.email.saleReminderSubject,
      t.email.saleReminderBody(user.email, saleDate.date, userBookings),
    )
    await Booking.updateMany(
      { _id: { $in: userBookings.map((b) => b._id) } },
      { [sentField]: new Date() },
    )
  }
}

async function runSaleReminderCheck(now = new Date()) {
  await sendRemindersForThreshold(7, 'reminder7SentAt', now)
  await sendRemindersForThreshold(1, 'reminder1SentAt', now)
}

module.exports = { runSaleReminderCheck, daysBetween }
