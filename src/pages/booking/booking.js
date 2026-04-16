console.log("JS funker!");

let editingBookingId = null;
let currentUser = null;

// Konstanter
const API_URL = "http://localhost:3000/api";
const API_KEY = "123";

// ELEMENTER
const form = document.querySelector(".booking-form");
const dogSelect = document.getElementById("dog");
const sitterSelect = document.getElementById("sitter");
const previousSittersContainer = document.getElementById(
  "previous-sitters-list",
);
const bookingsContainer = document.getElementById("bookings-list");
const confirmation = document.getElementById("booking-confirmation");

// DATA MAPS
let dogsMap = {};
let sittersMap = {};

// FETCH HELPERS
async function fetchData(endpoint) {
  const response = await fetch(`${API_URL}/${endpoint}`, {
    headers: { Authorization: `Bearer ${API_KEY}` },
  });
  return response.json();
}

async function loadCurrentUser() {
  const users = await fetchData("users");
  console.log("users:", users);
  currentUser = users[0];
  console.log("currentUser:", currentUser);
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("no-NO");
}

function resetForm() {
  form.reset();
  editingBookingId = null;
  form.querySelector("button").textContent = "Book";
}

function showMessage(message) {
  confirmation.textContent = message;
  confirmation.style.display = "block";

  setTimeout(() => {
    confirmation.style.display = "none";
  }, 3000);
}

function startEdit(booking) {
  editingBookingId = booking.id;

  document.getElementById("start-date").value = booking.fromDate;
  document.getElementById("end-date").value = booking.toDate;
  dogSelect.value = booking.userDogId;
  sitterSelect.value = booking.petSitterId;
  document.getElementById("message").value = booking.message;
  form.querySelector("button").textContent = "Oppdater booking";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function updateBooking(id, data) {
  await fetch(`${API_URL}/bookings/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify(data),
  });
}

// LOAD DOGS
async function loadDogs() {
  if (!currentUser) return;

  dogSelect.innerHTML = `<option value="">Velg hund</option>`;

  currentUser.dogs.forEach((dog) => {
    dogsMap[dog.id] = dog.name;

    const option = document.createElement("option");
    option.value = dog.id;
    option.textContent = dog.name;

    dogSelect.appendChild(option);
  });
}

// LOAD SITTERS
async function loadSitters() {
  const sitters = await fetchData("petsitters");

  sitters.forEach((sitter) => {
    sittersMap[sitter.id] = sitter.name;

    const option = document.createElement("option");
    option.value = sitter.id;
    option.textContent = sitter.name;

    sitterSelect.appendChild(option);
  });
}

// LOAD BOOKINGS

async function loadBookings() {
  if (!currentUser) return;
  const bookings = await fetchData("bookings");
  bookingsContainer.innerHTML = "";

  bookings
    .filter((b) => Number(b.userId) === Number(currentUser.id))
    .forEach((booking) => {
      const card = document.createElement("article");
      card.classList.add("booking-card");

      card.innerHTML = `
      <div class="booking-info">
        <p><strong>Periode:</strong> ${formatDate(booking.fromDate)} - ${formatDate(booking.toDate)}</p>
        <p><strong>Hund:</strong> ${dogsMap[booking.userDogId] || "Ukjent hund"}</p>
        <p><strong>Hundepasser:</strong> ${sittersMap[booking.petSitterId] || "Ukjent passer"}</p>
      </div>
      <p><strong>Status:</strong>${booking.status === "pending" ? "Venter" : booking.status}</p>

      <div class="actions">
    <button class="btn btn-ghost edit-btn">Rediger</button>
    <button class="btn btn-primary delete-btn" data-id="${booking.id}">Slett</button>
  </div>
    `;

      bookingsContainer.appendChild(card);

      const editBtn = card.querySelector(".edit-btn");

      editBtn.addEventListener("click", () => {
        startEdit(booking);
      });
      const deleteBtn = card.querySelector(".delete-btn");

      deleteBtn.addEventListener("click", async () => {
        if (confirm("Er du sikker på at du vil slette denne bookingen?")) {
          await deleteBooking(booking.id);
        }
      });
    });
}

async function loadPreviousSitters() {
  if (!currentUser) return;

  const bookings = await fetchData("bookings");
  previousSittersContainer.innerHTML = "";

  const userBookings = bookings.filter(
    (b) => Number(b.userId) === Number(currentUser.id),
  );

  const sitterIds = [...new Set(userBookings.map((b) => b.petSitterId))];

  if (sitterIds.length === 0) {
    previousSittersContainer.innerHTML =
      "<p>Ingen tidligere hundepassere enda</p>";
    return;
  }

  sitterIds.forEach((id) => {
    const card = document.createElement("div");
    card.classList.add("booking-card");

    card.innerHTML = `<div class="booking-info">
    <p><strong>Hundepasser:</strong>${sittersMap[id] || "Ukjent"}</p></div>

    <button class="btn btn-primary book-again">Book igjen</button>`;

    const button = card.querySelector(".book-again");
    button.addEventListener("click", () => {
      sitterSelect.value = id;
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    previousSittersContainer.appendChild(card);
  });
}

// CREATE BOOKINGS

async function createBooking(data) {
  await fetch(`${API_URL}/bookings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify(data),
  });
}

async function deleteBooking(id) {
  await fetch(`${API_URL}/bookings/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
    },
  });

  await loadBookings();
  await loadPreviousSitters();

  showMessage("Bookingen din er slettet 🗑️");

  resetForm();
}

// FORM SUBMIT
form.addEventListener("submit", async function (event) {
  event.preventDefault();

  const submitBtn = form.querySelector("button");
  submitBtn.disabled = true;

  const startDate = document.getElementById("start-date").value;
  const endDate = document.getElementById("end-date").value;
  const dog = dogSelect.value;
  const sitter = sitterSelect.value;
  const message = document.getElementById("message").value;

  if (!startDate || !endDate) {
    alert("Velg både fra- og til-dato");
    submitBtn.disabled = false;
    return;
  }

  if (endDate < startDate) {
    alert("Til-dato kan ikke være før fra-dato");
    submitBtn.disabled = false;
    return;
  }

  if (!dog || !sitter) {
    alert("Velg hund og hundepasser");
    submitBtn.disabled = false;
    return;
  }

  const bookingData = {
    userId: currentUser.id,
    userDogId: Number(dog),
    petSitterId: Number(sitter),
    fromDate: startDate,
    toDate: endDate,
    message,
    status: "pending",
  };

  const isEditing = editingBookingId !== null;

  if (isEditing) {
    await updateBooking(editingBookingId, bookingData);
    editingBookingId = null;
  } else {
    await createBooking(bookingData);
  }

  await loadBookings();
  await loadPreviousSitters();
  showMessage(
    isEditing ? "Bookingen din er oppdatert" : "Bookingen din er sendt! 🐾",
  );
  resetForm();
  submitBtn.disabled = false;
});

// INIT

async function init() {
  try {
    await loadCurrentUser();
    console.log("etter loadCurrentUser:", currentUser);
    await loadDogs();
    await loadSitters();
    await loadBookings();
    await loadPreviousSitters();
  } catch (error) {
    console.error("feil ved init:", error);
  }
}

document.addEventListener("DOMContentLoaded", init);
