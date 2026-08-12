// Siden er laget av Vilde Hvitstein Fristad
// Håndterer CRUD for hundepassere med API-et

import type { PetSitters } from "../../ts/types.ts";
import { BASE_URL, API_KEY } from "../../ts/api.ts";
import { openModal, closeModal } from "./petSitterModal.ts";

const PET_SITTERS_URL = `${BASE_URL}/petsitters`;

// DOM-elementer
const addSitterBtn = document.getElementById("add-sitter-btn");

const pageMessage = document.getElementById(
  "page-message",
) as HTMLParagraphElement | null;
const sitterList = document.getElementById("sitter-list");
const sitterForm = document.getElementById(
  "sitter-form",
) as HTMLFormElement | null;
const filterButton = document.querySelector(
  ".filter-form button[type='submit']",
) as HTMLButtonElement | null;

if (filterButton) filterButton.disabled = true;

// Globale variabler
let editingId: number | null = null;
let allPetSitters: PetSitters[] = [];
let expandedId: number | null = null;

// Vis midlertidig melding på siden
function showPageMessage(message: string, type: "success" | "error"): void {
  if (!pageMessage) return;

  pageMessage.textContent = message;
  pageMessage.className = `form-message ${type}`;

  setTimeout(() => {
    pageMessage.textContent = "";
    pageMessage.className = "form-message";
  }, 3000);
}

async function loadPetSitters(): Promise<void> {
  if (!sitterList) return;

  sitterList.innerHTML = "<p>Laster hundepassere...</p>";

  try {
    const response = await fetch(PET_SITTERS_URL);

    if (!response.ok) {
      throw new Error();
    }

    const petSitters: PetSitters[] = await response.json();
    allPetSitters = petSitters;
    renderPetSitters(allPetSitters);

    if (petSitters.length === 0) {
      sitterList.innerHTML = "<p>Ingen hundepassere funnet.</p>";
    }
  } catch {
    sitterList.innerHTML = "<p>Kunne ikke laste hundepassere.</p>";
  } finally {
    if (filterButton) filterButton.disabled = false;
  }
}

async function apiRequest(
  url: string,
  options: RequestInit = {},
): Promise<void> {
  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      ...options.headers,
    },
  });

  if (!response.ok) throw new Error();
}

// Render hundepasser-kort
function renderPetSitters(petSitters: PetSitters[]) {
  if (!sitterList) return;

  sitterList.innerHTML = "";

  if (petSitters.length === 0) {
    return;
  }

  petSitters.forEach((ps) => {
    const imageSrc = ps.image
      ? `/src/${ps.image}`
      : "/src/assets/dogsitter1.png";

    const card = document.createElement("article");
    card.className = "card sitter-row";

    card.innerHTML = `
      <div class="sitter-portrait">
        <img 
          src="${imageSrc}"
          alt="Portrett av ${ps.name}"
          width="96"
          height="96"
          loading="lazy"
        />
      </div>

      <div class="sitter-info">
        <h3 class="sitter-name">${ps.name}</h3>
        <p class="sitter-meta">${ps.location}</p>

        <div class="sitter-badges">
          <span class="badge">${ps.available ? "Ledig" : "Ikke ledig"}</span>
          <span class="badge">${ps.yearsOfExperience} års erfaring</span>
        </div>

        <p class="sitter-desc">${ps.experienceDescription}</p>
      </div>

      <div class="sitter-side">
        <p class="sitter-price"><strong>${ps.pricePerDay} kr</strong> / døgn</p>
        <p class="sitter-rating">
          ★ ${ps.rating} <span class="muted">(${ps.reviewCount} anmeldelser)</span>
        </p>

        <div class="sitter-card-actions">
          <button class="btn btn-primary details-btn" type="button">
          ${expandedId === ps.id ? "Skjul detaljer" : "Se detaljer"}
          </button>
          <button class="btn btn-ghost edit-btn" type="button">
            Rediger
          </button>
          <button class="btn-delete delete-btn" type="button">
            Slett
          </button>
        </div>
      </div>
    ${
      expandedId === ps.id
        ? `
      <div class="sitter-details">
        <h4>Detaljer</h4>
        <p><strong>Erfaring:</strong> ${ps.yearsOfExperience} år</p>
        <p><strong>Beskrivelse:</strong> ${ps.experienceDescription}</p>
        <p><strong>Maks antall hunder:</strong> ${ps.maxDogs}</p>
        <p><strong>Tar valper:</strong> ${ps.acceptsPuppies ? "Ja" : "Nei"}</p>
        <p><strong>Tar store hunder:</strong> ${ps.acceptsLargeDogs ? "Ja" : "Nei"}</p>
      </div>
    `
        : ""
    }
`;

    card.querySelector(".details-btn")?.addEventListener("click", () => {
      expandedId = expandedId === ps.id ? null : ps.id;
      renderPetSitters(petSitters);
    });

    card.querySelector(".delete-btn")?.addEventListener("click", () => {
      deletePetSitter(ps.id);
    });

    card.querySelector(".edit-btn")?.addEventListener("click", () => {
      editingId = ps.id;
      fillForm(ps);
      openModal();
    });

    sitterList.appendChild(card);
  });
}

