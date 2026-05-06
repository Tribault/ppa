const multer = require('multer')
const path = require('path')

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname)
  }
})

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max
  fileFilter: (req, file, cb) => {
    if (ALLOWED_TYPES.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Format non supporté. Utilisez JPEG, PNG, WebP ou GIF.'))
    }
  }
})

module.exports = upload