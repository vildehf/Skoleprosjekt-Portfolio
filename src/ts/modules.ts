import type { LoginResponse, Users } from "./types";

const BASE_URL = "http://localhost:3000/api";

export async function login(email: string, password: string): Promise<LoginResponse> {
  const response = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message ?? "Innlogging feilet");
  }

  localStorage.setItem("LoggedinUser", email)

  return response.json();
}

/* users */

export async function getUsers(): Promise<Users[]> {
    const response = await fetch(`${BASE_URL}/users`)
    if (!response.ok) {
        throw new Error(('Kan ikke hente brukeren'))
    }

    return response.json
}