const usernameInput = document.querySelector(".sign-up-username");
const usernameError = document.querySelector(".username-error");

const emailInput = document.querySelector(".sign-up-email");
const emailError = document.querySelector(".email-error");

const passwordInput = document.querySelector(".sign-up-password");
const passwordError = document.querySelector(".password-error");

const confirmPasswordInput = document.querySelector(
  ".sign-up-confirm-password"
);
const confirmPasswordError = document.querySelector(".confirm-password-error");

function handleUsernameError(error, borderColor) {
  console.log(usernameError.textContent);
  usernameError.textContent = `${error}`;
  usernameInput.style.borderColor = borderColor;
  console.log(usernameError.textContent);
}

usernameInput.addEventListener("input", async () => {
  const username = usernameInput.value;
  let error = "";

  // Backend check
  const response = await fetch(
    `/sign-up/check-input?input=${encodeURIComponent(username)}`
  );
  const data = await response.json();

  if (data.user.length > 0) {
    error = "Username already exists";
  }

  // Frontend validations
  if (username.length < 3) {
    error = "Username is too short";
  } else if (username.length > 20) {
    error = "Username is too long";
  } else if (!/^[a-zA-Z0-9_.]+$/.test(username)) {
    error = "Only letters, numbers, underscores, and dots allowed";
  }

  // Final render
  if (error) {
    usernameError.textContent = error;
    usernameInput.style.borderColor = "red";
  } else {
    usernameError.textContent = "";
    usernameInput.style.borderColor = "transparent";
  }
});

emailInput.addEventListener("input", async () => {
  const useremail = emailInput.value;
  let error = "";

  const response = await fetch(
    `/sign-up/check-input?input=${encodeURIComponent(useremail)}`
  );
  const data = await response.json();

  if (data.user.length > 0) {
    error = "Email already exists";
  }

  if (!useremail || !useremail.includes("@") || !useremail.includes(".")) {
    error = "Invalid email";
  }

  if (error) {
    emailError.textContent = error;
    emailInput.style.borderColor = "red";
  } else {
    emailError.textContent = "";
    emailInput.style.borderColor = "transparent";
  }
});

passwordInput.addEventListener("input", async () => {
  const password = passwordInput.value;

  let error = "";

  if (!password || password.length < 8) {
    error = "Password must be at least 8 characters long";
  }

  if (!/[a-zA-Z]/.test(password) || !/\d/.test(password)) {
    error = "Password must contain letter and number";
  }

  if (error) {
    passwordError.textContent = error;
    passwordInput.style.borderColor = "red";
  } else {
    passwordError.textContent = "";
    passwordInput.style.borderColor = "transparent";
  }
});

confirmPasswordInput.addEventListener("input", () => {
  const password = passwordInput.value;
  const confirmPassword = confirmPasswordInput.value;
  console.log(password, confirmPassword);
  if (password != confirmPassword) {
    confirmPasswordError.textContent = "Passwords must match";
    confirmPasswordInput.style.borderColor = "red";
  } else {
    confirmPasswordError.textContent = "";
    confirmPasswordInput.style.borderColor = "transparent";
  }
});
