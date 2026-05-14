export interface LoginResponse {
  API_KEY: string;
}
export interface Users {
  id: number;
  userName: string;
  password: string | number;
  email: string;
  description: string | null;
  dogs: Dog[];
  created: string;
  updated: string;
  image?: string;
}

export interface Dog {
  id: number;
  name: string;
  weight: number;
  age: number;
  breed: string;
  allergies: string[];
  gender: "Him" | "Her";
  image?: string;
}

export interface petSitters {
  id: number;
  name: string;
  image?: string;
  location: string;
  pricePerDay: number;
  rating: number;
  reviewCount: number;
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
  toDate: number;
  status: string;
  message: string;
  created: string;
  updated: string;
}

/*JAKOB TORGAU*/

export interface Message {
  id: number;
  topic: string;
  user_id: number;
  message: string;
}
