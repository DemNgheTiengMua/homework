const itemList = document.getElementById("item-list");
const addButton = document.getElementById("btn-add");
const removeButton = document.getElementById("btn-remove");

addButton.addEventListener("click", () => {
  const newItem = document.createElement("li");
  newItem.innerText = "New Item";
  itemList.appendChild(newItem);
});

removeButton.addEventListener("click", () => {
  const lastItem = itemList.lastElementChild;

  if (lastItem) {
    lastItem.remove();
  }
});
