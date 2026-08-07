const colors = ["red", "blue", "green", "yellow", "purple"];
const changeBackgroundButton = document.querySelector(
  "#btn-change-background",
);
const currentColor = document.querySelector("#current-color");

changeBackgroundButton.addEventListener("click", () => {
  const randomIndex = Math.floor(Math.random() * colors.length);
  const selectedColor = colors[randomIndex];

  document.body.style.backgroundColor = selectedColor;
  currentColor.innerText = `Current color: ${selectedColor}`;
});
