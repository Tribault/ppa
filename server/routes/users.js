const express = require('express')
const router = express.Router()
const {authenticate, authorize} = require('../middleware/auth')
const {createUser, getUsers, getUser, updateUser, deleteUser} = require('../controllers/userController')


router.post('/', authenticate, authorize('admin'),createUser)
router.get('/', authenticate, authorize('admin'), getUsers)
router.get('/:id', authenticate, authorize('admin'), getUser)
router.put('/:id', authenticate, updateUser)
router.delete('/:id', authenticate, authorize('admin'), deleteUser)

module.exports = router