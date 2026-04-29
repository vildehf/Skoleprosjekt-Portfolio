export interface LoginResponse {
  API_KEY: string;
}
export interface Users {
  id: number;
  userName: string;
  password: string | number;
  email: string | number;
  description: string | null;
  dogs: Dog[];
  created: string;
  updated: string;
  image?: string;
}

export interface Dog {
  id: number;
  name: string;
  breed: string;
  gender: "Him" | "Her";
  age: number;
  allergies: Allergy[];
  created: string;
  updated: string;
  image?: string;
}

export interface Allergy {}

export interface PetSitters {
  id: number;
  name: string;
  image?: string;
  location: string;
  pricePerDay: number;
  rating: number;
  reviewCount: number;
  maxDogs: number;
  acceptsPuppies: boolean;
  acceptsLargeDogs: boolean;
  yearsOfExperience: number;
  experienceDescription: string | null;
  available: boolean;
  created: string;
  updated: string;
}

export interface Bookings {
  id: number;
  userId: number;
  userDogId: number;
  petSitterId: number;
  fromDate: string | null;
  toDate: string | null;
  status: string;
  message: string;
  created: string;
  updated: string;
}
