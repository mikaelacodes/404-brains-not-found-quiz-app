// Hardcoded credentials (Insecure: Only for demo/testing)
const ADMIN_CREDENTIALS = {
  username: "admin",
  password: "1234",
};

// Login Logic
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
    new AdminPanel("admin-container");
  } else {
    loginError.textContent = "Invalid credentials";
  }
});

// Predefined categories/questions fallback
const DEFAULT_CATEGORIES = ["JavaScript", "HTML", "CSS"];
const DEFAULT_QUESTIONS = {
  JavaScript: [
    {
      question: "What is a closure?",
      answers: [
        "A function with preserved data from its lexical scope",
        "A CSS property",
        "A kind of loop",
        "An error",
      ],
      correctAnswerIndex: 0,
      timer: 30,
    },
  ],
  HTML: [
    {
      question: "What does HTML stand for?",
      answers: [
        "HyperText Markup Language",
        "Hyper Transfer Meta Language",
        "Home Tool Markup Language",
        "Hyper Tech Media Language",
      ],
      correctAnswerIndex: 0,
      timer: 30,
    },
  ],
  CSS: [
    {
      question: "Which CSS property controls text size?",
      answers: ["font-size", "text-style", "font-weight", "size"],
      correctAnswerIndex: 0,
      timer: 30,
    },
  ],
};

const ERROR_MESSAGES = {
  CATEGORY_EXISTS: "Category already exists.",
  CATEGORY_REQUIRED: "Please select or create a category.",
  QUESTION_REQUIRED: "Question and all options are required.",
  DUPLICATE_QUESTION: "This question already exists in the category.",
  INVALID_ANSWER_INDEX: "Please select a valid correct option.",
  INVALID_QUESTION_COUNT: "Invalid number of questions set for the quiz.",
};

// --- AdminPanel class ---
class AdminPanel {
  constructor(rootId) {
    this.root = document.getElementById(rootId);
    this.state = {
      categories: [],
      currentCategory: "",
      editingIndex: null,
    };
    this.init();
  }

  init() {
    this.loadData();
    this.renderUI();
    this.loadCategories();
    this.loadSettings();
  }

  loadData() {
    this.state.categories =
      JSON.parse(localStorage.getItem("quizCategories")) || DEFAULT_CATEGORIES;
    this.questions = JSON.parse(localStorage.getItem("quizQuestions")) || {
      ...DEFAULT_QUESTIONS,
    };
  }

  saveData() {
    localStorage.setItem(
      "quizCategories",
      JSON.stringify(this.state.categories)
    );
    localStorage.setItem("quizQuestions", JSON.stringify(this.questions));
  }

  renderUI() {
    this.root.innerHTML = `
      <h1>Admin Panel</h1>
      <section id="category-section"></section>
      <section id="settings-section"></section>
      <section id="question-form-section"></section>
      <section id="question-list-section"></section>
    `;

    this.renderCategorySection();
    this.renderQuestionForm();
    this.renderSettingsSection();
    this.renderQuestionListSection();
  }

  renderCategorySection() {
    const container = document.getElementById("category-section");
    container.innerHTML = `
      <h2>Create New Category</h2>
      <input type="text" id="category-input" placeholder="Category name" />
      <button id="add-category-btn">Add Category</button>
      <ul id="category-list"></ul>
    `;

    document.getElementById("add-category-btn").onclick = () => {
      const name = document.getElementById("category-input").value.trim();
      if (!name) return alert(ERROR_MESSAGES.CATEGORY_REQUIRED);
      if (this.state.categories.includes(name))
        return alert(ERROR_MESSAGES.CATEGORY_EXISTS);

      this.state.categories.push(name);
      this.questions[name] = [];
      this.saveData();
      this.loadCategories();
      this.renderCategoryList();
      this.renderQuestionList();
      document.getElementById("category-input").value = "";
    };

    this.renderCategoryList();
  }

  renderCategoryList() {
    const list = document.getElementById("category-list");
    if (!list) return;
    list.innerHTML = "";
    this.state.categories.forEach((cat) => {
      const li = document.createElement("li");
      li.innerHTML = `
        ${cat} <button data-cat="${cat}" class="delete-category-btn">Delete</button>
      `;
      li.querySelector(".delete-category-btn").onclick = () => {
        if (confirm(`Delete category '${cat}' and its questions?`)) {
          this.deleteCategory(cat);
        }
      };
      list.appendChild(li);
    });
  }

  deleteCategory(category) {
    this.state.categories = this.state.categories.filter((c) => c !== category);
    delete this.questions[category];
    if (this.state.currentCategory === category) {
      this.state.currentCategory = "";
    }
    this.saveData();
    this.loadCategories();
    this.renderCategoryList();
    this.renderQuestionList();
  }

  loadCategories() {
    this.categorySelect.innerHTML = `<option disabled selected>Select category</option>`;
    this.categoryView.innerHTML = `<option disabled selected>View category</option>`;
    this.state.categories.forEach((cat) => {
      const option1 = new Option(cat, cat);
      const option2 = new Option(cat, cat);
      this.categorySelect.appendChild(option1);
      this.categoryView.appendChild(option2);
    });
  }

