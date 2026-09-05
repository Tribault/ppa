const express = require('express')
const cors = require('cors')
const authRoutes = require('./routes/auth')
const posterRoutes = require('./routes/posters')
const bookingRoutes = require('./routes/bookings')
const saleRoutes = require('./routes/sales')
const userRoutes = require('./routes/users')
const tagRoutes = require('./routes/tags')
const locationRoutes = require('./routes/locations')
const messageRoutes = require('./routes/messages')
const movieRoutes = require('./routes/movies')
const saleDateRoutes = require('./routes/saleDates')
const locale = require('./middleware/locale')



const multer = require('multer')

const app = express()
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }))
app.use(express.json())
app.use(locale)
app.use('/uploads', express.static('uploads'))

app.use('/api/auth', authRoutes)
app.use('/api/posters', posterRoutes)
app.use('/api/bookings', bookingRoutes)
app.use('/api/sales', saleRoutes)
app.use('/api/users', userRoutes)
app.use('/api/tags', tagRoutes)
app.use('/api/locations', locationRoutes)
app.use('/api/messages', messageRoutes)
app.use('/api/movies', movieRoutes)
app.use('/api/sale-date', saleDateRoutes)

// Catch Multer errors (bad file type, file too large) and return a clean 400
// instead of letting them bubble up as an unhandled 500.
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    const message = err.code === 'LIMIT_FILE_SIZE' ? req.t.poster.fileTooLarge : req.t.poster.unsupportedFormat
    return res.status(400).json({ message })
  }
  if (err.isFileFilterError) {
    return res.status(400).json({ message: err.message })
  }
  next(err)
})

module.exports = app