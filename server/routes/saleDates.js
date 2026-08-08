const express = require('express')
const router = express.Router()
const { getSaleDate, upsertSaleDate } = require('../controllers/saleDateController')
const { authenticate, authorize } = require('../middleware/auth')

router.get('/', getSaleDate)
router.post('/', authenticate, authorize('admin'), upsertSaleDate)

module.exports = router
