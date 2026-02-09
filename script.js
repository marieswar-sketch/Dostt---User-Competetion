// script.js
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzkLPMLPEz-yE_U_spgFJXRHLhUvTYS-3QyiHJUEfzCcm1xdXxUVfYtuSHtVyAWk9x-Rg/exec";

// --- UI Utilities ---
function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(screenId).classList.add('active');
}

function showError(message) {
  const errEl = document.getElementById("errorMsg");
  errEl.textContent = message;
  errEl.classList.remove("hidden");
}

function clearError() {
  const errEl = document.getElementById("errorMsg");
  errEl.classList.add("hidden");
}

function formatNumber(num) {
  return Number(num || 0).toLocaleString();
}

function validateMobile(mobile) {
  return /^[6-9]\d{9}$/.test(mobile);
}

// --- Particle System (Blossoms) ---
function createParticles() {
  const container = document.getElementById('particles-container');
  const particleTypes = ['💰', '🪙', '🎧', '✨'];
  const count = 15;

  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.textContent = particleTypes[Math.floor(Math.random() * particleTypes.length)];

    // Random position
    p.style.left = Math.random() * 100 + 'vw';
    p.style.top = Math.random() * 100 + 'vh';

    // Random size
    const size = Math.random() * 20 + 20;
    p.style.fontSize = `${size}px`;

    // Animation
    const duration = Math.random() * 10 + 10;
    const delay = Math.random() * 5;
    p.style.animation = `float ${duration}s linear ${delay}s infinite`;

    container.appendChild(p);
  }
}

// Add CSS for floating particles dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes float {
        0% { transform: translateY(0) rotate(0deg); opacity: 0; }
        10% { opacity: 0.4; }
        90% { opacity: 0.4; }
        100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; }
    }
`;
document.head.appendChild(style);

// --- Backend Integration ---
async function fetchLeaderboard(mobile) {
  const url = `${APPS_SCRIPT_URL}?mobile=${encodeURIComponent(mobile)}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Network error");
  return await response.json();
}

async function logUserLookup(entry) {
  try {
    const params = new URLSearchParams({
      action: 'log',
      ...entry
    });
    await fetch(`${APPS_SCRIPT_URL}?${params.toString()}`, { method: "GET" });
  } catch (err) {
    console.error("Log error:", err);
  }
}

async function handleLookup() {
  clearError();
  const mobileInput = document.getElementById("mobileInput");
  const mobile = mobileInput.value.trim();
  let normalizedMobile = mobile.replace(/^\+91/, '').replace(/^91/, '');

  if (!validateMobile(normalizedMobile)) {
    showError("Please enter a valid 10-digit mobile number");
    return;
  }

  const btn = document.getElementById("lookupBtn");
  const btnText = btn.querySelector(".btn-text");
  const spinner = btn.querySelector(".spinner");

  btn.disabled = true;
  btnText.textContent = "Verifying...";
  spinner.classList.remove("hidden");

  try {
    const formats = [normalizedMobile, `91${normalizedMobile}`, `+91${normalizedMobile}`];
    let row = null;

    for (const format of formats) {
      const data = await fetchLeaderboard(format);
      if (data && data["exp rank"]) {
        row = data;
        break;
      }
    }

    if (!row) {
      showError("No record found for this number");
      return;
    }

    // populate dashboard
    document.getElementById("rankValue").textContent = `#${row["exp rank"]}`;
    document.getElementById("coinsUtilized").textContent = formatNumber(row["exp coins utilised"]);

    // Motivation
    const motivationEl = document.getElementById("motivation");
    if (row["exp rank"] == 1) {
      motivationEl.innerHTML = "You're at the top! Hold your position to grab the <strong>Apple AirPods</strong>! 🎉";
    } else {
      motivationEl.innerHTML = `You're Rank #${row["exp rank"]}! Keep spending coins to grab those <strong>Apple AirPods</strong>! 🎧`;
    }

    showScreen('dashboardScreen');

    // Log view
    logUserLookup({
      timestamp: new Date().toISOString(),
      mobile: normalizedMobile,
      coinsUtilized: userCoins,
      rank: row["exp rank"]
    });

  } catch (err) {
    console.error(err);
    showError("Something went wrong. Please try again.");
  } finally {
    btn.disabled = false;
    btnText.textContent = "Check Progress";
    spinner.classList.add("hidden");
  }
}

// --- Initialization ---
document.getElementById("lookupBtn").addEventListener("click", handleLookup);
document.getElementById("mobileInput").addEventListener("keypress", (e) => {
  if (e.key === "Enter") handleLookup();
});

document.getElementById("logoutBtn").addEventListener("click", () => {
  document.getElementById("mobileInput").value = "";
  showScreen('authScreen');
});

// Terms Modal
const termsLink = document.getElementById("termsLink");
const termsModal = document.getElementById("termsModal");
const closeModal = document.getElementById("closeModal");

termsLink.addEventListener("click", async (e) => {
  e.preventDefault();
  const termsBody = document.getElementById("termsBody");
  termsBody.innerHTML = "<p style='text-align:center;'>Fetching latest terms...</p>";
  termsModal.classList.remove("hidden");

  try {
    const res = await fetch(`${APPS_SCRIPT_URL}?action=terms`);
    const data = await res.json();
    termsBody.innerHTML = data.terms || "Terms & Conditions not available";
  } catch (err) {
    termsBody.innerHTML = "Error loading terms. Please try again later.";
  }
});

closeModal.addEventListener("click", () => termsModal.classList.add("hidden"));
window.addEventListener("click", (e) => {
  if (e.target === termsModal) termsModal.classList.add("hidden");
});

// Start particles
createParticles();
