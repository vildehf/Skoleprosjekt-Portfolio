const BASE_URL = "http://localhost:3000/api";
const API_KEY = "123";
const USER_ID = 1;

let dogs = [];
let editingId = null;

const form = document.getElementById("pet-form");
const petsContainer = document.getElementById("pets-container");

const nameInput = document.getElementById("pet-name");
const weightInput = document.getElementById("pet-weight");
const ageInput = document.getElementById("pet-age-years");
const breedInput = document.getElementById("pet-breed");
const allergiesInput = document.getElementById("pet-allergies");

const nameError = document.getElementById("name-error");
const weightError = document.getElementById("weight-error");
const ageError = document.getElementById("age-error");
const breedError = document.getElementById("breed-error");
const allergiesError = document.getElementById("allergies-error");

const formTitle = document.getElementById("form-title");
const submitButton = document.getElementById("submit-btn");
const cancelButton = document.getElementById("cancel-btn");

const genderInputs = document.querySelectorAll('input[name="gender"]');
const genderButtons = document.querySelectorAll(".form-btn");


document.querySelectorAll(".form-card").forEach(group => {
  const buttons = group.querySelectorAll(".form-btn");

  buttons.forEach(button => {
    button.addEventListener("click", () => {

      if (button.classList.contains("active")) {
        button.classList.remove("active");
        return;
      }

      buttons.forEach(btn => btn.classList.remove("active"));
      button.classList.add("active");
    });
  });
});

function resetErrors() {
  nameError.textContent = "";
  weightError.textContent = "";
  ageError.textContent = "";
  breedError.textContent = "";
  allergiesError.textContent = "";

  nameError.classList.remove("show");
  weightError.classList.remove("show");
  ageError.classList.remove("show");
  breedError.classList.remove("show");
  allergiesError.classList.remove("show");
}

function resetForm() {
  form.reset();
  editingId = null;

  formTitle.textContent = "Fortell oss om hunden din";
  submitButton.textContent = "Lagre opplysninger";

  genderButtons.forEach((btn) => btn.classList.remove("active"));
  resetErrors();
}

function validateForm() {
  let valid = true;
  resetErrors();

  if (!nameInput.reportValidity()) {
    nameError.textContent = "Navnet må inneholde minst 2 bokstaver.";
    nameError.classList.add("show");
    valid = false;
  }

  if (!weightInput.reportValidity()) {
    weightError.textContent = "Vekt må være minst 1 kg";
    weightError.classList.add("show");
    valid = false;
  }

  if (!ageInput.reportValidity()) {
    ageError.textContent = "Alder må være minst 1 år";
    ageError.classList.add("show");
    valid = false;
  }

  if (!breedInput.reportValidity()) {
    breedError.textContent = "Rase må inneholde minst 2 bokstaver";
    breedError.classList.add("show");
    valid = false;
  }

  if (!allergiesInput.reportValidity()) {
    allergiesError.textContent = "Skriv allergier eller 'Ingen'";
    allergiesError.classList.add("show");
    valid = false;
  }

  return valid;
}

function getGenderText(genderValue) {
  if (genderValue === "him" || genderValue === "Hannhund") {
    return "Hannhund";
  }

  if (genderValue === "her" || genderValue === "Tispe") {
    return "Tispe";
  }

  return "Ikke valgt";
}

function getSelectedGender() {
  const selectedGender = document.querySelector('input[name="gender"]:checked')?.value;

  if (selectedGender === "him") {
    return "Hannhund";
  }

  if (selectedGender === "her") {
    return "Tispe";
  }

  return "";
}

function setGenderInForm(genderValue) {
  genderInputs.forEach((input) => {
    input.checked = false;
  });

  genderButtons.forEach((btn) => {
    btn.classList.remove("active");
  });

  let inputToCheck = null;

  if (genderValue === "Hannhund" || genderValue === "him") {
    inputToCheck = document.getElementById("gender-him");
  } else if (genderValue === "Tispe" || genderValue === "her") {
    inputToCheck = document.getElementById("gender-her");
  }

  if (inputToCheck) {
    inputToCheck.checked = true;

    const label = document.querySelector(`label[for="${inputToCheck.id}"]`);
    if (label) {
      label.classList.add("active");
    }
  }
}

async function fetchDogs() {
  try {
    const response = await fetch(`${BASE_URL}/dogs`);

    if (!response.ok) {
      throw new Error("Kunne ikke hente hunder.");
    }

    dogs = await response.json();
    renderDogs(dogs);
  } catch (error) {
    console.error("Feil ved henting av hunder:", error);
    petsContainer.innerHTML = `<p class="empty-state">Ingen hunder registrert</p>`;
  }
}

