const highlightBox = document.getElementById("highlight-box");
const toggleButton = document.getElementById("btn-toggle");

toggleButton.addEventListener("click", () => {
  highlightBox.classList.toggle("highlight");
});
