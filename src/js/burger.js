const hamburger = document.querySelector(".hamburger");
const navMenu = document.querySelector(".nav-menu");
const backdrop = document.querySelector(".hamburger-backdrop");

function toggleMenu(forceClose = false) {
  const shouldOpen = forceClose
    ? false
    : !hamburger.classList.contains("active");

  hamburger.classList.toggle("active", shouldOpen);
  navMenu.classList.toggle("active", shouldOpen);
  backdrop.classList.toggle("active", shouldOpen);

  hamburger.setAttribute("aria-expanded", shouldOpen ? "true" : "false");
}

hamburger.addEventListener("click", () => toggleMenu());
backdrop.addEventListener("click", () => toggleMenu(true));
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") toggleMenu(true);
});