  renderQuestionForm() {
    const container = document.getElementById("question-form-section");
    container.innerHTML = `
      <h2>Add/Edit Question</h2>
      <select id="category-select"></select>
      <input type="text" id="question-input" placeholder="Question" />
      <input type="text" id="option-0" placeholder="Option 1" />
      <input type="text" id="option-1" placeholder="Option 2" />
      <input type="text" id="option-2" placeholder="Option 3" />
      <input type="text" id="option-3" placeholder="Option 4" />
      <select id="correct-select">
        <option value="" disabled selected>Select correct option</option>
        <option value="0">Option 1</option>
        <option value="1">Option 2</option>
        <option value="2">Option 3</option>
        <option value="3">Option 4</option>
      </select>
      <input type="number" id="timer-input" min="5" max="300" placeholder="Time (seconds) per question" />
      <button id="save-question-btn">Save Question</button>
    `;

    this.categorySelect = document.getElementById("category-select");

    document.getElementById("save-question-btn").onclick = () => {
      const category = this.categorySelect.value;
      const question = document.getElementById("question-input").value.trim();
      const options = [0, 1, 2, 3].map((i) =>
        document.getElementById(`option-${i}`).value.trim()
      );
      const correct = parseInt(document.getElementById("correct-select").value);
      const timer = parseInt(document.getElementById("timer-input").value);

      if (!category) return alert(ERROR_MESSAGES.CATEGORY_REQUIRED);
      if (!question || options.some((opt) => !opt))
        return alert(ERROR_MESSAGES.QUESTION_REQUIRED);
      if (isNaN(correct)) return alert(ERROR_MESSAGES.INVALID_ANSWER_INDEX);
      if (isNaN(timer) || timer < 5)
        return alert("Please set a valid timer (min 5 seconds).");

      const list = this.questions[category] || [];

      if (this.state.editingIndex !== null) {
        list[this.state.editingIndex] = {
          question,
          answers: options,
          correctAnswerIndex: correct,
          timer,
        };
        this.state.editingIndex = null;
      } else {
        if (list.find((q) => q.question === question))
          return alert(ERROR_MESSAGES.DUPLICATE_QUESTION);
        list.push({
          question,
          answers: options,
          correctAnswerIndex: correct,
          timer,
        });
      }

      this.questions[category] = list;
      this.saveData();
      this.renderQuestionList();
      this.clearQuestionForm();
      alert("Question saved!");
    };
  }

  clearQuestionForm() {
    document.getElementById("question-input").value = "";
    [0, 1, 2, 3].forEach(
      (i) => (document.getElementById(`option-${i}`).value = "")
    );
    document.getElementById("correct-select").value = "";
    const timerInput = document.getElementById("timer-input");
    if (timerInput) timerInput.value = "";
  }

  renderSettingsSection() {
    const container = document.getElementById("settings-section");
    container.innerHTML = `
      <h2>Quiz Settings</h2>
      <label>Questions per quiz:</label>
      <input type="number" id="question-count" min="1" max="50">
      <button id="save-settings-btn">Save</button>
    `;

    document.getElementById("save-settings-btn").onclick = () => {
      const count = parseInt(document.getElementById("question-count").value);
      if (!count || count < 1)
        return alert(ERROR_MESSAGES.INVALID_QUESTION_COUNT);
      localStorage.setItem("quizQuestionCount", count);
      alert("Settings saved!");
    };
  }

  loadSettings() {
    const count = localStorage.getItem("quizQuestionCount");
    if (count) {
      document.getElementById("question-count").value = count;
    }
  }

  renderQuestionListSection() {
    const container = document.getElementById("question-list-section");
    container.innerHTML = `
      <h2>View Questions</h2>
      <select id="category-view"></select>
      <ul id="question-list"></ul>
    `;

    this.categoryView = document.getElementById("category-view");
    this.questionList = document.getElementById("question-list");

    this.categoryView.onchange = () => {
      this.state.currentCategory = this.categoryView.value;
      this.renderQuestionList();
    };
  }

  renderQuestionList() {
    const category = this.state.currentCategory;
    const list = this.questions[category] || [];

    this.questionList.innerHTML = "";

    list.forEach((q, index) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <strong>${q.question}</strong><br>
        ${q.answers.map((a, i) => `${i + 1}. ${a}`).join("<br>")}
        <br><em>Correct:</em> ${q.answers[q.correctAnswerIndex]}
        <br>
        <button data-action="edit" data-index="${index}">Edit</button>
        <button data-action="delete" data-index="${index}">Delete</button>
      `;

      li.querySelector('[data-action="edit"]').onclick = () =>
        this.editQuestion(index);
      li.querySelector('[data-action="delete"]').onclick = () =>
        this.deleteQuestion(index);
      this.questionList.appendChild(li);
    });
  }

  editQuestion(index) {
    const category = this.state.currentCategory;
    const q = this.questions[category][index];

    this.categorySelect.value = category;
    document.getElementById("question-input").value = q.question;
    q.answers.forEach(
      (a, i) => (document.getElementById(`option-${i}`).value = a)
    );
    document.getElementById("correct-select").value = q.correctAnswerIndex;
    if (q.timer) document.getElementById("timer-input").value = q.timer;
    this.state.editingIndex = index;

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  deleteQuestion(index) {
    const category = this.state.currentCategory;
    this.questions[category].splice(index, 1);
    this.saveData();
    this.renderQuestionList();
  }
}
