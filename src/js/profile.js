const contactListEl = document.getElementById("contactList");
const dialog = document.getElementById("contactDialog");

const addContactBtn = document.getElementById("addContactBtn");
const cancelBtn = document.getElementById("cancelBtn");
const contactForm = document.getElementById("contactForm");

const editIdEl = document.getElementById("editId");
const typeEl = document.getElementById("type");
const valueEl = document.getElementById("value");
const labelEl = document.getElementById("label");


let contacts = [
  { id: crypto.randomUUID(), type: "phone", value: "+47 900 00 000", label: "Mobil" },
  { id: crypto.randomUUID(), type: "email", value: "sekundar@example.com", label: "Sekundær" }
];


function typeName(type) {
  const map = {
    phone: "Telefon",
    email: "Sekundær e-post",
    address: "Adresse",
    emergency: "Nødkontakt"
  };
  return map[type] || type;
}


function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


function renderContacts() {
  contactListEl.innerHTML = "";

  if (contacts.length === 0) {
    const li = document.createElement("li");
    li.textContent = "Ingen kontaktpunkter enda. Trykk “Legg til kontaktpunkt”.";
    contactListEl.appendChild(li);
    return;
  }

  for (const c of contacts) {
    const li = document.createElement("li");

    const title = c.label?.trim() ? c.label.trim() : typeName(c.type);

    li.innerHTML = `
      <article>
        <p>
          <strong>${escapeHtml(title)}</strong><br>
          <span>${escapeHtml(typeName(c.type))}: ${escapeHtml(c.value)}</span>
        </p>

        <p>
          <button
            type="button"
            data-action="edit"
            data-id="${c.id}"
            aria-label="Rediger ${escapeHtml(title)}"
          >
            Rediger
          </button>

          <button
            type="button"
            data-action="delete"
            data-id="${c.id}"
            aria-label="Slett ${escapeHtml(title)}"
          >
            Slett
          </button>
        </p>
      </article>
    `;

    contactListEl.appendChild(li);
  }
}


addContactBtn.addEventListener("click", () => {
  editIdEl.value = "";
  contactForm.reset();
  typeEl.value = "phone";
  dialog.showModal();
  valueEl.focus();
});


cancelBtn.addEventListener("click", () => {
  dialog.close();
});


contactForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const id = editIdEl.value.trim();
  const payload = {
    type: typeEl.value,
    value: valueEl.value.trim(),
    label: labelEl.value.trim()
  };

  if (!payload.value) return;

  if (id) {
    
    contacts = contacts.map((c) => (c.id === id ? { ...c, ...payload } : c));
  } else {
   
    contacts.unshift({ id: crypto.randomUUID(), ...payload });
  }

  dialog.close();
  renderContacts();
});


contactListEl.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;

  const action = btn.dataset.action;
  const id = btn.dataset.id;

  const contact = contacts.find((c) => c.id === id);
  if (!contact) return;

  if (action === "edit") {
   
    editIdEl.value = contact.id;
    typeEl.value = contact.type;
    valueEl.value = contact.value;
    labelEl.value = contact.label || "";

    dialog.showModal();
    valueEl.focus();
  }

  if (action === "delete") {
   
    const title = contact.label?.trim() ? contact.label.trim() : typeName(contact.type);
    const ok = confirm(`Vil du slette "${title}"?`);
    if (!ok) return;

    contacts = contacts.filter((c) => c.id !== id);
    renderContacts();
  }
});


document.getElementById("profileForm").addEventListener("submit", (e) => {
  e.preventDefault();
  
  alert("Profil lagret (demo).");
});


renderContacts();