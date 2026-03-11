// Simple in-memory data store for this session
const appData = {
  name: "",
  message: "",
  answers: {
    q1: "",
    q2: "",
    q3: "",
  },
};

// Utility to switch between screens and update body background class
function showScreen(id) {
  const screens = document.querySelectorAll(".screen");
  screens.forEach((s) => {
    s.classList.remove("active");
  });

  const target = document.getElementById(id);
  if (target) {
    target.classList.add("active");
  }

  // Update body class for background
  const body = document.body;
  body.classList.remove(
    "screen-1-bg",
    "screen-2-bg",
    "screen-3-bg",
    "screen-4-bg"
  );
  if (id === "screen-1") body.classList.add("screen-1-bg");
  if (id === "screen-2") body.classList.add("screen-2-bg");
  if (id === "screen-3") body.classList.add("screen-3-bg");
  if (id === "screen-4") body.classList.add("screen-4-bg");
}

// Update the summary data on the final screen
function updateSummaryUI() {
  const nameEl = document.getElementById("summary-name");
  const msgEl = document.getElementById("summary-message");
  const q1El = document.getElementById("summary-q1");
  const q2El = document.getElementById("summary-q2");
  const q3El = document.getElementById("summary-q3");

  if (nameEl) nameEl.textContent = appData.name || "—";
  if (msgEl) msgEl.textContent = appData.message || "—";
  if (q1El) q1El.textContent = appData.answers.q1 || "—";
  if (q2El) q2El.textContent = appData.answers.q2 || "—";
  if (q3El) q3El.textContent = appData.answers.q3 || "—";
}

// Update admin-only view
function updateAdminUI() {
  const nameEl = document.getElementById("admin-name");
  const msgEl = document.getElementById("admin-message");
  const q1El = document.getElementById("admin-q1");
  const q2El = document.getElementById("admin-q2");
  const q3El = document.getElementById("admin-q3");

  if (nameEl) nameEl.textContent = appData.name || "—";
  if (msgEl) msgEl.textContent = appData.message || "—";
  if (q1El) q1El.textContent = appData.answers.q1 || "—";
  if (q2El) q2El.textContent = appData.answers.q2 || "—";
  if (q3El) q3El.textContent = appData.answers.q3 || "—";
}

// Global floating heart effect on click
(function setupHeartClicks() {
  const heartContainer = document.getElementById("heart-container");
  if (!heartContainer) return;

  document.addEventListener("click", (event) => {
    // Ignore right-click or middle-click
    if (event.button !== 0) return;

    const heart = document.createElement("span");
    heart.className = "floating-heart";
    heart.textContent = "❤";

    // Use clientX/Y to position relative to viewport
    const x = event.clientX;
    const y = event.clientY;

    heart.style.left = `${x}px`;
    heart.style.top = `${y}px`;

    // Slight randomization for variety
    const randomScale = 0.9 + Math.random() * 0.4;
    const randomRotate = (Math.random() * 40 - 20).toFixed(1);
    heart.style.transform = `translate(-50%, -50%) scale(${randomScale}) rotate(${randomRotate}deg)`;

    heartContainer.appendChild(heart);

    // Cleanup after animation
    heart.addEventListener("animationend", () => {
      heart.remove();
    });
  });
})();

// Main SPA logic
document.addEventListener("DOMContentLoaded", () => {
  const unlockBtn = document.getElementById("unlock-btn");
  const nextToQuizBtn = document.getElementById("next-to-quiz");
  const quizForm = document.getElementById("love-quiz-form");
  const formStatus = document.getElementById("form-status");
  const nameInput = document.getElementById("name-input");
  const messageArea = document.querySelector(".message-area");
  const adminViewBtn = document.getElementById("admin-view-btn");
  const backToFinaleBtn = document.getElementById("back-to-finale-btn");

  // Name input controls unlock button visibility
  if (nameInput && unlockBtn) {
    unlockBtn.disabled = true;
    unlockBtn.classList.add("is-hidden");

    nameInput.addEventListener("input", () => {
      const value = nameInput.value.trim();
      appData.name = value;

      if (value.length > 0) {
        unlockBtn.disabled = false;
        unlockBtn.classList.remove("is-hidden");
      } else {
        unlockBtn.disabled = true;
        unlockBtn.classList.add("is-hidden");
      }
    });
  }

  // Screen transitions
  if (unlockBtn) {
    unlockBtn.addEventListener("click", () => {
      showScreen("screen-2");
    });
  }

  if (nextToQuizBtn) {
    nextToQuizBtn.addEventListener("click", () => {
      // Save the space message before moving on
      if (messageArea) {
        appData.message = messageArea.value.trim();
      }
      showScreen("screen-3");
    });
  }

  if (adminViewBtn) {
    adminViewBtn.addEventListener("click", () => {
      const password = window.prompt("Admin password");
      if (password === "140504") {
        updateAdminUI();
        showScreen("screen-5");
      } else if (password !== null) {
        window.alert("Wrong password.");
      }
    });
  }

  if (backToFinaleBtn) {
    backToFinaleBtn.addEventListener("click", () => {
      showScreen("screen-4");
    });
  }

  // Quiz submit – keep everything local, no email
  if (quizForm) {
    quizForm.addEventListener("submit", (e) => {
      e.preventDefault();

      if (!formStatus) return;

      formStatus.textContent = "Saving your answers with love…";
      formStatus.className = "form-status";

      const formData = new FormData(quizForm);

      // Save answers locally so we can show them on the last page
      appData.answers.q1 = formData.get("would_hate_me") || "";
      appData.answers.q2 = formData.get("do_you_miss_me") || "";
      appData.answers.q3 = formData.get("gift_request") || "";
      updateSummaryUI();
      formStatus.textContent = "Got it. Thank you for answering, love. 💖";
      formStatus.classList.add("success");

      // Small delay for feedback, then show finale
      setTimeout(() => {
        showScreen("screen-4");
      }, 700);
    });
  }
});

