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

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = loginEmail.value.trim();

    try {
      const response = await fetch(`http://localhost:3000/api/users?email=${email}`);

      if (!response.ok) {
        throw new Error("Kunne ikke hente bruker fra API");
      }

      const users = await response.json();

      const user = users[0];

      if (!user) {
        alert("Fant ingen bruker med denne e-posten");
        return;
      }

      localStorage.setItem("potepassUser", JSON.stringify(user));

      window.location.href = "/src/pages/profile/profile.html";
    } catch (error) {
      console.error(error);
      alert("Noe gikk galt ved innlogging");
    }
  });
}