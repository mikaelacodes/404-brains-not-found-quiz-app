const startBtn = document.getElementById("start-btn");
const usernameInput = document.getElementById("username");
const categorySelect = document.getElementById("category");

// Load categories from localStorage and defaults
function loadCategories() {
  const defaultCategories = ["JavaScript", "HTML", "CSS"];
  const adminCategories =
    JSON.parse(localStorage.getItem("quizCategories")) || [];
  const categories = Array.from(
    new Set([...defaultCategories, ...adminCategories])
  );

  categorySelect.innerHTML = "";
  categories.forEach((cat) => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categorySelect.appendChild(option);
  });
}

// Call on page load
loadCategories();

const questionTitle = document.getElementById("question-title");
const answersList = document.getElementById("answers-list");
const timerDisplay = document.getElementById("timer");
const progressBar = document.getElementById("progress-bar");
const progressText = document.getElementById("progress-text");

let questions = [];
let current = 0;
let score = 0;
let timer = null;
let timePerQuestion = 10;
let userAnswers = [];

startBtn.addEventListener("click", () => {
  const name = usernameInput.value.trim();
  const category = categorySelect.value;
  if (!name) return alert("Enter your name!");

  const defaultQuestions = {
    JavaScript: [
      {
        text: "What is a closure?",
        answers: [
          "A function with preserved data from its lexical scope",
          "A CSS property",
          "A kind of loop",
          "An error",
        ],
        correct: "A function with preserved data from its lexical scope",
      },
      {
        text: "Which of the following is NOT a JavaScript data type?",
        answers: ["Number", "Boolean", "Float", "String"],
        correct: "Float",
      },
      {
        text: "What does 'this' keyword refer to in a regular function?",
        answers: [
          "The global object",
          "The function itself",
          "The parent object",
          "The previous variable",
        ],
        correct: "The global object",
      },
      {
        text: "Which method is used to parse a JSON string into a JavaScript object?",
        answers: [
          "JSON.parse()",
          "JSON.stringify()",
          "parse.JSON()",
          "stringify.JSON()",
        ],
        correct: "JSON.parse()",
      },
    ],
    HTML: [
      {
        text: "What does HTML stand for?",
        answers: [
          "HyperText Markup Language",
          "Hyper Transfer Meta Language",
          "Home Tool Markup Language",
          "Hyper Tech Media Language",
        ],
        correct: "HyperText Markup Language",
      },
      {
        text: "Which HTML tag is used to create a hyperlink?",
        answers: ["<a>", "<link>", "<href>", "<hyper>"],
        correct: "<a>",
      },
      {
        text: "Which tag is used to display an image in HTML?",
        answers: ["<img>", "<image>", "<src>", "<pic>"],
        correct: "<img>",
      },
      {
        text: "What is the correct HTML element for inserting a line break?",
        answers: ["<br>", "<break>", "<lb>", "<newline>"],
        correct: "<br>",
      },
    ],
    CSS: [
      {
        text: "Which CSS property controls text size?",
        answers: ["font-size", "text-style", "font-weight", "size"],
        correct: "font-size",
      },
      {
        text: "Which property is used to change the background color?",
        answers: ["background-color", "color", "bgcolor", "background-style"],
        correct: "background-color",
      },
      {
        text: "How do you select an element with id 'header'?",
        answers: ["#header", ".header", "header", "*header*"],
        correct: "#header",
      },
      {
        text: "Which CSS property is used to make text bold?",
        answers: ["font-weight", "font-style", "bold", "text-weight"],
        correct: "font-weight",
      },
    ],
  };

  // ✅ Get questions from the correct localStorage key
  const allQs = JSON.parse(localStorage.getItem("quizQuestions")) || {};
  let catQs = allQs[category] || [];

  // Convert admin-format to uniform format (including timer)
  catQs = catQs
    .map((q) => {
      if (q.question && q.answers && typeof q.correctAnswerIndex === "number") {
        return {
          text: q.question,
          answers: q.answers,
          correct: q.answers[q.correctAnswerIndex],
          timer: q.timer, // pass timer to learner
        };
      } else if (q.text && q.answers && q.correct) {
        // If timer exists, keep it
        return {
          ...q,
          timer: q.timer || 10,
        };
      }
      return null;
    })
    .filter(Boolean);

  // Fallback to hardcoded default questions if needed
  if (catQs.length === 0 && defaultQuestions[category]) {
    catQs = defaultQuestions[category];
  }

  if (catQs.length === 0) {
    alert("No questions available in this category yet.");
    return;
  }

  // ✅ Use correct key for question count from admin settings
  // Get the per-category question count
  const perCatSettings = JSON.parse(
    localStorage.getItem("quizCategorySettings") || "{}"
  );
  const count = perCatSettings[category]
    ? parseInt(perCatSettings[category])
    : 5;
  questions = catQs.sort(() => Math.random() - 0.5).slice(0, count);

  userAnswers = [];

  document.getElementById("start-section").style.display = "none";
  document.getElementById("quiz-section").style.display = "block";
  loadQuestion();
});

