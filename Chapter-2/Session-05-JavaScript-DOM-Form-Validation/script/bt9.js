const parentBox = document.getElementById("parent-box");
const childButton = document.getElementById("child-button");

parentBox.addEventListener("click", () => {
  console.log("Parent clicked");
});

childButton.addEventListener("click", (e) => {
  e.stopPropagation();
  console.log("Child clicked");
});
