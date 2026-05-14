import type { LoginResponse, Users, Message } from "./types";

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
  return data.users;
}

/*JAKOB TORGAU*/

export async function createMessage(
  topic: string,
  user_id: number,
  message: string,
): Promise<Message> {
  const response = await fetch(`${BASE_URL}/messages`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${getApiKey()}`,
    },
    body: JSON.stringify({ topic, user_id, message }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message ?? "Kunne ikke opprette melding");
  }
  return response.json();
}

export async function getMessages(): Promise<Message[]> {
  const response = await fetch(`${BASE_URL}/messages`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getApiKey()}`,
    },
  });

  if (!response.ok) {
    throw new Error("Kunne ikke hente meldinger");
  }
  const data = await response.json();
  return data.messages ?? data;
}

export async function deleteMessage(id: number): Promise<void> {
  const response = await fetch(`${BASE_URL}/messages/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${getApiKey()}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message ?? "Kunne ikke slette kontakten");
  }
}

export async function editMessage(messages: Message): Promise<void> {
  const response = await fetch(`${BASE_URL}/messages/${messages.id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getApiKey()}`,
    },
    body: JSON.stringify({
      topic: messages.topic,
      user_id: messages.user_id,
      message: messages.message,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message ?? "Kunne ikke redigere kontakten");
  }

  return response.json();
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
  localStorage.setItem("LoggedinUserID", String(user.id));
  localStorage.setItem("api_key", API_KEY);

  return { API_KEY };
}
