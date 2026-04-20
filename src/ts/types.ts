export interface Users {
    id: number
    userName: string
    password: string | number
    email: string | number
    description: string | null
    created: string
    updated: string
}

export interface petSitters {
    id: number
    name: string
    location: string
    pricePerDay: number
    rating: number
    reviewCount: number
    acceptsPuppies: boolean
    acceptsLargeDogs: boolean
    yearsOfExperience: number
    experienceDescription: string | null
    available: boolean
    created: string
    updated: string
}

export interface Bookings {
    id: number
    userId: number
    userDogId: number
    petSitterId: number
    fromDate: string | null
    toDate: number
    status: string
    message: string
    created: string
    updated: string
}


export interface LoginResponse {
    API_KEY: string
}