function updateProgressBar(current, total) {
  const percentage = Math.round((current / total) * 100);
  if (progressBar) progressBar.value = percentage;
  if (progressText) progressText.textContent = `${percentage}%`;
}

function loadQuestion() {
  if (current >= questions.length) return endQuiz();

  const q = questions[current];
  questionTitle.textContent = `Q${current + 1}: ${q.text}`;
  answersList.innerHTML = "";
  q.answers.forEach((ans) => {
    const li = document.createElement("li");
    li.textContent = ans;
    li.addEventListener("click", () => checkAnswer(ans));
    answersList.appendChild(li);
  });

  // Timer per question
  timePerQuestion = q.timer || 10;
  let timeLeft = timePerQuestion;
  timerDisplay.textContent = timeLeft;
  updateProgressBar(current, questions.length);

  clearInterval(timer);
  timer = setInterval(() => {
    timeLeft--;
    timerDisplay.textContent = timeLeft;
    if (timeLeft <= 0) {
      clearInterval(timer);
      userAnswers.push(null); // No answer selected
      current++;
      loadQuestion();
    }
  }, 1000);
}

function checkAnswer(selected) {
  const correct = questions[current].correct;
  if (selected === correct) score++;
  userAnswers.push(selected);
  current++;
  loadQuestion();
}

function endQuiz() {
  clearInterval(timer);
  document.getElementById("quiz-section").style.display = "none";
  document.getElementById("result-section").style.display = "block";
  let resultsHtml = `<h2>Quiz Complete!</h2><p>Your score: ${score} / ${questions.length}</p><ul style='text-align:left;'>`;
  questions.forEach((q, i) => {
    const userAns = userAnswers[i];
    const isCorrect = userAns === q.correct;
    resultsHtml +=
      `<li><strong>Q${i + 1}:</strong> ${q.text}<br>` +
      `<span style='color:${isCorrect ? "#27ae60" : "#e74c3c"};'>Your answer: ${
        userAns !== null ? userAns : "(No answer)"
      }</span><br>` +
      `<span style='color:#3498db;'>Correct answer: ${q.correct}</span></li><br>`;
  });
  resultsHtml += "</ul>";
  document.getElementById("result-section").innerHTML =
    resultsHtml + `<button onclick='location.reload()'>Try Again</button>`;
  // Save score to high scores
  const name = usernameInput.value.trim();
  const scores = JSON.parse(localStorage.getItem("highScores")) || [];
  scores.push({ name, score, total: questions.length });
  localStorage.setItem("highScores", JSON.stringify(scores));
  // Redirect to leaderboard after short delay
  setTimeout(() => {
    window.location.href = "leaderboard.html";
  }, 1000);
}
