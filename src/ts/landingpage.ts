/* Siden er laget av Mats Sudbø */
import { login } from "./api";

const loginDialog = document.getElementById("loginDialog") as HTMLDialogElement | null;
const openLogin = document.getElementById("openLogin") as HTMLButtonElement | null;
const closeLogin = document.getElementById("closeLogin") as HTMLButtonElement | null;

const loginForm = document.getElementById("loginForm") as HTMLFormElement | null;
const loginEmail = document.getElementById("loginEmail") as HTMLInputElement | null;
const loginPassword = document.getElementById("loginPassword") as HTMLInputElement | null;

if (
  loginDialog &&
  openLogin &&
  closeLogin &&
  loginForm &&
  loginEmail &&
  loginPassword
) {
  openLogin.addEventListener("click", () => {
    loginDialog.showModal();
  });

  closeLogin.addEventListener("click", () => {
    loginDialog.close();
  });

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!loginEmail.value.trim() || !loginPassword.value.trim()) {
  alert("Fyll inn e-post og passord");
  return;
}

    try {
      await login(
        loginEmail.value.trim(),
        loginPassword.value.trim()
      );

      window.location.href = "/src/pages/profile/profile.html";

    } catch (error) {
      console.error(error);
      alert("Feil e-post eller passord");
    }
  });
}