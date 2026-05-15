// Laget av Vilde Hvitstein Fristad
const hamburger = document.querySelector(
  ".hamburger",
) as HTMLButtonElement | null;
const navMenu = document.querySelector(".nav-menu") as HTMLElement | null;
const backdrop = document.querySelector(
  ".hamburger-backdrop",
) as HTMLElement | null;

function toggleMenu(forceClose: boolean = false): void {
  if (!hamburger || !navMenu || !backdrop) return;

  const shouldOpen = forceClose
    ? false
    : !hamburger.classList.contains("active");

  hamburger.classList.toggle("active", shouldOpen);
  navMenu.classList.toggle("active", shouldOpen);
  backdrop.classList.toggle("active", shouldOpen);

  hamburger.setAttribute("aria-expanded", shouldOpen ? "true" : "false");
}

hamburger?.addEventListener("click", () => toggleMenu());
backdrop?.addEventListener("click", () => toggleMenu(true));

document.addEventListener("keydown", (e: KeyboardEvent) => {
  if (e.key === "Escape") toggleMenu(true);
});
