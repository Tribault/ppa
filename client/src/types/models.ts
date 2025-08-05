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
  user: string,
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
