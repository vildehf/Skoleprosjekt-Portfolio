/* Siden laget av Line Nerli Tveite */

import type { Booking, Users, PetSitters } from "../../ts/types.ts";
import { BASE_URL, API_KEY, getLoggedInUser } from "../../ts/api";

type CreateBooking = Omit<Booking, "id" | "created" | "updated">;

let editingBookingId: number | null = null;
let currentUser: Users | null = null;

// ELEMENTER
const form = document.querySelector(".booking-form") as HTMLFormElement;
const dogSelect = document.getElementById("dog") as HTMLSelectElement;
const sitterSelect = document.getElementById("sitter") as HTMLSelectElement;
const previousSittersContainer = document.getElementById(
  "previous-sitters-list",
) as HTMLDivElement;
const bookingsContainer = document.getElementById(
  "bookings-list",
) as HTMLDivElement;
const confirmation = document.getElementById(
  "booking-confirmation",
) as HTMLDivElement;

// DATA MAPS
let dogsMap: Record<number, string> = {};
let sittersMap: Record<number, PetSitters> = {};

// FETCH HELPERS
/* denne bør i api.ts? */
async function fetchData<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${BASE_URL}/${endpoint}`, {
    headers: { Authorization: `Bearer ${API_KEY}` },
  });

  if (!response.ok) {
    throw new Error("Noe gikk galt");
  }

  return response.json();
}

async function loadCurrentUser() {
  currentUser = await getLoggedInUser();

  if (!currentUser) {
    alert("Du må være logget inn for å se denne siden");
    return;
  }
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("no-NO");
}

function resetForm(): void {
  form.reset();
  editingBookingId = null;
  const button = form.querySelector("button") as HTMLButtonElement;
  button.textContent = "Book";
}

function showMessage(message: string) {
  confirmation.textContent = message;
  confirmation.style.display = "block";

  setTimeout(() => {
    confirmation.style.display = "none";
  }, 3000);
}

function startEdit(booking: Booking) {
  editingBookingId = booking.id;

  (document.getElementById("start-date") as HTMLInputElement).value =
    booking.fromDate ?? "";
  (document.getElementById("end-date") as HTMLInputElement).value =
    booking.toDate ?? "";
  dogSelect.value = String(booking.userDogId);
  sitterSelect.value = String(booking.petSitterId);
  (document.getElementById("message") as HTMLTextAreaElement).value =
    booking.message;
  const button = form.querySelector("button") as HTMLButtonElement;
  button.textContent = "Oppdater booking";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function updateBooking(id: number, data: CreateBooking) {
  await fetch(`${BASE_URL}/bookings/${id}`, {
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
    option.value = String(dog.id);
    option.textContent = dog.name;

    dogSelect.appendChild(option);
  });
}

// LOAD SITTERS
async function loadSitters() {
  const sitters = await fetchData<PetSitters[]>("petsitters");

  sitters.forEach((sitter) => {
    sittersMap[sitter.id] = sitter;

    const option = document.createElement("option");
    option.value = String(sitter.id);
    option.textContent = sitter.name;

    sitterSelect.appendChild(option);
  });
}

// LOAD BOOKINGS
function renderBooking(booking: Booking): string {
  return `<article class="booking-card">
      <div class="booking-info">
        <p><strong>Periode:</strong> ${formatDate(booking.fromDate ?? "")} - ${formatDate(booking.toDate ?? "")}</p>
        <p><strong>Hund:</strong> ${dogsMap[booking.userDogId] ?? "Ukjent hund"}</p>
        <p><strong>Hundepasser:</strong> ${sittersMap[booking.petSitterId]?.name ?? "Ukjent passer"}</p>
      <p><strong>Status:</strong> ${booking.status === "pending" ? "Venter" : booking.status}</p>
      </div>
      

      <div class="actions">
    <button class="btn btn-ghost edit-btn" data-id="${booking.id}">Rediger</button>
    <button class="btn btn-primary delete-btn" data-id="${booking.id}">Slett</button>
  </div>
  </article>
    `;
}

async function loadBookings() {
  const user = currentUser;
  if (!user) return;
  const bookings = await fetchData<Booking[]>("bookings");

  const userBookings = bookings.filter(
    (b) => Number(b.userId) === Number(user.id),
  );

  bookingsContainer.innerHTML = userBookings.map(renderBooking).join("");

  bookingsContainer
    .querySelectorAll<HTMLButtonElement>(".edit-btn")
    .forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.id;
        if (!id) return;
        const booking = userBookings.find((b) => String(b.id) === id);
        if (!booking) return;
        startEdit(booking);
      });
    });

  bookingsContainer
    .querySelectorAll<HTMLButtonElement>(".delete-btn")
    .forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.dataset.id;
        if (!id) return;
        if (confirm("Er du sikker på at du vil slette denne bookingen?")) {
          await deleteBooking(Number(id));
        }
      });
    });
}

async function loadPreviousSitters() {
  if (!currentUser) return;

  const bookings = await fetchData<Booking[]>("bookings");

  const userBookings = bookings.filter((b) => b.userId === currentUser!.id);

  const sitterIds = [...new Set(userBookings.map((b) => b.petSitterId))];

  previousSittersContainer.innerHTML = "";

  if (sitterIds.length === 0) {
    previousSittersContainer.innerHTML =
      "<p>Ingen tidligere hundepassere enda</p>";
    return;
  }

  sitterIds.forEach((id) => {
    const card = document.createElement("div");
    card.classList.add("previous-sitter-card");

    card.innerHTML = `
       <p><strong>${sittersMap[id]?.name || "Ukjent"}</strong></p>
      <button class="btn btn-ghost book-again">Book igjen</button>
`;

    card
      .querySelector<HTMLButtonElement>(".book-again")
      ?.addEventListener("click", () => {
        sitterSelect.value = String(id);
        window.scrollTo({ top: 0, behavior: "smooth" });
      });

    previousSittersContainer.appendChild(card);
  });
}

// CREATE BOOKINGS

async function createBooking(data: CreateBooking) {
  await fetch(`${BASE_URL}/bookings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify(data),
  });
}

async function deleteBooking(id: number) {
  await fetch(`${BASE_URL}/bookings/${id}`, {
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

  if (!currentUser) {
    alert("Du må være logget inn");
    return;
  }

  const submitBtn = form.querySelector("button") as HTMLButtonElement;
  submitBtn.disabled = true;

  const startDate = (document.getElementById("start-date") as HTMLInputElement)
    .value;
  const endDate = (document.getElementById("end-date") as HTMLInputElement)
    .value;
  const dog = dogSelect.value;
  const sitter = sitterSelect.value;
  const message = (document.getElementById("message") as HTMLTextAreaElement)
    .value;

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

  if (editingBookingId !== null) {
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
