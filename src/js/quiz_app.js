class QuizApp {
  constructor(containerId) {
    this.currentQuestionIndex = 0;
    this.score = 0;
    this.questions = [];
    this.container = document.getElementById(containerId);
    this.userName = "";
    this.category = "";
  }

  init(categories, questionsByCategory) {
    const adminQuestions = JSON.parse(
      localStorage.getItem("adminQuestions") || "{}"
    );
    this.categories = Array.from(
      new Set([...categories, ...Object.keys(adminQuestions)])
    );
    this.questionsByCategory = { ...questionsByCategory };
    for (const cat in adminQuestions) {
      if (!this.questionsByCategory[cat]) this.questionsByCategory[cat] = [];
      this.questionsByCategory[cat] = this.questionsByCategory[cat].concat(
        adminQuestions[cat]
      );
    }
    this.renderStartScreen();
  }

  renderStartScreen() {
    this.container.innerHTML = `
      <h2>Start Quiz</h2>
      <form id="start-form">
        <label>Name: <input type="text" id="user-name" required></label><br>
        <label>Category:
          <select id="category-select" required>
            <option value="">Select</option>
            ${this.categories
              .map((cat) => `<option value="${cat}">${cat}</option>`)
              .join("")}
          </select>
        </label><br>
        <button type="submit">Start</button>
      </form>
    `;
    document.getElementById("start-form").onsubmit = (e) => {
      e.preventDefault();
      this.userName = document.getElementById("user-name").value;
      this.category = document.getElementById("category-select").value;
      this.questions = this.questionsByCategory[this.category] || [];
      this.currentQuestionIndex = 0;
      this.score = 0;
      this.renderQuestion();
    };
  }

  renderQuestion() {
    if (this.currentQuestionIndex >= this.questions.length) {
      this.finishQuiz();
      return;
    }
    const q = this.questions[this.currentQuestionIndex];
    this.container.innerHTML = `
      <h3>Question ${this.currentQuestionIndex + 1} of ${
      this.questions.length
    }</h3>
      <div>${q.question}</div>
      <form id="answer-form">
        ${q.options
          .map(
            (opt, i) => `
          <label><input type="radio" name="answer" value="${i}" required> ${opt}</label><br>
        `
          )
          .join("")}
        <button type="submit">Submit</button>
      </form>
    `;
    document.getElementById("answer-form").onsubmit = (e) => {
      e.preventDefault();
      const answer = parseInt(
        document.querySelector('input[name="answer"]:checked').value
      );
      if (answer === q.correct) this.score++;
      this.currentQuestionIndex++;
      this.renderQuestion();
    };
  }

  finishQuiz() {
    this.saveScore();
    this.container.innerHTML = `
      <h2>Quiz Complete!</h2>
      <p>Thank you, ${this.userName}!</p>
      <p>Category: ${this.category}</p>
      <p>Your score: ${this.score} / ${this.questions.length}</p>
      <button id="restart-btn">Restart</button>
    `;
    document.getElementById("restart-btn").onclick = () =>
      this.renderStartScreen();
  }

  saveScore() {
    const scores = JSON.parse(localStorage.getItem("quizScores") || "[]");
    scores.push({
      name: this.userName,
      category: this.category,
      score: this.score,
      total: this.questions.length,
      date: new Date().toISOString(),
    });
    localStorage.setItem("quizScores", JSON.stringify(scores));
  }
}
