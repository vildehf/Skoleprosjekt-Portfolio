// Siden er laget av Vilde Hvitstein
// Denne filen håndterer CRUD-funksjonalitet (Create, Read, Update, Delete) for hundepassere.
// Data hentes fra et API og vises som kort i en liste. Brukeren kan legge til, redigere og slette
// hundepassere via et modal-skjema. Alt oppdateres dynamisk uten side reload.
const addSitterBtn = document.getElementById("add-sitter-btn");
const closeModalBtn = document.getElementById("close-modal-btn");
const cancelBtn = document.getElementById("cancel-btn");
const modal = document.getElementById("sitter-modal");
const sitterList = document.getElementById("sitter-list");
const sitterForm = document.getElementById("sitter-form");

const BASE_URL = "http://127.0.0.1:3000/api/petSitters";
const API_KEY = "API123456";

let editingId = null;

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
function fillForm(ps) {
  document.getElementById("name").value = ps.name || "";
  document.getElementById("city").value = ps.location || "";
  document.getElementById("pricePerDay").value = ps.pricePerDay || "";
  document.getElementById("rating").value = ps.rating || "";
  document.getElementById("reviewCount").value = ps.reviewCount || "";
  document.getElementById("description").value = ps.experienceDescription || "";
  document.getElementById("image").value = ps.image || "";
}

// READ / render
async function loadPetSitters() {
  if (!sitterList) return;

  try {
    const response = await fetch(BASE_URL);
    const petSitters = await response.json();

    sitterList.innerHTML = "";

    petSitters.forEach((ps) => {
      const imageSrc = ps.image || "assets/dogsitter1.png";

      const card = document.createElement("article");
      card.className = "card sitter-row";
      card.dataset.id = ps.id;

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
            <a class="btn btn-primary" href="/src/html/profile.html">Se profil</a>
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
async function deletePetSitter(id) {
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
async function updatePetSitter(id, updatedPetSitter) {
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
async function createPetSitter(newPetSitter) {
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
      name: document.getElementById("name").value,
      location: document.getElementById("city").value,
      pricePerDay: Number(document.getElementById("pricePerDay").value),
      rating: Number(document.getElementById("rating").value),
      reviewCount: Number(document.getElementById("reviewCount").value),
      experienceDescription: document.getElementById("description").value,
      image: document.getElementById("image").value,
      updated: new Date().toISOString(),
    };

    if (editingId) {
      await updatePetSitter(editingId, petSitterData);
    } else {
      await createPetSitter({
        ...petSitterData,
        created: new Date().toISOString(),
        maxDogs: 1,
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
