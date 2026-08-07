const clickButton = document.getElementById("btn-click");

clickButton.addEventListener("click", (e) => {
  alert("Button Clicked!");
  console.log(e);
});
