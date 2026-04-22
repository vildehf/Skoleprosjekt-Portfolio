import { BASE_URL, API_KEY } from "../../ts/api.ts";
import { login } from "../../ts/api.ts";

let pets = [];

const form = document.getElementById("pet-form");

const nameInput = document.getElementById("pet-name");
const weightInput = document.getElementById("pet-weight");
const ageInput = document.getElementById("pet-age-years");
const breedInput = document.getElementById("pet-breed");
const allergyInput = document.getElementById("allergy");

const nameError = document.getElementById("name-error");
const weightError = document.getElementById("weight-error");
const ageError = document.getElementById("age-error");
const breedError = document.getElementById("breed-error");
const allergyError = document.getElementById("allergy-error");


form.addEventListener("submit", function (e) {
  e.preventDefault();

  let valid = true;

  if (!nameInput.reportValidity() || nameInput.value().length < 2) 
  if (!weightInput.reportValidity() || parseFloat(weightInput.value) < 1) 
  if (!ageInput.reportValidity() || parseInt(ageInput.value) < 1)
  if (!breedInput.reportValidity() || breedInput.value.trim().length < 2) 
  if (!nameInput.reportValidity() || nameInput.value.trim().length < 2) 

  if (!valid) return;

  const name = nameInput.value.trim();
  const weight = parseFloat(weightInput.value);
  const age = parseInt(ageInput.value);
  const breed = breedInput.value.trim();
  const gender = document.querySelector('input[name="gender"]:checked')?.value || "";
  const allergy = allergyInput.value;

  const pet = {
  id,
  name,
  weight,
  age,
  breed,
  gender,
  allergy,
  image: "https://www.amatorfotografen.no/images/1000x700-Hund-Laika-Laika-20111023_02_2113.jpg"
};
  

  pets.push(pet);

  renderPets(pets);

  console.log("Pets lagret:", pets);

  form.reset();
  
});

function renderPets(petsList) {
  const container = document.getElementById("pets-container");

  container.innerHTML = "";

  if (petsList.length === 0) {
    container.innerHTML = `<p class="empty-state">Ingen kjæledyr registrert ennå.</p>`;
    return;
  }

  petsList.forEach((pet) => {
    const card = document.createElement("article");
    card.className = "pet-card";

card.innerHTML = `
  <div class="pet-card-content">
    <div class="pet-card-info">
      <h3 class="pet-name">${pet.name}</h3>
      <p class="pet-meta">Rase: ${pet.breed}</p>
      <p class="pet-meta">Alder: ${pet.age} år</p>
      <p class="pet-meta">Vekt: ${pet.weight} kg</p>
      <p class="pet-meta">Kjønn: ${pet.gender === "him" ? "Han" : "Hun"}</p>
      <p class="pet-meta">Allergi: ${pet.allergy}</p>
    </div>

    ${
      pet.image
        ? `
      <div class="pet-card-image">
        <img src="${pet.image}" alt="Bilde av ${pet.name}">
      </div>
    `
        : ""
    }

    <div class="pet-card-actions">
      <button class="btn btn-ghost edit-btn" data-id="${pet.id}">Rediger</button>
      <button class="btn btn-ghost delete-btn" data-id="${pet.id}">Slett</button>
    </div>
  </div>
`;

    container.appendChild(card);
  });
} 

 renderPets(pets);