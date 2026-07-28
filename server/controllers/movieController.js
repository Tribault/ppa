const { searchTmdb, getTmdbDetails, getTmdbPosters, downloadTmdbPoster, searchWikipediaFallback } = require('../utils/movieMetadata')

exports.searchMovies = async (req, res) => {
  const { title } = req.query
  if (!title) return res.json({ results: [] })

  const results = await searchTmdb(title)

  if (results.length === 0) {
    const wikiResult = await searchWikipediaFallback(title)
    if (wikiResult) results.push(wikiResult)
  }

  res.json({ results })
}

exports.getMovieDetails = async (req, res) => {
  const details = await getTmdbDetails(req.params.id)
  if (!details) return res.status(404).json({ message: 'Film introuvable.' })
  res.json(details)
}

exports.getMoviePosters = async (req, res) => {
  const posters = await getTmdbPosters(req.params.id)
  res.json({ posters })
}

exports.selectMoviePoster = async (req, res) => {
  const { path } = req.body
  if (!path) return res.status(400).json({ message: 'Chemin de l\'affiche manquant.' })

  try {
    const filename = await downloadTmdbPoster(path)
    res.json({ filename })
  } catch (err) {
    console.error('Failed to adopt TMDB poster:', err.message)
    res.status(502).json({ message: 'Impossible de récupérer cette affiche.' })
  }
}
