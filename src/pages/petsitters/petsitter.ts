// Siden er laget av Vilde Hvitstein
// Denne filen håndterer CRUD-funksjonalitet (Create, Read, Update, Delete) for hundepassere.
// Data hentes fra et API og vises som kort i en liste. Brukeren kan legge til, redigere og slette

import type { petSitters } from "../../ts/types";

// hundepassere via et modal-skjema. Alt oppdateres dynamisk uten side reload.
const addSitterBtn = document.getElementById("add-sitter-btn");
const closeModalBtn = document.getElementById("close-modal-btn");
const cancelBtn = document.getElementById("cancel-btn");
const modal = document.getElementById("sitter-modal");
const sitterList = document.getElementById("sitter-list");
const sitterForm = document.getElementById(
  "sitter-form",
) as HTMLFormElement | null;

const BASE_URL = "http://localhost:3000/api/petSitters";
const API_KEY = "123";

let editingId: number | null = null;

// Modal
function openModal() {
  if (!modal) return;
  modal.classList.add("active");
}

function closeModal() {
  if (!modal) return;
  modal.classList.remove("active");
}

// Fyll skjema ved redigering
function fillForm(ps: petSitters): void {
  (document.getElementById("name") as HTMLInputElement).value = ps.name ?? "";
  (document.getElementById("city") as HTMLInputElement).value =
    ps.location ?? "";
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
}

// READ / render
async function loadPetSitters() {
  if (!sitterList) return;

  try {
    const response = await fetch(BASE_URL);
    const petSitters: petSitters[] = await response.json();

    sitterList.innerHTML = "";

    petSitters.forEach((ps) => {
      const imageSrc = ps.image || "assets/dogsitter1.png";

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
          <h4 class="sitter-name">${ps.name}</h4>
          <p class="sitter-meta">${ps.location}</p>
          <p class="sitter-desc">${ps.experienceDescription}</p>
        </div>

        <div class="sitter-side">
          <p class="sitter-price"><strong>${ps.pricePerDay} kr</strong> / døgn</p>
          <p class="sitter-rating">
            ★ ${ps.rating} <span class="muted">(${ps.reviewCount} anmeldelser)</span>
          </p>

          <div class="sitter-card-actions">
            <a class="btn btn-primary" href="/src/pages/profile.html">Se profil</a>
            <button class="btn btn-ghost edit-btn" type="button" data-id="${ps.id}">
              Rediger
            </button>
            <button class="btn btn-ghost delete-btn" type="button" data-id="${ps.id}">
              Slett
            </button>
          </div>
        </div>
      `;

      const deleteBtn = card.querySelector(".delete-btn");
      const editBtn = card.querySelector(".edit-btn");

      if (deleteBtn) {
        deleteBtn.addEventListener("click", () => {
          deletePetSitter(ps.id);
        });
      }

      if (editBtn) {
        editBtn.addEventListener("click", () => {
          editingId = ps.id;
          fillForm(ps);
          openModal();
        });
      }

      sitterList.appendChild(card);
    });
  } catch (error) {
    console.error("Feil:", error);
  }
}

// DELETE
async function deletePetSitter(id: number): Promise<void> {
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
  } catch (error) {
    console.error("Feil ved sletting:", error);
  }
}

// UPDATE
async function updatePetSitter(
  id: number,
  updatedPetSitter: Partial<petSitters>,
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
    editingId = null;
  } catch (error) {
    console.error("Feil ved oppdatering:", error);
  }
}

// CREATE
async function createPetSitter(
  newPetSitter: Omit<petSitters, "id">,
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
  } catch (error) {
    console.error("Feil ved oppretting:", error);
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

// Submit form
if (sitterForm) {
  sitterForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const petSitterData = {
      name: (document.getElementById("name") as HTMLInputElement).value,
      location: (document.getElementById("city") as HTMLInputElement).value,
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
      updated: new Date().toISOString(),
    };

    if (editingId !== null) {
      await updatePetSitter(editingId, petSitterData);
    } else {
      await createPetSitter({
        ...petSitterData,
        created: new Date().toISOString(),
        acceptsPuppies: false,
        acceptsLargeDogs: false,
        yearsOfExperience: 1,
        available: true,
      });
    }

    sitterForm.reset();
  });
}

// Init
loadPetSitters();
