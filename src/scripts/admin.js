// Hardcoded credentials (insecure for production!)
const ADMIN_CREDENTIALS = {
  username: "admin",
  password: "1234"
};

const loginSection = document.getElementById("login-section");
const adminPanel = document.getElementById("admin-panel");
const loginBtn = document.getElementById("admin-login-btn");
const loginError = document.getElementById("login-error");

loginBtn.addEventListener("click", () => {
  const username = document.getElementById("admin-username").value;
  const password = document.getElementById("admin-password").value;

  if (
    username === ADMIN_CREDENTIALS.username &&
    password === ADMIN_CREDENTIALS.password
  ) {
    loginSection.style.display = "none";
    adminPanel.style.display = "block";
  } else {
    loginError.textContent = "Invalid credentials";
  }
});

// Save question to localStorage
document.getElementById("add-question-form").addEventListener("submit", (e) => {
  e.preventDefault();

  const question = {
    text: document.getElementById("question-text").value,
    answers: shuffle([
      document.getElementById("correct-answer").value,
      document.getElementById("wrong1").value,
      document.getElementById("wrong2").value
    ]),
    correct: document.getElementById("correct-answer").value
  };

  const category = document.getElementById("category").value;
  const db = JSON.parse(localStorage.getItem("questions")) || {};
  db[category] = db[category] || [];
  db[category].push(question);
  localStorage.setItem("questions", JSON.stringify(db));

  alert("Question added!");
  e.target.reset();
});

// Save number of questions
document.getElementById("question-count").addEventListener("change", (e) => {
  const count = parseInt(e.target.value);
  localStorage.setItem("questionCount", count);
});

// Utility: Shuffle function
function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}
