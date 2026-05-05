import type { LoginResponse, Users } from "./types";

export const BASE_URL = "http://localhost:3000/api";
export const API_KEY = "123";

export function getApiKey(): string {
  return API_KEY;
}

export async function getUsers(): Promise<Users[]> {
  const response = await fetch(`${BASE_URL}/users`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getApiKey()}`,
    },
  });

  if (!response.ok) {
    throw new Error("Kunne ikke hente brukere");
  }
  const data = await response.json();
  return data.users ?? data;
}

export function getLoggedInEmail(): string | null {
  return localStorage.getItem("LoggedinUser");
}

export async function getLoggedInUser(): Promise<Users | null> {
  const email = getLoggedInEmail();

  if (!email) {
    return null;
  }

  const users = await getUsers();
  return users.find((user) => user.email === email) ?? null;
}

export async function login(
  email: string,
  password: string,
): Promise<LoginResponse> {
  const response = await fetch(`${BASE_URL}/users`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getApiKey()}`,
    },
  });

  if (!response.ok) {
    throw new Error("Innlogging feilet");
  }

  const users: Users[] = await response.json();

  const user = users.find(
    (user) => user.email === email && user.password === password,
  );

  if (!user) {
    throw new Error("Feil e-post eller passord");
  }

  localStorage.setItem("LoggedinUser", user.email);
  localStorage.setItem("api_key", API_KEY);

  return { API_KEY };
}
