const currentUserEmail = localStorage.getItem("clearSpendCurrentUser");
const savedUsers = JSON.parse(localStorage.getItem("clearSpendUsers")) || [];
const isLoggedIn = currentUserEmail && savedUsers.some((user) => user.email === currentUserEmail);

if (!isLoggedIn) {
    window.location.replace("auth.html");
}
