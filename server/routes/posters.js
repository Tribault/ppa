const express = require('express')
const router = express.Router()
const upload = require('../middleware/upload')
const {authenticate, authorize} = require('../middleware/auth')
const {
    getAllPosters, getPoster, createPoster, updatePoster, deletePoster
} = require('../controllers/posterController')

router.get('/', getAllPosters)
router.get('/:id', getPoster)
router.post('/', authenticate, authorize('admin'), upload.single('image'), createPoster)
router.put('/:id', authenticate, authorize('admin'), upload.single('image'), updatePoster)
router.delete('/:id', authenticate, authorize('admin'), deletePoster)

module.exports = router