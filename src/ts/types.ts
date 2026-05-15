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
  breed: string;
  gender: "Him" | "Her";
  age: number;
  weight: number;
  allergies: Allergy[];
}

export type Allergy = "Ingen allergier" | "Egg" | "Hvete" | "Melk" | "Mais";

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

/*JAKOB TORGAU*/

export interface Message {
  id: number;
  topic: string;
  user_id: number;
  message: string;
  email?: string;
}
export interface Booking {
  id: number;
  userId: number;
  userDogId: number;
  petSitterId: number;
  fromDate: string;
  toDate: string;
  status: string;
  message: string;
  created: string;
  updated: string;
}
