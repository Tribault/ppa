import { defineStore } from 'pinia'
import type { MovieSearchResult, MovieDetails, TmdbPosterOption } from '@/types/models'
import api from '@/utils/axios'

export const useMovieStore = defineStore('movies', () => {
  async function searchMovies(title: string): Promise<MovieSearchResult[]> {
    const res = await api.get('/movies/search', { params: { title } })
    return res.data.results
  }

  async function getTmdbDetails(id: number): Promise<MovieDetails> {
    const res = await api.get(`/movies/tmdb/${id}`)
    return res.data
  }

  async function getTmdbPosters(id: number): Promise<TmdbPosterOption[]> {
    const res = await api.get(`/movies/tmdb/${id}/posters`)
    return res.data.posters
  }

  async function selectTmdbPoster(path: string): Promise<string> {
    const res = await api.post('/movies/tmdb-poster', { path })
    return res.data.filename
  }

  return { searchMovies, getTmdbDetails, getTmdbPosters, selectTmdbPoster }
})
