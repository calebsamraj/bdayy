// Storage key for localStorage
const STORAGE_KEY = "bday_app_responses";

// Data structure - now stores multiple responses as an array
let responses = [];

// Current user data (for the current session)
const currentUserData = {
  name: "",
  message: "",
  answers: {
    q1: "",
    q2: "",
    q3: "",
  },
};

// Load data from localStorage on startup
function loadFromStorage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      responses = JSON.parse(saved);
    } else {
      responses = [];
    }

    // Also load current user data from a separate key
    const userSaved = localStorage.getItem("bday_current_user");
    if (userSaved) {
      const parsed = JSON.parse(userSaved);
      currentUserData.name = parsed.name || "";
      currentUserData.message = parsed.message || "";
      currentUserData.answers = parsed.answers || { q1: "", q2: "", q3: "" };

      // Restore values to UI elements if they exist
      const nameInput = document.getElementById("name-input");
      const messageArea = document.querySelector(".message-area");
      if (nameInput) nameInput.value = currentUserData.name;
      if (messageArea) messageArea.value = currentUserData.message;
    }
  } catch (e) {
    console.error("Failed to load from localStorage:", e);
    responses = [];
  }
}

// Save all responses to localStorage
function saveResponsesToStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(responses));
  } catch (e) {
    console.error("Failed to save to localStorage:", e);
  }
}

// Save current user data to localStorage
function saveCurrentUserToStorage() {
  try {
    localStorage.setItem("bday_current_user", JSON.stringify(currentUserData));
  } catch (e) {
    console.error("Failed to save current user to localStorage:", e);
  }
}

// Add a new response to the stored responses
function addResponse(name, message, answers) {
  const newResponse = {
    id: Date.now(), // unique ID for each response
    timestamp: new Date().toISOString(),
    name: name,
    message: message,
    answers: {
      q1: answers.q1 || "",
      q2: answers.q2 || "",
      q3: answers.q3 || "",
    },
  };
  responses.push(newResponse);
  saveResponsesToStorage();
  return newResponse;
}

// Delete a response by ID
function deleteResponse(id) {
  responses = responses.filter((r) => r.id !== id);
  saveResponsesToStorage();
}

// Update a response by ID
function updateResponse(id, name, message, answers) {
  const index = responses.findIndex((r) => r.id === id);
  if (index !== -1) {
    responses[index] = {
      ...responses[index],
      name: name,
      message: message,
      answers: {
        q1: answers.q1 || "",
        q2: answers.q2 || "",
        q3: answers.q3 || "",
      },
    };
    saveResponsesToStorage();
    return true;
  }
  return false;
}

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
    "screen-4-bg",
    "screen-5-bg"
  );
  if (id === "screen-1") body.classList.add("screen-1-bg");
  if (id === "screen-2") body.classList.add("screen-2-bg");
  if (id === "screen-3") body.classList.add("screen-3-bg");
  if (id === "screen-4") body.classList.add("screen-4-bg");
  if (id === "screen-5") body.classList.add("screen-5-bg");
}

// Update the summary data on the finale screen
function updateSummaryUI() {
  const nameEl = document.getElementById("summary-name");
  const msgEl = document.getElementById("summary-message");
  const q1El = document.getElementById("summary-q1");
  const q2El = document.getElementById("summary-q2");
  const q3El = document.getElementById("summary-q3");

  if (nameEl) nameEl.textContent = currentUserData.name || "—";
  if (msgEl) msgEl.textContent = currentUserData.message || "—";
  if (q1El) q1El.textContent = currentUserData.answers.q1 || "—";
  if (q2El) q2El.textContent = currentUserData.answers.q2 || "—";
  if (q3El) q3El.textContent = currentUserData.answers.q3 || "—";
}

