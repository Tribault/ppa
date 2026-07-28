const TMDB_BASE = 'https://api.themoviedb.org/3'
const TMDB_IMG_BASE = 'https://image.tmdb.org/t/p/w200'
const TMDB_IMG_PREVIEW_BASE = 'https://image.tmdb.org/t/p/w342'
const TMDB_IMG_FULL_BASE = 'https://image.tmdb.org/t/p/original'

function tmdbHeaders() {
  return {
    Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
    Accept: 'application/json'
  }
}

async function searchTmdb(title) {
  if (!process.env.TMDB_API_KEY) return []

  try {
    const url = `${TMDB_BASE}/search/movie?query=${encodeURIComponent(title)}&language=fr-FR`
    const res = await fetch(url, { headers: tmdbHeaders() })
    if (!res.ok) return []

    const data = await res.json()
    return (data.results || []).map((r) => ({
      source: 'tmdb',
      id: r.id,
      title: r.title,
      year: r.release_date ? r.release_date.slice(0, 4) : '',
      posterUrl: r.poster_path ? `${TMDB_IMG_BASE}${r.poster_path}` : null
    }))
  } catch (err) {
    console.error('TMDB search failed:', err.message)
    return []
  }
}

async function getTmdbDetails(id) {
  if (!process.env.TMDB_API_KEY) return null

  const url = `${TMDB_BASE}/movie/${id}?append_to_response=credits&language=fr-FR`
  const res = await fetch(url, { headers: tmdbHeaders() })
  if (!res.ok) return null

  const data = await res.json()
  const director = (data.credits?.crew || []).find((c) => c.job === 'Director')
  const mainActors = (data.credits?.cast || []).slice(0, 5).map((c) => c.name)

  return {
    filmmaker: director?.name || '',
    year: data.release_date ? parseInt(data.release_date.slice(0, 4), 10) : null,
    mainActors,
    genre: (data.genres || []).map((g) => g.name).join(', '),
    country: data.production_countries?.[0]?.name || ''
  }
}

// Returns candidate poster images for a movie, French-language posters first
// since the shop mostly sells French affiches — the localized art (title in
// French, French billing block) is usually what the admin actually wants.
async function getTmdbPosters(id) {
  if (!process.env.TMDB_API_KEY) return []

  const url = `${TMDB_BASE}/movie/${id}/images?include_image_language=fr,null,en`
  const res = await fetch(url, { headers: tmdbHeaders() })
  if (!res.ok) return []

  const data = await res.json()
  const languageRank = (lang) => (lang === 'fr' ? 0 : lang === null ? 1 : 2)

  return (data.posters || [])
    .sort((a, b) => languageRank(a.iso_639_1) - languageRank(b.iso_639_1))
    .slice(0, 12)
    .map((p) => ({
      path: p.file_path,
      previewUrl: `${TMDB_IMG_PREVIEW_BASE}${p.file_path}`,
      language: p.iso_639_1
    }))
}

// Best-effort fallback: parses the French Wikipedia film infobox wikitext.
// Field names vary across pages, so this only handles the common
// {{Infobox Cinéma (film)}} keys and silently returns null on anything unexpected.
async function searchWikipediaFallback(title) {
  try {
    const searchUrl = `https://fr.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(title + ' film')}&format=json&origin=*`
    const searchRes = await fetch(searchUrl)
    if (!searchRes.ok) return null

    const searchData = await searchRes.json()
    const page = searchData.query?.search?.[0]
    if (!page) return null

    const parseUrl = `https://fr.wikipedia.org/w/api.php?action=parse&pageid=${page.pageid}&prop=wikitext&section=0&format=json&origin=*`
    const parseRes = await fetch(parseUrl)
    if (!parseRes.ok) return null

    const parseData = await parseRes.json()
    const wikitext = parseData.parse?.wikitext?.['*']
    if (!wikitext) return null

    // Infobox field keys aren't exact (year is "année de sortie", not "sortie"), so match
    // any key containing the given substring rather than requiring an exact key match.
    const extractField = (nameSubstring) => {
      const match = wikitext.match(new RegExp(`\\|[^|=\\n]*${nameSubstring}[^|=\\n]*=\\s*([^\\n]+)`, 'i'))
      if (!match) return ''

      return match[1]
        .replace(/<br\s*\/?>/gi, ', ')
        .replace(/\[\[(?:[^\]|]*\|)?([^\]]+)\]\]/g, '$1')
        .replace(/\{\{([^{}|]+)\}\}/g, '$1') // plain templates e.g. {{États-Unis}} -> États-Unis
        .replace(/\{\{[^{}]*\}\}/g, '') // remaining parameterised templates: drop
        .replace(/<!--.*?-->/g, '')
        .replace(/<[^>]+>/g, '')
        .replace(/'{2,}/g, '')
        .trim()
    }

    const filmmaker = extractField('réalisation')
    const genre = extractField('genre')
    const countryRaw = extractField('pays')
    const yearRaw = extractField('année de sortie') || extractField('sortie') || extractField('date de sortie')
    const acteursRaw = extractField('acteur')

    if (!filmmaker && !genre && !countryRaw && !yearRaw && !acteursRaw) return null

    const yearMatch = yearRaw.match(/\d{4}/)
    const country = countryRaw.split(',')[0].trim()

    return {
      source: 'wikipedia',
      title: page.title,
      filmmaker,
      year: yearMatch ? parseInt(yearMatch[0], 10) : null,
      mainActors: acteursRaw ? acteursRaw.split(',').map((a) => a.trim()).filter(Boolean).slice(0, 5) : [],
      genre,
      country
    }
  } catch (err) {
    console.error('Wikipedia fallback failed:', err.message)
    return null
  }
}

// Downloads a TMDB poster server-side (avoids browser CORS issues on the
// image CDN) and saves it into uploads/ using the same naming convention as
// multer's disk storage, so it's indistinguishable from a manual upload afterwards.
async function downloadTmdbPoster(filePath) {
  const fs = require('fs')
  const path = require('path')

  const res = await fetch(`${TMDB_IMG_FULL_BASE}${filePath}`)
  if (!res.ok) throw new Error('Failed to download TMDB poster')

  const buffer = Buffer.from(await res.arrayBuffer())
  const filename = `${Date.now()}-tmdb${path.extname(filePath) || '.jpg'}`
  fs.writeFileSync(path.join('uploads', filename), buffer)

  return filename
}

module.exports = { searchTmdb, getTmdbDetails, getTmdbPosters, downloadTmdbPoster, searchWikipediaFallback }
