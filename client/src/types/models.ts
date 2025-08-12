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
  availableStock: number
  totalStock: number
  tags: string[]
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
  user: string
  poster: Poster
  quantity: number
  validatedAt: string
  priceAtSale: number
}

export interface BookingPayload {
  userId: string
  posterId: string
  quantity: number
  status?: string
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