// Update admin-only view - shows ALL responses
function updateAdminUI() {
  const container = document.getElementById("responses-container");
  if (!container) return;

  // Clear existing content
  container.innerHTML = "";

  if (responses.length === 0) {
    container.innerHTML = '<p class="no-responses">No responses saved yet.</p>';
    return;
  }

  // Sort by timestamp (newest first)
  const sortedResponses = [...responses].sort((a, b) => 
    new Date(b.timestamp) - new Date(a.timestamp)
  );

  // Create HTML for each response
  sortedResponses.forEach((response, index) => {
    const responseDiv = document.createElement("div");
    responseDiv.className = "response-card";
    responseDiv.dataset.id = response.id;

    responseDiv.innerHTML = `
      <div class="response-header">
        <span class="response-number">#${sortedResponses.length - index}</span>
        <span class="response-date">${new Date(response.timestamp).toLocaleString()}</span>
        <button class="delete-btn" onclick="deleteResponseById(${response.id})">Delete</button>
      </div>
      <div class="response-content">
        <p class="response-row">
          <span class="response-label">Name:</span>
          <span class="response-value">${escapeHtml(response.name || "—")}</span>
        </p>
        <p class="response-row">
          <span class="response-label">Message:</span>
          <span class="response-value">${escapeHtml(response.message || "—")}</span>
        </p>
        <p class="response-row">
          <span class="response-label">Q1 - Would you really hate me?</span>
          <span class="response-value">${escapeHtml(response.answers.q1 || "—")}</span>
        </p>
        <p class="response-row">
          <span class="response-label">Q2 - Do you miss me?</span>
          <span class="response-value">${escapeHtml(response.answers.q2 || "—")}</span>
        </p>
        <p class="response-row">
          <span class="response-label">Q3 - Gift requested:</span>
          <span class="response-value">${escapeHtml(response.answers.q3 || "—")}</span>
        </p>
      </div>
    `;

    container.appendChild(responseDiv);
  });

  // Update total count
  const countEl = document.getElementById("responses-count");
  if (countEl) {
    countEl.textContent = responses.length;
  }
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  if (!text) return "";
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Delete response by ID (called from onclick)
function deleteResponseById(id) {
  if (confirm("Are you sure you want to delete this response?")) {
    deleteResponse(id);
    updateAdminUI();
  }
}

// Add new response from admin form
function addResponseFromAdmin() {
  const nameInput = document.getElementById("admin-add-name");
  const messageInput = document.getElementById("admin-add-message");
  const q1Input = document.getElementById("admin-add-q1");
  const q2Input = document.getElementById("admin-add-q2");
  const q3Input = document.getElementById("admin-add-q3");

  if (!nameInput || !messageInput || !q1Input || !q2Input || !q3Input) {
    alert("Error: Form fields not found");
    return;
  }

  const name = nameInput.value.trim();
  const message = messageInput.value.trim();
  const q1 = q1Input.value;
  const q2 = q2Input.value;
  const q3 = q3Input.value.trim();

  if (!name) {
    alert("Please enter a name");
    return;
  }

  addResponse(name, message, { q1, q2, q3 });

  // Clear form
  nameInput.value = "";
  messageInput.value = "";
  q1Input.value = "";
  q2Input.value = "";
  q3Input.value = "";

  // Refresh admin UI
  updateAdminUI();
  alert("Response added successfully!");
}

// === GOOGLE SHEETS SETUP ===
// Replace this with your Google Apps Script Web App URL
// Follow the instructions in gs.html to get this URL
const GOOGLE_SHEET_URL = "https://script.google.com/macros/s/AKfycbywXh_I0wMaQUV4s6Hbg8np0p28xo285B6sFHUv5H4Zd-Q4uHwTpk30R-pA3l2tlnZq/exec";


// Send response to Google Sheets automatically
function sendToGoogleSheets(name, message, q1, q2, q3, timestamp) {
  if (!GOOGLE_SHEET_URL) {
    console.log("Google Sheet URL not configured");
    return;
  }

  const data = {
    name: name,
    message: message,
    q1: q1,
    q2: q2,
    q3: q3,
    timestamp: timestamp
  };

  fetch(GOOGLE_SHEET_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8',
    },
    body: JSON.stringify(data)
  }).then(() => {
    console.log('Response sent to Google Sheets');
  }).catch(err => {
    console.error('Error sending to Google Sheets:', err);
  });
}


