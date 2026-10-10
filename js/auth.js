const USERS_KEY = "clearSpendUsers";

const authForm = document.getElementById("auth-form");
const nameGroup = document.getElementById("name-group");
const nameInput = document.getElementById("auth-name");
const loginTab = document.getElementById("login-tab");
const signupTab = document.getElementById("signup-tab");
const confirmPasswordGroup = document.getElementById("confirm-password-group");
const confirmPassword = document.getElementById("confirm-password");
const passwordInput = document.getElementById("auth-password");
const passwordToggle = document.getElementById("password-toggle");
const authSubmit = document.getElementById("auth-submit");
const authTitle = document.getElementById("auth-title");
const authSubtitle = document.getElementById("auth-subtitle");
const authMessage = document.getElementById("auth-message");

let isSignup = false;

function getUsers() {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
}

function showMessage(message, type = "") {
    authMessage.textContent = message;
    authMessage.className = `auth-message ${type}`;
}

function setMode(signupMode) {
    isSignup = signupMode;
    loginTab.classList.toggle("active", !isSignup);
    signupTab.classList.toggle("active", isSignup);
    loginTab.setAttribute("aria-selected", String(!isSignup));
    signupTab.setAttribute("aria-selected", String(isSignup));
    confirmPasswordGroup.hidden = !isSignup;
    nameGroup.hidden = !isSignup;
    nameInput.required = isSignup;
    confirmPassword.required = isSignup;
    authSubmit.textContent = isSignup ? "Create account" : "Login";
    authTitle.textContent = isSignup ? "Create your account" : "Welcome back";
    authSubtitle.textContent = isSignup
        ? "Sign up to start managing your expenses."
        : "Log in to continue managing your expenses.";
    passwordInput.autocomplete = isSignup ? "new-password" : "current-password";
    showMessage("");
}

loginTab.addEventListener("click", () => setMode(false));
signupTab.addEventListener("click", () => setMode(true));

passwordToggle.addEventListener("click", () => {
    const showing = passwordInput.type === "text";
    passwordInput.type = showing ? "password" : "text";
    passwordToggle.textContent = showing ? "Show" : "Hide";
    passwordToggle.setAttribute("aria-label", showing ? "Show password" : "Hide password");
});

authForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const email = document.getElementById("auth-email").value.trim().toLowerCase();
    const name = nameInput.value.trim();
    const password = passwordInput.value;
    const users = getUsers();

    if (!authForm.checkValidity()) {
        showMessage("Please complete all fields correctly.", "error");
        authForm.reportValidity();
        return;
    }

    if (isSignup) {
        if (password !== confirmPassword.value) {
            showMessage("Passwords do not match.", "error");
            return;
        }
        if (users.some((user) => user.email === email)) {
            showMessage("An account with this email already exists.", "error");
            return;
        }
        users.push({ id: Date.now(), name, email, password });
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
        showMessage("Account created. You can now log in.", "success");
        authForm.reset();
        setMode(false);
        showMessage("Account created. You can now log in.", "success");
        return;
    }

    const user = users.find((account) => account.email === email && account.password === password);
    if (!user) {
        showMessage("Email or password is incorrect.", "error");
        return;
    }

    localStorage.setItem("clearSpendCurrentUser", email);
    showMessage("Login successful. Welcome to ClearSpend.", "success");
    setTimeout(() => {
        window.location.href = "index.html";
    }, 500);
});
