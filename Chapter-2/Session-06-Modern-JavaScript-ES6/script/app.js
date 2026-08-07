import { fetchUsers } from "./apiService.js";

const userList = document.querySelector("#user-list");

function renderUsers(users) {
  userList.innerHTML = users
    .map(
      ({ name, email, website }) => `
        <li>
          <strong>${name}</strong>
          <div>Email: ${email}</div>
          <div>Website: ${website}</div>
        </li>
      `,
    )
    .join("");
}

async function loadUsers() {
  try {
    const users = await fetchUsers();
    renderUsers(users);
  } catch (error) {
    userList.innerHTML = `<li>Không thể tải dữ liệu: ${error.message}</li>`;
  }
}

loadUsers();
