const loadButton = document.getElementById("load-users");
const filterInput = document.getElementById("filter-input");
const status = document.getElementById("status");
const usersList = document.getElementById("users-list");

let users = [];

function renderUsers(list) {
  usersList.innerHTML = "";

  if (list.length === 0) {
    status.textContent = "No users match your filter.";
    return;
  }

  list.forEach(user => {
    const li = document.createElement("li");

    const name = document.createElement("h3");
    name.textContent = user.name;

    const email = document.createElement("p");
    email.textContent = `Email: ${user.email}`;

    const city = document.createElement("p");
    city.textContent = `City: ${user.address.city}`;

    const company = document.createElement("p");
    company.textContent = `Company: ${user.company.name}`;

    li.appendChild(name);
    li.appendChild(email);
    li.appendChild(city);
    li.appendChild(company);

    usersList.appendChild(li);
  });
}

async function loadUsers() {
  try {
    loadButton.disabled = true;
    status.textContent = "Loading users...";
    usersList.innerHTML = "";

    const response = await fetch(
      "https://jsonplaceholder.typicode.com/users"
    );

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    users = await response.json();

    renderUsers(users);
    status.textContent = `Successfully loaded ${users.length} users.`;
  } catch (error) {
    status.textContent =
      "Failed to load users. Please try again.";
    console.error(error);
  } finally {
    loadButton.disabled = false;
  }
}

loadButton.addEventListener("click", loadUsers);

filterInput.addEventListener("input", () => {
  const searchText = filterInput.value.toLowerCase();

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchText)
  );

  renderUsers(filteredUsers);

  if (filteredUsers.length > 0) {
    status.textContent = `${filteredUsers.length} user(s) shown.`;
  }
});