// Filtrering
function applyFilters(): void {
  const place = (document.getElementById("place") as HTMLInputElement).value
    .toLowerCase()
    .trim();

  const availability = (
    document.getElementById("availability") as HTMLSelectElement
  ).value;

  const maxPrice = Number(
    (document.getElementById("price") as HTMLInputElement).value,
  );

  const filteredSitters = allPetSitters.filter((sitter) => {
    const matchesPlace = sitter.location.toLowerCase().includes(place);
    const matchesPrice = sitter.pricePerDay <= maxPrice;

    const matchesAvailability =
      availability === "all" ||
      (availability === "available" && sitter.available === true) ||
      (availability === "unavailable" && sitter.available === false);

    return matchesPlace && matchesPrice && matchesAvailability;
  });

  renderPetSitters(filteredSitters);

  sitterList?.insertAdjacentHTML(
    "afterbegin",
    filteredSitters.length === 0
      ? `<p class="empty-state">Ingen resultater matcher filteret ditt.</p>`
      : `<p>Viser ${filteredSitters.length} resultater</p>`,
  );
}

// Fyll skjema ved redigering
function fillForm(ps: PetSitters): void {
  const [city, postalCode] = (ps.location ?? "")
    .split(",")
    .map((part) => part.trim());

  (document.getElementById("name") as HTMLInputElement).value = ps.name ?? "";
  (document.getElementById("city") as HTMLInputElement).value = city ?? "";
  (document.getElementById("postalCode") as HTMLInputElement).value =
    postalCode ?? "";
  (document.getElementById("pricePerDay") as HTMLInputElement).value = String(
    ps.pricePerDay ?? "",
  );
  (document.getElementById("rating") as HTMLInputElement).value = String(
    ps.rating ?? "",
  );
  (document.getElementById("reviewCount") as HTMLInputElement).value = String(
    ps.reviewCount ?? "",
  );
  (document.getElementById("description") as HTMLTextAreaElement).value =
    ps.experienceDescription ?? "";
  (document.getElementById("image") as HTMLInputElement).value = ps.image ?? "";
  (document.getElementById("availabilityStatus") as HTMLSelectElement).value =
    ps.available ? "Ledig" : "Ikke ledig";
}

// DELETE
async function deletePetSitter(id: number): Promise<void> {
  if (!confirm("Er du sikker på at du vil slette hundepasseren?")) return;

  try {
    await apiRequest(`${PET_SITTERS_URL}/${id}`, {
      method: "DELETE",
    });

    await loadPetSitters();
    showPageMessage("Hundepasser ble slettet.", "success");
  } catch {
    showPageMessage("Kunne ikke slette hundepasser.", "error");
  }
}

// UPDATE
async function updatePetSitter(
  id: number,
  updatedPetSitter: Partial<PetSitters>,
): Promise<void> {
  try {
    await apiRequest(`${PET_SITTERS_URL}/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedPetSitter),
    });

    await loadPetSitters();
    closeModal();
    showPageMessage("Hundepasser ble oppdatert.", "success");

    editingId = null;
  } catch {
    showPageMessage("Kunne ikke oppdatere hundepasser.", "error");
  }
}

// CREATE
async function createPetSitter(
  newPetSitter: Omit<PetSitters, "id">,
): Promise<void> {
  try {
    await apiRequest(PET_SITTERS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newPetSitter),
    });

    await loadPetSitters();
    closeModal();
    showPageMessage("Hundepasser ble opprettet.", "success");
  } catch {
    showPageMessage("Kunne ikke opprette hundepasser.", "error");
  }
}

// Event listener
if (addSitterBtn) {
  addSitterBtn.addEventListener("click", () => {
    editingId = null;
    if (sitterForm) sitterForm.reset();
    openModal();
  });
}

const filterForm = document.querySelector(
  ".filter-form",
) as HTMLFormElement | null;

if (filterForm) {
  filterForm.addEventListener("submit", (event) => {
    event.preventDefault();

    applyFilters();
  });

  filterForm.addEventListener("reset", () => {
    setTimeout(() => {
      renderPetSitters(allPetSitters);
    }, 0);
  });
}

// Submit form
sitterForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(sitterForm);
  const city = String(formData.get("city"));
  const postalCode = String(formData.get("postalCode")).trim();

  const petSitterData = {
    name: String(formData.get("name")),
    location: postalCode ? `${city}, ${postalCode}` : city,
    pricePerDay: Number(formData.get("pricePerDay")),
    rating: Number(formData.get("rating")),
    reviewCount: Number(formData.get("reviewCount")),
    experienceDescription: String(formData.get("description")),
    image: String(formData.get("image")),
    available: formData.get("availabilityStatus") !== "Ikke ledig",
    updated: new Date().toISOString(),
  };

  if (editingId !== null) {
    await updatePetSitter(editingId, petSitterData);
  } else {
    await createPetSitter({
      ...petSitterData,
      created: new Date().toISOString(),
      maxDogs: 1,
      acceptsPuppies: false,
      acceptsLargeDogs: false,
      yearsOfExperience: 1,
    });
  }

  sitterForm.reset();
});

// Init
loadPetSitters();
