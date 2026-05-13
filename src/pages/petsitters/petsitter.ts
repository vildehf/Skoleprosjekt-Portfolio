// Siden er laget av Vilde Hvitstein
// Denne filen håndterer CRUD-funksjonalitet (Create, Read, Update, Delete) for hundepassere.
// Data hentes fra et API og vises som kort i en liste. Brukeren kan legge til, redigere og slette

import type { PetSitters } from "../../ts/types";

// hundepassere via et modal-skjema. Alt oppdateres dynamisk uten side reload.
const addSitterBtn = document.getElementById("add-sitter-btn");
const closeModalBtn = document.getElementById("close-modal-btn");
const cancelBtn = document.getElementById("cancel-btn");
const modal = document.getElementById("sitter-modal");
// Enkel validering før data sendes til API
const formMessage = document.getElementById(
  "form-message",
) as HTMLParagraphElement | null;
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

const BASE_URL = "http://localhost:3000/api/petSitters";
const API_KEY = "123";

let editingId: number | null = null;
let allPetSitters: PetSitters[] = [];
let expandedId: number | null = null;

async function loadPetSitters() {
  if (!sitterList) return;

  sitterList.innerHTML = "<p>Laster hundepassere...</p>";

  try {
    const response = await fetch(BASE_URL);

    if (!response.ok) {
      throw new Error("Kunne ikke hente hundepassere");
    }

    const petSitters: PetSitters[] = await response.json();
    allPetSitters = petSitters;
    renderPetSitters(allPetSitters);

    if (petSitters.length === 0) {
      sitterList.innerHTML = "<p>Ingen hundepassere funnet.</p>";
    }

    if (filterButton) filterButton.disabled = false;
  } catch (error) {
    console.error("Feil:", error);
    sitterList.innerHTML = "<p>Kunne ikke laste hundepassere.</p>";

    if (filterButton) filterButton.disabled = false;
  }
}

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
    card.dataset.id = String(ps.id);

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
          <button class="btn btn-primary details-btn" type="button" data-id="${ps.id}">
          ${expandedId === ps.id ? "Skjul detaljer" : "Se detaljer"}
          </button>
          <button class="btn btn-ghost edit-btn" type="button" data-id="${ps.id}">
            Rediger
          </button>
          <button class="btn-delete delete-btn" type="button" data-id="${ps.id}">
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

// Modal
function openModal() {
  if (!modal) return;
  modal.classList.add("active");
  modal.setAttribute("aria-hidden", "false");

  if (formMessage) {
    formMessage.textContent = "";
    formMessage.className = "form-message";
  }
}

function closeModal() {
  if (!modal) return;
  modal.classList.remove("active");
  modal.setAttribute("aria-hidden", "true");
}

// Fyll skjema ved redigering
function fillForm(ps: PetSitters): void {
  const [city, postalCode] = (ps.location ?? "")
    .split(",")
    .map((part: string) => part.trim());

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
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error("Kunne ikke slette hundepasser");
    }

    loadPetSitters();

    if (pageMessage) {
      pageMessage.textContent = "Hundepasser ble slettet.";
      pageMessage.className = "form-message error";
    }
  } catch (error) {
    console.error("Feil ved sletting:", error);

    if (pageMessage) {
      pageMessage.textContent = "Kunne ikke slette hundepasser.";
      pageMessage.className = "form-message error";
    }
  }
}

// UPDATE
async function updatePetSitter(
  id: number,
  updatedPetSitter: Partial<PetSitters>,
): Promise<void> {
  try {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(updatedPetSitter),
    });

    if (!response.ok) {
      throw new Error("Kunne ikke oppdatere hundepasser");
    }

    loadPetSitters();
    closeModal();

    if (pageMessage) {
      pageMessage.textContent = "Hundepasser ble oppdatert.";
      pageMessage.className = "form-message success";
    }

    editingId = null;
  } catch (error) {
    console.error("Feil ved oppdatering:", error);

    if (formMessage) {
      formMessage.textContent = "Kunne ikke oppdatere hundepasser.";
      formMessage.className = "form-message error";
    }
  }
}

// CREATE
async function createPetSitter(
  newPetSitter: Omit<PetSitters, "id">,
): Promise<void> {
  try {
    const response = await fetch(BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(newPetSitter),
    });

    if (!response.ok) {
      throw new Error("Kunne ikke opprette hundepasser");
    }

    loadPetSitters();
    closeModal();

    if (pageMessage) {
      pageMessage.textContent = "Hundepasser ble opprettet.";
      pageMessage.className = "form-message success";
    }
  } catch (error) {
    console.error("Feil ved oppretting:", error);

    if (formMessage) {
      formMessage.textContent = "Kunne ikke opprette hundepasser.";
      formMessage.className = "form-message error";
    }
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

if (closeModalBtn) {
  closeModalBtn.addEventListener("click", closeModal);
}

if (cancelBtn) {
  cancelBtn.addEventListener("click", closeModal);
}

if (modal) {
  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && modal?.classList.contains("active")) {
    closeModal();
  }
});

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
if (sitterForm) {
  sitterForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const postalCodeInput = document.getElementById(
      "postalCode",
    ) as HTMLInputElement;

    const postalCode = postalCodeInput.value.trim();

    if (!/^\d{4}$/.test(postalCode)) {
      if (formMessage) {
        formMessage.textContent = "Postnummer må bestå av 4 tall.";
        formMessage.className = "form-message error";
      }

      postalCodeInput.focus();
      return;
    }

    if (!sitterForm.checkValidity()) {
      sitterForm.reportValidity();
      return;
    }

    const city = (document.getElementById("city") as HTMLInputElement).value;

    const location = postalCode ? `${city}, ${postalCode}` : city;

    const availabilityStatus = (
      document.getElementById("availabilityStatus") as HTMLSelectElement
    ).value;

    const available = availabilityStatus !== "Ikke ledig";

    const petSitterData = {
      name: (document.getElementById("name") as HTMLInputElement).value,
      location,
      pricePerDay: Number(
        (document.getElementById("pricePerDay") as HTMLInputElement).value,
      ),
      rating: Number(
        (document.getElementById("rating") as HTMLInputElement).value,
      ),
      reviewCount: Number(
        (document.getElementById("reviewCount") as HTMLInputElement).value,
      ),
      experienceDescription: (
        document.getElementById("description") as HTMLTextAreaElement
      ).value,
      image: (document.getElementById("image") as HTMLInputElement).value,
      available,
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
}

// Init
loadPetSitters();
