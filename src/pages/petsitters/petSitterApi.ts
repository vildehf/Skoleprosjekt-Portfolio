import type { PetSitters } from "../../ts/types.ts";
import { BASE_URL, API_KEY } from "../../ts/api.ts";

const PET_SITTERS_URL = `${BASE_URL}/petsitters`;

async function apiRequest(
  url: string,
  options: RequestInit = {},
): Promise<Response> {
  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      ...options.headers,
    },
  });

  if (!response.ok) throw new Error();

  return response;
}

export async function getPetSitters(): Promise<PetSitters[]> {
  const response = await fetch(PET_SITTERS_URL);

  if (!response.ok) throw new Error();

  return response.json();
}

export async function deletePetSitter(id: number): Promise<void> {
  await apiRequest(`${PET_SITTERS_URL}/${id}`, {
    method: "DELETE",
  });
}

export async function updatePetSitter(
  id: number,
  petSitter: Partial<PetSitters>,
): Promise<void> {
  await apiRequest(`${PET_SITTERS_URL}/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(petSitter),
  });
}

export async function createPetSitter(
  petSitter: Omit<PetSitters, "id">,
): Promise<void> {
  await apiRequest(PET_SITTERS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(petSitter),
  });
}
