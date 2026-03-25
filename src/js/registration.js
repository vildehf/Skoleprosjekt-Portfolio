
let pets = [];


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


const form = document.getElementById("pet-form");

form.addEventListener("submit", function(e) {
  e.preventDefault();

 
  const name = document.getElementById("pet-name").value.trim();
  const weight = parseFloat(document.getElementById("pet-weight").value);
  const age = parseInt(document.getElementById("pet-age-years").value);
  const breed = document.getElementById("pet-breed").value.trim();
  const doctor = document.getElementById("doctor").value.trim();
  const phone = document.getElementById("phone-doctor").value.trim();

 
  const gender = document.querySelector('input[name="gender"]:checked')?.value || "";
  const microchipped = document.querySelector('input[name="microchipped"]:checked')?.value || "";
  const neutered = document.querySelector('input[name="neutered"]:checked')?.value || "";
  const cleanliness = document.querySelector('input[name="cleanliness"]:checked')?.value || "";
  const childfriendly = document.querySelector('input[name="childfriendly"]:checked')?.value || "";
  const dogfriendly = document.querySelector('input[name="dogfriendly"]:checked')?.value || "";
  const catfriendly = document.querySelector('input[name="catfriendly"]:checked')?.value || "";

const form = document.getElementById("pet-form");

const nameInput = document.getElementById("pet-name");
const weightInput = document.getElementById("pet-weight");
const ageInput = document.getElementById("pet-age-years");

const nameError = document.getElementById("name-error");
const weightError = document.getElementById("weight-error");
const ageError = document.getElementById("age-error");

form.addEventListener("submit", function (e) {
  e.preventDefault();

  let valid = true;


  if (!nameInput.checkValidity()) {
    nameError.textContent = "Navnet må inneholde mer enn 2 bokstaver";
    nameError.classList.add("show");
    valid = false;
  } else {
    nameError.classList.remove("show");
  }


  if (!weightInput.checkValidity()) {
    weightError.textContent = "Vekt må være over 0 kg";
    weightError.classList.add("show");
    valid = false;
  } else {
    weightError.classList.remove("show");
  }


  if (!ageInput.checkValidity()) {
    ageError.textContent = "Alder kan ikke være negativ";
    ageError.classList.add("show");
    valid = false;
  } else {
    ageError.classList.remove("show");
  }

  if (!valid) return;


  console.log("Alt OK!");
});


  const pet = {
    name,
    weight,
    age,
    breed,
    doctor,
    phone,
    gender,
    microchipped,
    neutered,
    cleanliness,
    childfriendly,
    dogfriendly,
    catfriendly
  };
  console.log(pets);


  pets.push(pet);

 
  form.reset();

  document.querySelectorAll(".form-btn").forEach(btn => btn.classList.remove("active"));

  console.log("Pets lagret:", pets);
});