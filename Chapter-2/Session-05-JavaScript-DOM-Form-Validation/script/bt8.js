const deleteButtons = document.querySelectorAll(".delete-btn");

deleteButtons.forEach((button) => {
  button.addEventListener("click", (e) => {
    const listItem = e.currentTarget.parentElement;
    listItem.remove();
  });
});
