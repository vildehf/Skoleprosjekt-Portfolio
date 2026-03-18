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

const form = document.getElementById("pet-form");

form.addEventListener("submit", function(e) {
    e.preventDefault();
    console.log("Lagret i form!");
});


/* legge in må ha minst 3 bokstaver, alert om manglet tekst, alert om ikke huket av knapp, tomt felt, ikke bla ned til minus på alder, lagret opplysninger, sikker på å slette opplysnigner */