function renderDogs(dogsList) {
  petsContainer.innerHTML = "";

  if (dogsList.length === 0) {
    petsContainer.innerHTML = `<p class="empty-state">Ingen hunder registrert ennå.</p>`;
    return;
  }

  dogsList.forEach((dog) => {
    const card = document.createElement("article");
    card.className = "pet-card";

    card.innerHTML = `
      <div class="pet-card-content">
        <div class="pet-card-info">
          <h3 class="pet-name">${dog.name}</h3>
          <p class="pet-meta">Rase: ${dog.breed}</p>
          <p class="pet-meta">Alder: ${dog.age} år</p>
          <p class="pet-meta">Vekt: ${dog.weight} kg</p>
          <p class="pet-meta">Allergier: ${dog.allergies}</p>
          <p class="pet-meta">Kjønn: ${getGenderText(dog.gender)}</p>
        </div>

         <div class="pet-card-image">
          ${
            dog.image
              ? `<img src="${dog.image}" alt="Bilde av ${dog.name}">`
              : `<div class="no-image"></div>`
          }
        </div>
       
        <div class="pet-card-actions">
          <button onclick="editDog(${dog.id})" class="btn btn-edit">Rediger</button>
          <button onclick="deleteDog(${dog.id})" class="btn btn-delete">Slett</button>
        </div>
      </div>
    `; 

    petsContainer.appendChild(card);
    console.log("Hund:", dog.name, "ID:", dog.id, "Bilde:", dog.image);
  });
  
}

async function createDog(data) {
  try {
    const response = await fetch(`${BASE_URL}/dogs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Kunne ikke lagre hund.");
    }

    await fetchDogs();
    resetForm();
  } catch (error) {
    console.error("Feil ved opprettelse av hund:", error);
    alert("Noe gikk galt ved lagring.");
  }
}
async function updateDog(id, data) {
  try {
    const response = await fetch(`${BASE_URL}/dogs/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Kunne ikke oppdatere hund.");
    }

    await fetchDogs();
    resetForm();
  } catch (error) {
    console.error("Feil ved oppdatering av hund:", error);
    alert("Noe gikk galt da hunden skulle oppdateres.");
  }
}

async function deleteDog(id) {
  const confirmed = confirm("Er du sikker på at du vil slette denne hunden?");
  if (!confirmed) return;

  try {
    const response = await fetch(`${BASE_URL}/dogs/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error("Kunne ikke slette hund.");
    }

    await fetchDogs();

    if (editingId === id) {
      resetForm();
    }
  } catch (error) {
    console.error("Feil ved sletting av hund:", error);
    alert("Noe gikk galt da hunden skulle slettes.");
  }
}

async function editDog(id) {
  try {
    const response = await fetch(`${BASE_URL}/dogs/${id}`);

    if (!response.ok) {
      throw new Error("Kunne ikke hente hund.");
    }

    const dog = await response.json();

    nameInput.value = dog.name || "";
    weightInput.value = dog.weight || "";
    ageInput.value = dog.age || "";
    breedInput.value = dog.breed || "";
    allergiesInput.value = dog.allergies || "";

    setGenderInForm(dog.gender);

    editingId = id;
    formTitle.textContent = "Rediger hund";
    submitButton.textContent = "Lagre endringer";

    resetErrors();
  } catch (error) {
    console.error("Feil ved henting av hund for redigering:", error);
    alert("Noe gikk galt da hunden skulle hentes.");
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!validateForm()) {
    return;
  }

  const data = {
    name: nameInput.value.trim(),
    weight: Number(weightInput.value),
    age: Number(ageInput.value),
    breed: breedInput.value.trim(),
    allergies: allergiesInput.value.trim(),
    gender: getSelectedGender(),
    image: "",
  };

  if (editingId !== null) {
    await updateDog(editingId, data);
  } else {
    await createDog(data);
  }
});

cancelButton.addEventListener("click", resetForm);

async function init() {
  await fetchDogs();
}

init();

/*
  const name = nameInput.value.trim();
  const weight = parseFloat(weightInput.value);
  const age = parseInt(ageInput.value);
  const breed = breedInput.value.trim();
  const allergies = allergiesInput.value.trim();
  const gender = document.querySelector('input[name="gender"]:checked')?.value || "";


  const dog = {
  id:"",
  name,
  weight,
  age,
  breed,
  gender,
  image: ""
};
  

  dogs.push(dogs);

  renderDogs(dogs);
  console.log(dog);

  console.log("Kjæledyr lagret:", dogs);

  form.reset();
  

  document.querySelectorAll(".form-btn").forEach(btn =>
    btn.classList.remove("active")
  );
});

function renderDogs(dogsList) {
  const container = document.getElementById("pets-container");

  container.innerHTML = "";

  if (dogsList.length === 0) {
    container.innerHTML = `<p class="empty-state">Ingen hunder registrert ennå.</p>`;
    return;
  }

  dogsList.forEach((dogs) => {
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

 renderDogs(dogs);*/