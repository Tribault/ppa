export interface User {
    _id: string
    username: string
    role: 'user' | 'admin'
}

export interface Poster {
    _id: string
    title: string
    description: string
    image: string
    isBooked: boolean
    bookedBy?: string
}