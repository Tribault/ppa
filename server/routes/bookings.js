const express = require('express')
const router = express.Router()
const {authenticate, authorize} = require('../middleware/auth')

const {createOrUpdateBooking, createBasket, updateBasketStatus, getBookings, deleteBooking }  = require('../controllers/bookingController')

router.post('/basket', authenticate, createBasket)
router.patch('/reference/:reference', authenticate, authorize('admin'), updateBasketStatus)
router.post('/', authenticate,createOrUpdateBooking)
router.put('/:id', authenticate, createOrUpdateBooking)
router.get('/', authenticate, getBookings)
router.delete('/:id', authenticate, deleteBooking)

module.exports = router