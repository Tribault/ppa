const express = require('express')
const router = express.Router()
const {authenticate, authorize} = require('../middleware/auth')
const { createLocation, getLocations, deleteLocation } = require('../controllers/locationController')

router.post('/', authenticate, authorize('admin'), createLocation)

router.get('/', authenticate, authorize('admin'), getLocations)

router.delete('/:id', authenticate, authorize('admin'), deleteLocation)

module.exports = router
