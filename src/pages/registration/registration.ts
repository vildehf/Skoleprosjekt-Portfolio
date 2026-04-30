import { BASE_URL, API_KEY } from "../../ts/api.ts";
import { login } from "../../ts/api.ts";
import type { Dog, Users } from "../../ts/types.ts";

let dogs: Dog[] = [];
let editingId: number | null = null;

/* Variabler */

const loginSection = document.getElementById("login-section") as HTMLElement;
const loginForm = document.getElementById("login-form") as HTMLFormElement;
const statusMessage = document.getElementById("status-message") as HTMLParagraphElement;
const form = document.getElementById("pet-form") as HTMLFormElement;

const nameInput = document.getElementById("pet-name") as HTMLInputElement;
const weightInput = document.getElementById("pet-weight") as HTMLInputElement;
const ageInput = document.getElementById("pet-age-years") as HTMLInputElement;
const breedInput = document.getElementById("pet-breed") as HTMLInputElement;
const allergyInput = document.getElementById("allergy") as HTMLInputElement;

const nameError = document.getElementById("name-error") as HTMLSpanElement;
const weightError = document.getElementById("weight-error") as HTMLSpanElement;
const ageError = document.getElementById("age-error") as HTMLSpanElement;
const breedError = document.getElementById("breed-error") as HTMLSpanElement;
const allergyError = document.getElementById("allergy-error") as HTMLSpanElement;

const formTitle = document.getElementById("form-title") as HTMLHeadingElement;
const submitButton = document.querySelector('button[type="submit"]') as HTMLButtonElement;
const deleteButton = document.getElementById("delete-button") as HTMLButtonElement;

/* Logg inn funksjon*/

function showStatus(message: string, isError = false): void {
  statusMessage.textContent = message;
  statusMessage.classList.remove("hidden", "error", "success");
  statusMessage.classList.add(isError ? "error" : "success");
}

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = (document.getElementById("email") as HTMLInputElement).value;
  const password = (document.getElementById("password") as HTMLInputElement).value;

  try {
    const data = await login(email, password);
   localStorage.setItem("API_KEY", data.API_KEY);
    showStatus("Du er nå logget inn");

    setTimeout(() => {
      loginSection.classList.add("hidden");
    }, 2000);
  } catch (error) {
    showStatus((error as Error).message, true);
  }
});

function resetErrors() {
  nameError.textContent = "";
  weightError.textContent = "";
  ageError.textContent = "";
  breedError.textContent = "";
  allergyError.textContent = "";

  nameError.classList.remove("show");
  weightError.classList.remove("show");
  ageError.classList.remove("show");
  breedError.classList.remove("show");
  allergyError.classList.remove("show");
}

function resetForm() {
  form.reset();
  editingId = null;
  formTitle.textContent = "Fortell oss om hunden din";
  submitButton.textContent = "Lagre opplysninger";
  resetErrors();
}

function validateForm() {
 
  let valid = true;
  resetErrors();

  if (!nameInput.reportValidity() || nameInput.value.trim().length < 2) 
  if (!weightInput.reportValidity() || parseFloat(weightInput.value) < 1) 
  if (!ageInput.reportValidity() || parseInt(ageInput.value) < 1)
  if (!breedInput.reportValidity() || breedInput.value.trim().length < 2) 
  if (!nameInput.reportValidity() || nameInput.value.trim().length < 2) 
  if (!allergyInput.reportValidity() || allergyInput.value.trim().length < 2) 

  return valid;
}


form.addEventListener("submit", function (event) {
  event.preventDefault();

  if (!validateForm()) return;

  const name = nameInput.value.trim();
  const weight = parseFloat(weightInput.value);
  const age = parseInt(ageInput.value);
  const breed = breedInput.value.trim();
  const allergy = allergyInput.value.trim();
  const selectedGender = document.querySelector('input[name="gender"]:checked') as HTMLInputElement | null;
  const gender = selectedGender ? (selectedGender.value as "Him" | "Her") : "Him";


  dogs.push(Dog);
  renderDogs(dogs);
  console.log("Hund lagret:", dogs);
  resetForm();
});

function renderDogs(dogsList: Dog[]) {
  const container = document.getElementById("pets-container");

  if (!container) return; "";

  if (dogsList.length === 0) {
    container.innerHTML = `<p class="empty-state">Ingen hunder registrert ennå.</p>`;
    return;
  }

  dogsList.forEach((dog: Dog) => {
    const card = document.createElement("article");
    card.className = "pet-card";

card.innerHTML = `
  <div class="pet-card-content">
    <div class="pet-card-info">
      <h3 class="pet-name">${dog.name}</h3>
      <p class="pet-meta">Rase: ${dog.breed}</p>
      <p class="pet-meta">Alder: ${dog.age} år</p>
      <p class="pet-meta">Vekt: ${dog.weight} kg</p>
      <p class="pet-meta">Kjønn: ${dog.gender === "Him" ? "Han" : "Hun"}</p>
      <p class="pet-meta">Allergi: ${dog.allergies[0]}</p>
    </div>

    ${
      dog.image
        ? `
      <div class="pet-card-image">
        <img src="${dog.image}" alt="Bilde av ${dog.name}">
      </div>
    `
        : ""
    }

    <div class="pet-card-actions">
      <button class="btn btn-ghost edit-btn" data-id="${dog.id}">Rediger</button>
      <button class="btn btn-ghost delete-btn" data-id="${dog.id}">Slett</button>
    </div>
  </div>
`;

    container.appendChild(card);
  });
} 
async function loadUserDogs() {
  const loggedInEmail = localStorage.getItem("LoggedinUser");

  if (!loggedInEmail) {
    return;
  }

  const response = await fetch(`${BASE_URL}/users`, {
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${API_KEY}`,
    },
  });
  const data = await response.json();

  const currentUser = data.users.find((user: Users) => user.email === loggedInEmail);

  if (!currentUser) {
    return;
  }

  dogs = currentUser.dogs;
  renderDogs(dogs);
}

loadUserDogs();