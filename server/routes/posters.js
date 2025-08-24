const express = require('express')
const router = express.Router()
const upload = require('../middleware/upload')
const {authenticate, authorize} = require('../middleware/auth')
const {
    getPosters, getPoster, createPoster, updatePoster, deletePoster
} = require('../controllers/posterController')

router.get('/', getPosters)
router.get('/:id', getPoster)
router.post('/', authenticate, authorize('admin'), upload.single('image'), createPoster)
router.put('/:id', authenticate, authorize('admin'), upload.single('image'), updatePoster)
router.delete('/:id', authenticate, authorize('admin'), deletePoster)

module.exports = router