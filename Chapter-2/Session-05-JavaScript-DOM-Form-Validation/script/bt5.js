const userInput = document.getElementById("user-input");
const keyOutput = document.getElementById("key-output");

userInput.addEventListener("keydown", (e) => {
  keyOutput.innerText = `Phím vừa nhấn: ${e.key}`;
});
