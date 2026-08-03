const fr = require('../locales/fr')
const en = require('../locales/en')

// "en-US,en;q=0.9,fr;q=0.8" -> "en-US" -> "en"
function resolveLocale(acceptLanguageHeader) {
  const primary = (acceptLanguageHeader || '').split(',')[0].trim().toLowerCase()
  return primary.startsWith('en') ? 'en' : 'fr'
}

module.exports = function locale(req, res, next) {
  req.t = resolveLocale(req.headers['accept-language']) === 'en' ? en : fr
  next()
}
