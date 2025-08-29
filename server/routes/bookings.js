const express = require('express')
const router = express.Router()
const {authenticate, authorize} = require('../middleware/auth')

const {createBooking, validateBooking, devalidateBooking, getBookings, getUserBookings, getPosterBookings, deleteBooking, updateBooking }  = require('../controllers/bookingController')

router.post('/', authenticate,createBooking)
router.post('/:bookingId/validate', authenticate, authorize('admin'), validateBooking)
router.post('/:bookingId/devalidate', authenticate, authorize('admin'), devalidateBooking)
router.put('/:id', authenticate, updateBooking)
router.get('/', authenticate, authorize('admin'), getBookings)
router.get('/user/:userId', authenticate, getUserBookings)
router.post('/poster/:posterId', authenticate, getPosterBookings)
router.delete('/:id', authenticate, deleteBooking)

module.exports = router