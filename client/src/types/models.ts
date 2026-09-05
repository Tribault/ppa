export interface User {
  _id: string
  email: string
  role: 'user' | 'admin'
}

export interface Poster {
  _id: string
  title: string
  price: number
  size: string
  image: string
  note: string
  totalStock: number
  tags: Tag[]
  locations?: Location[]
  forSale: Boolean
  stockInfo: StockInfo
  filmmaker?: string
  year?: number
  mainActors?: string[]
  genre?: string
  country?: string
  createdAt?: string
}

export interface MovieSearchResult {
  source: 'tmdb' | 'wikipedia'
  id?: number
  title: string
  year?: string
  posterUrl?: string | null
  filmmaker?: string
  mainActors?: string[]
  genre?: string
  country?: string
}

export interface MovieDetails {
  filmmaker: string
  year: number | null
  mainActors: string[]
  genre: string
  country: string
}

export interface TmdbPosterOption {
  path: string
  previewUrl: string
  language: string | null
}

export interface StockInfo {
  confirmed: number
  pending: number
  ready: number
  availableStock: number
}

export interface Booking {
  _id: string
  reference: string
  user: User
  poster: Poster
  quantity: number
  status: string
  bookedAt: string
  priceAtBooking: number
}

export interface Sale {
  _id: string
  reference: string
  user: User
  poster: Poster
  quantity: number
  validatedAt: string
  validatedBy: User
  priceAtSale: number
}

export interface Message {
_id: string
content : string
bookingAllowed: boolean
}

export interface SaleDate {
  _id: string
  date: string
}

export interface BookingPayload {
  userId: string
  posterId: string
  quantity: number
  status?: string
}

export interface BasketItemPayload {
  posterId: string
  quantity: number
}

export interface PosterPayload {
  title: string
  size: string
  price: number
  image?: File
  note: string
  totalStock: number
  tags: string[]
  locations?: string[]
  forSale: Boolean
  filmmaker?: string
  year?: number
  mainActors?: string[]
  genre?: string
  country?: string
}

export interface Tag {
  _id: string
  name: string
}

export interface Location {
  _id: string
  name: string
}

export enum Alphabet {
  a = 'A',
  b = 'B',
  c = 'C',
  d = 'D',
  e = 'E',
  f = 'F',
  g = 'G',
  h = 'H',
  i = 'I',
  j = 'J',
  k = 'K',
  l = 'L',
  m = 'M',
  n = 'N',
  o = 'O',
  p = 'P',
  q = 'Q',
  r = 'R',
  s = 'S',
  t = 'T',
  u = 'U',
  v = 'V',
  w = 'W',
  x = 'X',
  y = 'Y',
  z = 'Z',
}
