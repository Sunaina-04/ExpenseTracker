const currentUserEmail = localStorage.getItem("clearSpendCurrentUser");
const users = JSON.parse(localStorage.getItem("clearSpendUsers")) || [];
const currentUser = users.find((user) => user.email === currentUserEmail);
const settingsForm = document.getElementById("settings-form");
const nameInput = document.getElementById("settings-name");
const emailInput = document.getElementById("settings-email");
const settingsMessage = document.getElementById("settings-message");

if (currentUser) {
    nameInput.value = currentUser.name || currentUser.email.split("@")[0];
    emailInput.value = currentUser.email;
}

settingsForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = nameInput.value.trim();

    if (!name) {
        settingsMessage.textContent = "Please enter your name.";
        settingsMessage.className = "settings-message error";
        return;
    }

    currentUser.name = name;
    localStorage.setItem("clearSpendUsers", JSON.stringify(users));
    settingsMessage.textContent = "Your settings have been saved.";
    settingsMessage.className = "settings-message success";
    document.querySelector("[data-user-greeting]").textContent = `Welcome back ${name}`;
});

document.getElementById("logout-btn").addEventListener("click", () => {
    localStorage.removeItem("clearSpendCurrentUser");
    window.location.href = "auth.html";
});
