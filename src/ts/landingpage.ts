const loginDialog = document.getElementById("loginDialog") as HTMLDialogElement | null;
const openLogin = document.getElementById("openLogin") as HTMLButtonElement | null;
const closeLogin = document.getElementById("closeLogin") as HTMLButtonElement | null;

const loginForm = document.getElementById("loginForm") as HTMLFormElement | null;
const loginEmail = document.getElementById("loginEmail") as HTMLInputElement | null;

if (loginDialog && openLogin && closeLogin && loginForm && loginEmail) {

  openLogin.addEventListener("click", () => {
    loginDialog.showModal();
  });

  closeLogin.addEventListener("click", () => {
    loginDialog.close();
  });

  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();

   const user = {
      email: loginEmail.value.trim(),
      isLoggedIn: true,
    };

    localStorage.setItem("potepassUser", JSON.stringify(user));

    window.location.href = "/src/pages/profile/profile.html";
  });
}