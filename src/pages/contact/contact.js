const style = document.createElement("style");
style.textContent = `
  @keyframes fadeUp {
    from { opacity: 1; transform: translateY(0); }
    to   { opacity: 0; transform: translateY(-6px); }
  }
`;
document.head.appendChild(style);

document.querySelectorAll("details").forEach((details) => {
  const summary = details.querySelector("summary");
  const content = details.querySelector("p");

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
