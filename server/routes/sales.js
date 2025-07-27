const express = require('express')
const router = express.Router()
const {authenticate, authorize} = require('../middleware/auth')
const {
    getSales, getUserSales, getPosterSales
} = require('../controllers/saleController')

router.get('/', authenticate, authorize('admin'), getSales)
router.get('/user/:userId', authenticate, authorize('admin'), getUserSales)
router.get('/poster/:posterId', authenticate, authorize('admin'), getPosterSales)

module.exports = router