const loginDialog = document.getElementById("loginDialog") as HTMLDialogElement | null;
const openLogin = document.getElementById("openLogin") as HTMLButtonElement | null;
const closeLogin = document.getElementById("closeLogin") as HTMLButtonElement | null;

if (loginDialog && openLogin && closeLogin) {
  openLogin.addEventListener("click", () => {
    loginDialog.showModal();
  });

  closeLogin.addEventListener("click", () => {
    loginDialog.close();
  });
}