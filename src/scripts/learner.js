const startBtn = document.getElementById("start-btn");
const usernameInput = document.getElementById("username");
const categorySelect = document.getElementById("category");
const questionTitle = document.getElementById("question-title");
const answersList = document.getElementById("answers-list");
const timerDisplay = document.getElementById("timer");
const progressBar = document.getElementById("progress-bar");

let questions = [];
let current = 0;
let score = 0;
let timer = null;
let timePerQuestion = 10;

startBtn.addEventListener("click", () => {
  const name = usernameInput.value.trim();
  const category = categorySelect.value;
  if (!name) return alert("Enter your name!");

  const allQs = JSON.parse(localStorage.getItem("questions")) || {};
  const count = parseInt(localStorage.getItem("questionCount")) || 5;
  const catQs = allQs[category] || [];

  questions = catQs.sort(() => Math.random() - 0.5).slice(0, count);

  if (questions.length === 0) {
    alert("No questions set by Admin in this category yet.");
    return;
  }

  document.getElementById("start-section").style.display = "none";
  document.getElementById("quiz-section").style.display = "block";
  loadQuestion();
});

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

  // Timer
  let timeLeft = timePerQuestion;
  timerDisplay.textContent = timeLeft;
  progressBar.value = (current / questions.length) * 100;

  clearInterval(timer);
  timer = setInterval(() => {
    timeLeft--;
    timerDisplay.textContent = timeLeft;
    if (timeLeft <= 0) {
      clearInterval(timer);
      current++;
      loadQuestion();
    }
  }, 1000);
}

function checkAnswer(selected) {
  const correct = questions[current].correct;
  if (selected === correct) score++;

  current++;
  loadQuestion();
}

function endQuiz() {
  clearInterval(timer);
  document.getElementById("quiz-section").style.display = "none";
  document.getElementById("result-section").style.display = "block";
  document.getElementById("score-output").textContent = `Your score: ${score} / ${questions.length}`;
  
  // Save to high scores
  const name = usernameInput.value.trim();
  const scores = JSON.parse(localStorage.getItem("highScores")) || [];
  scores.push({ name, score });
  localStorage.setItem("highScores", JSON.stringify(scores));
}
