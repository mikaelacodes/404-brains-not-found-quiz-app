document.addEventListener("DOMContentLoaded", () => {
  const leaderboardDiv = document.getElementById("leaderboard");
  if (!leaderboardDiv) return;

  const scores = JSON.parse(localStorage.getItem("highScores")) || [];
  if (scores.length === 0) {
    leaderboardDiv.innerHTML =
      '<p style="text-align:center;">No scores yet. Be the first to take the quiz!</p>';
    return;
  }

  scores.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));

  let html = `<h2 style="text-align:center; color:#6a11cb; margin-bottom:1.5rem;">Leaderboard</h2>`;
  html += `<table style="width:100%;border-collapse:collapse;background:#f8f9fa;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(106,17,203,0.08);font-size:1.1rem;">
    <thead>
      <tr style='background:linear-gradient(90deg,#6a11cb,#2575fc);color:#fff;'>
        <th style='padding:12px 8px;'>#</th>
        <th style='padding:12px 8px;'>Name</th>
        <th style='padding:12px 8px;'>Score</th>
      </tr>
    </thead>
    <tbody>`;
  scores.slice(0, 10).forEach((entry, i) => {
    let scoreDisplay = entry.score;
    if (typeof entry.total === "number") {
      scoreDisplay = `${entry.score} / ${entry.total}`;
    }
    html += `<tr style='background:${i % 2 === 0 ? "#eaf0fb" : "#fff"};'>
      <td style='padding:10px 8px;text-align:center;font-weight:bold;'>${
        i + 1
      }</td>
      <td style='padding:10px 8px;'>${entry.name}</td>
      <td style='padding:10px 8px;text-align:center;'>${scoreDisplay}</td>
    </tr>`;
  });
  html += `</tbody></table>`;
  leaderboardDiv.innerHTML = html;
});

// Utility: Clear leaderboard and quiz data (for admin/testing)
window.clearQuizDB = function () {
  localStorage.removeItem("highScores");
  localStorage.removeItem("quizQuestions");
  localStorage.removeItem("quizCategories");
  localStorage.removeItem("quizCategorySettings");
  alert("Quiz data and leaderboard cleared!");
  location.reload();
};
