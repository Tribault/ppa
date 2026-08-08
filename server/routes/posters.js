const express = require('express')
const router = express.Router()
const upload = require('../middleware/upload')
const {authenticate, authorize, optionalAuthenticate} = require('../middleware/auth')
const {
    getPosters, getPoster, getPosterFilters, createPoster, updatePoster, deletePoster
} = require('../controllers/posterController')

router.get('/', optionalAuthenticate, getPosters)
router.get('/filters', getPosterFilters)
router.get('/:id', optionalAuthenticate, getPoster)
router.post('/', authenticate, authorize('admin'), upload.single('image'), createPoster)
router.put('/:id', authenticate, authorize('admin'), upload.single('image'), updatePoster)
router.delete('/:id', authenticate, authorize('admin'), deletePoster)

module.exports = router