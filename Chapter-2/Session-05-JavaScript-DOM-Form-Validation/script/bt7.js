const registrationForm = document.getElementById("registration-form");
const usernameInput = document.getElementById("username");
const emailInput = document.getElementById("email");

registrationForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const formData = {
    username: usernameInput.value.trim(),
    email: emailInput.value.trim(),
  };

  console.log(formData);
});
