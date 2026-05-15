/*JAKOB TORGAU*/

import { BASE_URL, getApiKey, getLoggedInUser } from "../../ts/api.ts";
import { login } from "../../ts/api.ts";
import type { Message } from "../../ts/types.ts";

const loginSection = document.getElementById("login-section") as HTMLElement;
const loginForm = document.getElementById("login-form") as HTMLFormElement;
const statusMessage = document.getElementById(
  "status-message",
) as HTMLParagraphElement;
const formStatusMessage = document.getElementById(
  "form-status-message",
) as HTMLParagraphElement;
const contactStatusMessage = document.getElementById(
  "contact-status-message",
) as HTMLParagraphElement;

function showStatus(message: string, isError = false): void {
  statusMessage.textContent = message;
  statusMessage.classList.remove("hidden", "error", "success");
  statusMessage.classList.add(isError ? "error" : "success");
}

function showFormStatus(message: string, isError = false): void {
  formStatusMessage.textContent = message;
  formStatusMessage.classList.remove("hidden", "error", "success");
  formStatusMessage.classList.add(isError ? "error" : "success");
}

function showContactStatus(message: string, isError = false): void {
  contactStatusMessage.textContent = message;
  contactStatusMessage.classList.remove("hidden", "error", "success");
  contactStatusMessage.classList.add(isError ? "error" : "success");
}

const topicLabels: Record<string, string> = {
  general: "Generelt Spørsmål",
  booking: "Om bestilling",
  payment: "Om betaling",
  account: "Om bruker",
  other: "Annet",
};

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = (document.getElementById("email") as HTMLInputElement).value;
  const password = (document.getElementById("password") as HTMLInputElement)
    .value;

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

const style = document.createElement("style");
style.textContent = `
  @keyframes fadeUp {
    from { opacity: 1; transform: translateY(0); }
    to   { opacity: 0; transform: translateY(-6px); }
  }
`;
document.head.appendChild(style);

document.querySelectorAll("details").forEach((details) => {
  const summary = details.querySelector("summary") as HTMLElement;
  const content = details.querySelector("p") as HTMLElement;

  summary.addEventListener("click", (e) => {
    e.preventDefault();

    if (details.open) {
      content.style.animation = "fadeUp 0.25s ease forwards";
      content.addEventListener(
        "animationend",
        () => {
          details.removeAttribute("open");
          content.style.animation = "";
        },
        { once: true },
      );
    } else {
      details.setAttribute("open", "");
      content.style.animation = "fadeDown 0.3s ease forwards";
    }
  });
});

/*Full CRUD funksjonalitet*/

const contactList = document.getElementById("contact-list") as HTMLUListElement;

/*CREATE*/

const contactForm = document.getElementById("contact-form") as HTMLFormElement;
const topicSelect = document.getElementById("subject") as HTMLSelectElement;

export async function createMessage(
  topic: string,
  user_id: number,
  message: string,
  email: string,
): Promise<Message> {
  const response = await fetch(`${BASE_URL}/messages`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${getApiKey()}`,
    },
    body: JSON.stringify({ topic, user_id, message, email }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message ?? "Kunne ikke opprette melding");
  }
  return response.json();
}

export async function getMessages(): Promise<Message[]> {
  const response = await fetch(`${BASE_URL}/messages`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getApiKey()}`,
    },
  });

  if (!response.ok) {
    throw new Error("Kunne ikke hente meldinger");
  }
  const data = await response.json();
  return data.messages ?? data;
}

