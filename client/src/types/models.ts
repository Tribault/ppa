export interface User {
  _id: string
  username: string
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
}

export interface Booking {
  _id: string
  user: string
  poster: Poster
  quantity: number
  status: string
  bookedAt: string
  priceAtBooking: number
}
