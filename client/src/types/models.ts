export interface User {
    _id: string
    username: string
    role: 'user' | 'admin'
}

export interface Poster {
    _id: string
    title: string
    price: number
    size : string
    image: string
    note: string
    availableStock : number
    totalStock : number
}