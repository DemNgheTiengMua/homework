const mainImage = document.getElementById("main-image");
const changeImageButton = document.getElementById("btn-change-image");

console.log(mainImage.getAttribute("src"));

changeImageButton.addEventListener("click", () => {
  mainImage.setAttribute("src", "https://picsum.photos/id/1025/400/250");
  mainImage.setAttribute("alt", "Changed dog");
});
