import type { LoginResponse } from "./types";

export const BASE_URL = "http://localhost:3000/api";
export const API_KEY = "123";

function getApiKey(): string {
  return localStorage.getItem("api_key") ?? "";
}

export async function login(
  email: string,
  password: string,
): Promise<LoginResponse> {
  const response = await fetch(`${BASE_URL}/users`, {
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

  localStorage.setItem("LoggedinUser", email);

  return response.json();
}
