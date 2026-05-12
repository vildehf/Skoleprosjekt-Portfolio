/* Siden av laget av Silje Elvik */

/* 
Opprett hund - Create
Endre hund - Update
Hent hund/hunder fra Users - Read
Slett hund - Delete 
*/
  

import { login , getUsers, updateUser } from "../../ts/api.ts";
import type { Dog, Users, Allergy } from "../../ts/types.ts";

let dogs: Dog[] = [];
let editingId: number | null = null;
let currentUser: Users | null = null;
let dogToDelete: number | null = null;


/* Variabler */

const loginSection = document.getElementById("login-section") as HTMLElement;
const logoutButton = document.getElementById("logout-button") as HTMLButtonElement;
const loginForm = document.getElementById("login-form") as HTMLFormElement;
const statusMessage = document.getElementById("status-message") as HTMLParagraphElement;
const form = document.getElementById("pet-form") as HTMLFormElement;
const petsContainer = document.getElementById("pets-container") as HTMLDivElement;

const nameInput = document.getElementById("pet-name") as HTMLInputElement;
const weightInput = document.getElementById("pet-weight") as HTMLInputElement;
const ageInput = document.getElementById("pet-age-years") as HTMLInputElement;
const breedInput = document.getElementById("pet-breed") as HTMLInputElement;
const allergyInput = document.getElementById("allergy") as HTMLSelectElement;

const nameError = document.getElementById("name-error") as HTMLSpanElement;
const weightError = document.getElementById("weight-error") as HTMLSpanElement;
const ageError = document.getElementById("age-error") as HTMLSpanElement;
const breedError = document.getElementById("breed-error") as HTMLSpanElement;
const allergyError = document.getElementById("allergy-error") as HTMLSpanElement;

const formTitle = document.getElementById("form-title") as HTMLHeadingElement;
const submitButton = document.getElementById("submit-button") as HTMLButtonElement;
const deleteButton = document.getElementById("delete-button") as HTMLButtonElement;

const petsLoading = document.getElementById("pets-loading") as HTMLDivElement;

const deleteModal = document.getElementById("delete-modal") as HTMLDivElement;
const deleteModalText = document.getElementById("delete-modal-text") as HTMLParagraphElement;
const cancelDeleteButton = document.getElementById("cancel-delete") as HTMLButtonElement;
const confirmDeleteButton = document.getElementById("confirm-delete") as HTMLButtonElement;

/* Logg inn funksjon*/

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

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
   showStatus("Logger inn...");

   await delay(1000);

    
    await loadUserDogs();
    showStatus("Du er nå logget inn");

   setTimeout(() => {
  loginSection.classList.add("hidden");
  logoutButton.classList.remove("hidden");
}, 2000);
  } catch (error) {
    showStatus((error as Error).message, true);
  }
});

/* Logg ut funksjon */

logoutButton.addEventListener("click", () => {
  localStorage.removeItem("LoggedinUser");
  localStorage.removeItem("API_KEY");

  dogs = [];
  currentUser = null;

  renderDogs([]);
  resetForm();
  loginForm.reset(); 

  statusMessage.textContent = "";
  statusMessage.classList.add("hidden");
  statusMessage.classList.remove("success", "error");

  loginSection.classList.remove("hidden");
  logoutButton.classList.add("hidden");

 
  
});

/* Reset form */

