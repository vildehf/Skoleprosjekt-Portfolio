const buttonGroups = document.querySelectorAll(".form-card");

buttonGroups.forEach(group => {
  const buttons = group.querySelectorAll(".form-btn");

  buttons.forEach(button => {
    button.addEventListener("click", () => {

      
      if (button.classList.contains("active")) {
        button.classList.remove("active");
        return;
      }

      
      buttons.forEach(btn => btn.classList.remove("active"));

    
      button.classList.add("active");
    });
  });
});