// Export responses to Excel (CSV format)
function exportToExcel() {
  if (responses.length === 0) {
    alert("No responses to export!");
    return;
  }

  // CSV header
  let csvContent = "Name,Message,Q1 - Would you hate me?,Q2 - Do you miss me?,Q3 - Gift requested,Timestamp\n";

  // Add each response as a row
  responses.forEach((response) => {
    const name = escapeCsv(response.name || "");
    const message = escapeCsv(response.message || "");
    const q1 = escapeCsv(response.answers.q1 || "");
    const q2 = escapeCsv(response.answers.q2 || "");
    const q3 = escapeCsv(response.answers.q3 || "");
    const timestamp = new Date(response.timestamp).toLocaleString();

    csvContent += `${name},${message},${q1},${q2},${q3},${timestamp}\n`;
  });

  // Create and download the file
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", "birthday_responses.csv");
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  alert(`Exported ${responses.length} response(s) to Excel!`);
}

// Helper function to escape CSV special characters
function escapeCsv(text) {
  if (!text) return "";
  // Wrap in quotes and escape any quotes inside
  const escaped = String(text).replace(/"/g, '""');
  return `"${escaped}"`;
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
  // Load saved data from localStorage on startup
  loadFromStorage();

  const unlockBtn = document.getElementById("unlock-btn");
  const nextToQuizBtn = document.getElementById("next-to-quiz");
  const quizForm = document.getElementById("love-quiz-form");
  const formStatus = document.getElementById("form-status");
  const nameInput = document.getElementById("name-input");
  const messageArea = document.querySelector(".message-area");
  const adminViewBtn = document.getElementById("admin-view-btn");
  const backToFinaleBtn = document.getElementById("back-to-finale-btn");
  const backToHomeBtn = document.getElementById("back-to-home-btn");
  const adminViewBtnScreen1 = document.getElementById("admin-view-btn-screen1");
  const addResponseBtn = document.getElementById("add-response-btn");

  // Name input controls unlock button visibility
  if (nameInput && unlockBtn) {
    // Check if name already exists from storage
    if (currentUserData.name) {
      unlockBtn.disabled = false;
      unlockBtn.classList.remove("is-hidden");
    } else {
      unlockBtn.disabled = true;
      unlockBtn.classList.add("is-hidden");
    }

    nameInput.addEventListener("input", () => {
      const value = nameInput.value.trim();
      currentUserData.name = value;
      saveCurrentUserToStorage(); // Save to localStorage

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
        currentUserData.message = messageArea.value.trim();
        saveCurrentUserToStorage(); // Save to localStorage
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

  if (backToHomeBtn) {
    backToHomeBtn.addEventListener("click", () => {
      showScreen("screen-1");
    });
  }

  // Admin view button on screen 1
  if (adminViewBtnScreen1) {
    adminViewBtnScreen1.addEventListener("click", () => {
      const password = window.prompt("Admin password");
      if (password === "140504") {
        updateAdminUI();
        showScreen("screen-5");
      } else if (password !== null) {
        window.alert("Wrong password.");
      }
    });
  }

  // Add response button in admin panel
  if (addResponseBtn) {
    addResponseBtn.addEventListener("click", () => {
      addResponseFromAdmin();
    });
  }

  // Export to Excel button in admin panel
  const exportExcelBtn = document.getElementById("export-excel-btn");
  if (exportExcelBtn) {
    exportExcelBtn.addEventListener("click", () => {
      exportToExcel();
    });
  }

  // Quiz submit – keep everything local, but auto-export to Excel when someone submits
  if (quizForm) {
    quizForm.addEventListener("submit", (e) => {
      e.preventDefault();

      if (!formStatus) return;

      formStatus.textContent = "Saving your answers with love…";
      formStatus.className = "form-status";

      const formData = new FormData(quizForm);

      // Save answers to current user data
      currentUserData.answers.q1 = formData.get("would_hate_me") || "";
      currentUserData.answers.q2 = formData.get("do_you_miss_me") || "";
      currentUserData.answers.q3 = formData.get("gift_request") || "";

      // Save current user data
      saveCurrentUserToStorage();

      // ADD A NEW RESPONSE to the permanent storage (not overwrite!)
      const newResponse = addResponse(
        currentUserData.name,
        currentUserData.message,
        currentUserData.answers
      );

      // SEND TO GOOGLE SHEETS - automatically when someone submits
      sendToGoogleSheets(
        currentUserData.name,
        currentUserData.message,
        currentUserData.answers.q1,
        currentUserData.answers.q2,
        currentUserData.answers.q3,
        newResponse.timestamp
      );

      // AUTO-EXPORT TO EXCEL when someone submits - downloads the CSV file
      exportToExcel();

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
