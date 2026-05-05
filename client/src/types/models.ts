export interface User {
  _id: string
  username: string
  password: string
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
  forSale: Boolean
  stockInfo: StockInfo
}

export interface StockInfo {
  confirmed: number
  pending: number
  availableStock: number
}

export interface Booking {
  _id: string
  user: User
  poster: Poster
  quantity: number
  status: string
  bookedAt: string
  priceAtBooking: number
}

export interface Sale {
  _id: string
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

export interface BookingPayload {
  userId: string
  posterId: string
  quantity: number
  status?: string
}

export interface PosterPayload {
  title: string
  size: string
  price: number
  image?: File
  note: string
  totalStock: number
  tags: string[]
  forSale: Boolean
}

export interface Tag {
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
