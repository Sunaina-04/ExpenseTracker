const CURRENT_USER_KEY = "clearSpendCurrentUser";
const USERS_KEY = "clearSpendUsers";

function getCurrentUser() {
    const currentEmail = localStorage.getItem(CURRENT_USER_KEY);
    const users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];
    return users.find((user) => user.email === currentEmail) || null;
}

function getUserDisplayName(user) {
    if (user && user.name) return user.name;
    if (user && user.email) return user.email.split("@")[0];
    return "there";
}

function updateUserGreeting() {
    const user = getCurrentUser();
    document.querySelectorAll("[data-user-greeting]").forEach((element) => {
        element.textContent = `Welcome back ${getUserDisplayName(user)}`;
    });
}

document.addEventListener("DOMContentLoaded", updateUserGreeting);
