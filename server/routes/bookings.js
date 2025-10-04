const express = require('express')
const router = express.Router()
const {authenticate} = require('../middleware/auth')

const {createOrUpdateBooking, getBookings, getUserBookings, getPosterBookings, deleteBooking, updateBooking }  = require('../controllers/bookingController')

router.post('/', authenticate,createOrUpdateBooking)
router.put('/:id', authenticate, updateBooking)
router.get('/', authenticate, getBookings)
router.get('/user/:userId', authenticate, getUserBookings)
router.post('/poster/:posterId', authenticate, getPosterBookings)
router.delete('/:id', authenticate, deleteBooking)

module.exports = router