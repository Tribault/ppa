const express = require('express')
const router = express.Router()
const {authenticate, authorize} = require('../middleware/auth')
const { createLocation, getLocations } = require('../controllers/locationController')

router.post('/', authenticate, authorize('admin'), createLocation)

router.get('/', authenticate, authorize('admin'), getLocations)

module.exports = router