function resetErrors(): void {
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

function resetForm(): void {
  form.reset();
  editingId = null;
  formTitle.textContent = "Fortell oss om hunden din";
  submitButton.textContent = "Lagre opplysninger";
  resetErrors();
}

/* Validerings funksjon */

function validateForm(): boolean {
 
  let valid = true;
  resetErrors();

  if (!nameInput.reportValidity() || nameInput.value.trim().length < 2) 
    {
    valid = false;
  }
  if (!weightInput.reportValidity() || parseFloat(weightInput.value) < 1) {
    valid = false;
  }
    
  if (!ageInput.reportValidity() || parseInt(ageInput.value) < 1) {
    valid = false;
  }
  if (!breedInput.reportValidity() || breedInput.value.trim().length < 2) {
    valid = false;
  }

  if (!allergyInput.reportValidity() || allergyInput.value.trim().length < 2) {
    valid = false;
  }

  return valid;
}

/* Lagre hund */ 

form.addEventListener("submit", async function (event) {
  event.preventDefault();

  if (!validateForm()) return;

  const name = nameInput.value.trim();
  const weight = parseFloat(weightInput.value);
  const age = parseInt(ageInput.value);
  const breed = breedInput.value.trim();
  const allergy = allergyInput.value as Allergy;

  const selectedGender = document.querySelector(
    'input[name="gender"]:checked') as HTMLInputElement | null;
  const gender = selectedGender ? (selectedGender.value as "Him" | "Her") : "Him";

  if (editingId !== null) {
  const dogToEdit = dogs.find((dog) => dog.id === editingId);

  if (dogToEdit) {
    dogToEdit.name = name;
    dogToEdit.weight = weight;
    dogToEdit.age = age;
    dogToEdit.breed = breed;
    dogToEdit.gender = gender;
    dogToEdit.allergies = [allergy];
  }
} else {

  const newId = dogs.length > 0 ? Math.max(...dogs.map((dog) => dog.id)) + 1 : 1;

  const newDog: Dog = {
    id: newId,
    name: name,
    weight: weight,
    age: age,
    breed: breed,
    gender: gender,
    allergies: [allergy],
  };

  dogs.push(newDog);
}
    if (!currentUser) return;

  currentUser.dogs = dogs;
  await updateUser(currentUser);

  renderDogs(dogs);
  console.log("Hund lagret:", dogs);
  resetForm();
});

/* Vis hunder */ 

function renderDogs(dogsList: Dog[]): void {
  petsContainer.innerHTML = "";

  if (dogsList.length === 0) {
    petsContainer.innerHTML = `<p class="empty-state">Ingen hunder registrert ennå.</p>`;
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

    <div class="pet-card-actions">
      <button class="btn edit-btn" data-id="${dog.id}">Rediger</button>
      <button class="btn btn-ghost delete-btn" data-id="${dog.id}">Slett</button>
    </div>
  </div>
`;

    petsContainer.appendChild(card);

    const editButton = card.querySelector(".edit-btn") as HTMLButtonElement;
    const deleteCardButton = card.querySelector(".delete-btn") as HTMLButtonElement;

    editButton.addEventListener("click", () => {
      editingId = dog.id;
      
      nameInput.value = dog.name;
      weightInput.value = dog.weight.toString();
      ageInput.value = dog.age.toString();
      breedInput.value = dog.breed;
      allergyInput.value = dog.allergies[0];
      
      const genderInput = document.querySelector(
        `input[name="gender"][value="${dog.gender}"]`
      ) as HTMLInputElement | null;
    
      if (genderInput) {
        genderInput.checked = true;
      }
    
      formTitle.textContent = "Endre informasjon om hunden";
      submitButton.textContent = "Oppdater opplysninger";
    });

    deleteCardButton.addEventListener("click", () => {
      dogToDelete = dog.id;

      deleteModalText.textContent =
        `Er du sikker på at du ønsker å slette ${dog.name}?`;

      deleteModal.classList.remove("hidden");
})})}; 

/* Hent hunder */ 


async function loadUserDogs(): Promise<void> {
  setLoading(true);

  try {
    await delay(2000);

    const users = await getUsers();
    const loggedInEmail = localStorage.getItem("LoggedinUser");

    currentUser = users.find((user) => user.email === loggedInEmail) ?? null;

    if (!currentUser) {
      throw new Error("Fant ikke innlogget bruker");
    }

    dogs = currentUser.dogs ?? [];
    renderDogs(dogs);
  } catch (error) {
    console.error(error);
    statusMessage.textContent = "Kunne ikke laste hundene dine.";
  } finally {
    setLoading(false);
  }
}

cancelDeleteButton.addEventListener("click", () => {
  deleteModal.classList.add("hidden");
  dogToDelete = null;
});

confirmDeleteButton.addEventListener("click", async () => {
  if (dogToDelete === null) return;

  const deletedDog = dogs.find((dog) => dog.id === dogToDelete);

  dogs = dogs.filter((dog) => dog.id !== dogToDelete);

  if (!currentUser) return;

  currentUser.dogs = dogs;
  await updateUser(currentUser);

  renderDogs(dogs);
  resetForm();

  deleteModal.classList.add("hidden");

  showStatus(`${deletedDog?.name ?? "Hunden"} ble slettet.`);

  dogToDelete = null;
});

/* Slett knapp */ 

deleteButton.addEventListener("click", resetForm);

if (localStorage.getItem("LoggedinUser")) {
  loginSection.classList.add("hidden");
  logoutButton.classList.remove("hidden");

  await loadUserDogs();
}

/* Loading state */ 

function setLoading(isLoading: boolean): void {
  if (isLoading) {
    petsLoading.classList.remove("hidden");
    petsContainer.classList.add("hidden");
  } else {
    petsLoading.classList.add("hidden");
    petsContainer.classList.remove("hidden");
  }
}