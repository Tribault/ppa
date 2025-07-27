const express = require('express')
const cors = require('cors')
const authRoutes = require('./routes/auth')
const posterRoutes = require('./routes/posters')
const bookingRoutes = require('./routes/bookings')
const saleRoutes = require('./routes/sales')


const app = express()
app.use(cors())
app.use(express.json())
app.use('/uploads', express.static('uploads'))

app.use('/api/auth', authRoutes)
app.use('/api/posters', posterRoutes)
app.use('/api/bookings', bookingRoutes)
app.use('/api/sales', saleRoutes)

module.exports = app