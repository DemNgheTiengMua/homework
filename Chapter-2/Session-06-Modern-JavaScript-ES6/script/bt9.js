async function getUsers() {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/users");

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }

    const users = await response.json();
    const userNames = users.map(({ name }) => name);

    console.log(userNames);
  } catch (error) {
    console.error(error.message);
  }
}

getUsers();
