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

async function sendGroupedBookingReminders(bookings, sentField, subject, bodyFor) {
  const bookingsByUser = new Map()
  for (const booking of bookings) {
    if (!booking.user) continue
    const entry = bookingsByUser.get(booking.user._id.toString()) || { user: booking.user, bookings: [] }
    entry.bookings.push(booking)
    bookingsByUser.set(booking.user._id.toString(), entry)
  }

  for (const { user, bookings: userBookings } of bookingsByUser.values()) {
    await sendEmail(user.email, subject, bodyFor(user.email, userBookings))
    await Booking.updateMany(
      { _id: { $in: userBookings.map((b) => b._id) } },
      { [sentField]: new Date() },
    )
  }
}

async function sendRemindersForThreshold(thresholdDays, sentField, now) {
  const saleDate = await SaleDate.findOne()
  if (!saleDate) return

  if (daysBetween(now, saleDate.date) !== thresholdDays) return

  const bookings = await Booking.find({ status: 'pending', [sentField]: null })
    .populate('user')
    .populate('poster')

  await sendGroupedBookingReminders(
    bookings,
    sentField,
    t.email.saleReminderSubject,
    (email, userBookings) => t.email.saleReminderBody(email, saleDate.date, userBookings),
  )
}

async function sendOverdueReminders(now) {
  const saleDate = await SaleDate.findOne()
  if (!saleDate) return

  if (daysBetween(saleDate.date, now) < 30) return

  const bookings = await Booking.find({ status: 'pending', overdueReminderSentAt: null })
    .populate('user')
    .populate('poster')

  await sendGroupedBookingReminders(
    bookings,
    'overdueReminderSentAt',
    t.email.overdueReminderSubject,
    (email, userBookings) => t.email.overdueReminderBody(email, saleDate.date, userBookings),
  )
}

async function sendAdminOverdueAlert(thresholdDays, sentField, now) {
  if (!process.env.ADMIN_EMAIL) return

  const saleDate = await SaleDate.findOne()
  if (!saleDate) return

  if (daysBetween(saleDate.date, now) < thresholdDays) return

  const bookings = await Booking.find({ status: { $in: ['pending', 'ready'] }, [sentField]: null })
    .populate('user')
    .populate('poster')

  if (bookings.length === 0) return

  await sendEmail(
    process.env.ADMIN_EMAIL,
    t.email.overdueAdminSubject(thresholdDays),
    t.email.overdueAdminBody(thresholdDays, saleDate.date, bookings),
  )
  await Booking.updateMany(
    { _id: { $in: bookings.map((b) => b._id) } },
    { [sentField]: new Date() },
  )
}

async function runSaleReminderCheck(now = new Date()) {
  await sendRemindersForThreshold(7, 'reminder7SentAt', now)
  await sendRemindersForThreshold(1, 'reminder1SentAt', now)
  await sendOverdueReminders(now)
  await sendAdminOverdueAlert(7, 'adminOverdue7SentAt', now)
  await sendAdminOverdueAlert(30, 'adminOverdue30SentAt', now)
}

module.exports = { runSaleReminderCheck, daysBetween }