export async function deleteMessage(id: number): Promise<void> {
  const response = await fetch(`${BASE_URL}/messages/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${getApiKey()}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message ?? "Kunne ikke slette kontakten");
  }
}

export async function editMessage(messages: Message): Promise<void> {
  const response = await fetch(`${BASE_URL}/messages/${messages.id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getApiKey()}`,
    },
    body: JSON.stringify({
      topic: messages.topic,
      user_id: messages.user_id,
      message: messages.message,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message ?? "Kunne ikke redigere kontakten");
  }

  return response.json();
}

contactForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const topic = topicSelect.value;
  const email = (
    document.getElementById("contact-email") as HTMLInputElement
  ).value.trim();
  const messageText = (
    document.getElementById("message") as HTMLTextAreaElement
  ).value.trim();

  if (!topic || !messageText) {
    showFormStatus("Vennligst fyll ut alle feltene", true);
    return;
  }

  const storedUser = localStorage.getItem("LoggedinUser");
  if (!storedUser) {
    showFormStatus("Du må være logget inn for å sende en melding", true);
    return;
  }

  try {
    const currentUser = await getLoggedInUser();
    if (!currentUser) {
      showStatus("Kunne ikke finne denne brukeren", true);
      return;
    }

    await createMessage(topic, currentUser.id, messageText, email);
    showFormStatus("Melding sendt!");
    contactForm.reset();
    await loadMessages();
  } catch (error) {
    showFormStatus((error as Error).message, true);
  }
});

/*READ*/

function renderMessages(messages: Message[]): void {
  if (messages.length === 0) {
    contactList.innerHTML =
      '<li class="empty"> Ingen kontaktformer enda, legg til en ved å benyte skjemaet over...</li>';
    return;
  }

  contactList.innerHTML = messages
    .map(
      (m) => `
    <li class="contact-item">
      <h2>${topicLabels[m.topic] ?? m.topic}</h2>
      <h3>Bruker ID: ${m.user_id}</h3>
      ${m.email ? `<p><strong>E-post: ${m.email}</strong></p>` : ""}
      <p>${m.message}</p>
      <button class="edit-btn" data-id="${m.id}">Rediger</button>
      <button class="delete-btn" data-id="${m.id}">Slett</button>
    </li>
  `,
    )
    .join("");

  /*UPDATE og DELETE*/
  document.querySelectorAll(".edit-btn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const id = Number((e.target as HTMLButtonElement).dataset.id);

      const message = messages.find((localMessage) => localMessage.id === id);
      if (!message) return;

      const li = (e.target as HTMLButtonElement).closest("li") as HTMLElement;

      li.innerHTML = `
      <div class="edit-form">
        <label>Emne:</label>
        <input type="text" class="edit-topic" value="${message.topic}" />
        <label>Melding:</label>
        <textarea class="edit-message">${message.message}</textarea>
        <div class="edit-actions">
          <button class="save-btn" data-id="${message.id}">Lagre</button>
          <button class="cancel-btn">Avbryt</button>
        </div>
      </div>
      `;

      li.querySelector(".save-btn")?.addEventListener("click", async () => {
        const updatedTopic = (
          li.querySelector(".edit-topic") as HTMLInputElement
        ).value.trim();
        const updatedMessage = (
          li.querySelector(".edit-message") as HTMLTextAreaElement
        ).value.trim();

        if (!updatedTopic || !updatedMessage) {
          showContactStatus("Feltene kan ikke være tomme", true);
          return;
        }

        const editedMessage = {
          ...message,
          topic: updatedTopic,
          message: updatedMessage,
        };

        try {
          await editMessage(editedMessage);
          showContactStatus("Kontakt oppdatert");
          await loadMessages();
        } catch (error) {
          showContactStatus((error as Error).message, true);
        }
      });

      li.querySelector(".cancel-btn")?.addEventListener("click", async () => {
        await loadMessages();
      });
    });
  });

  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const id = Number((e.target as HTMLButtonElement).dataset.id);
      const confirmed = confirm("Vil du slette denne kontakten?");
      if (!confirmed) return;

      try {
        await deleteMessage(id);
        showContactStatus("Kontakt slettet");
        await loadMessages();
      } catch (error) {
        showContactStatus("Feil ved sletting av kontakt", true);
      }
    });
  });
}

async function loadMessages(): Promise<void> {
  try {
    getMessages().then((messages) => {
      renderMessages(messages);
    });
  } catch (error) {
    console.error("Feil ved innlastning av kontakter:", error);
  }
}

loadMessages();
