// script.js
// NOTE: Replace `YOUR_APPS_SCRIPT_WEBAPP_URL` with the URL of your deployed Apps Script web app.
// The Apps Script should expose two endpoints:
//   GET  /leaderboard?mobile=xxxx   -> returns JSON of the matching leaderboard row
//   POST /log                     -> accepts JSON {timestamp, mobile, coinsUtilized, rank}

const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzkLPMLPEz-yE_U_spgFJXRHLhUvTYS-3QyiHJUEfzCcm1xdXxUVfYtuSHtVyAWk9x-Rg/exec";

function showError(message) {
  const errEl = document.getElementById("errorMsg");
  errEl.textContent = message;
  errEl.classList.remove("hidden");
}

function clearError() {
  const errEl = document.getElementById("errorMsg");
  errEl.textContent = "";
  errEl.classList.add("hidden");
}

function validateMobile(mobile) {
  // Simple Indian mobile validation: 10 digits, starts with 6-9
  const regex = /^[6-9]\d{9}$/;
  return regex.test(mobile);
}

async function fetchLeaderboard(mobile) {
  const url = `${APPS_SCRIPT_URL}?mobile=${encodeURIComponent(mobile)}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Network response was not ok");
  const data = await response.json();
  return data; // Expected shape: {mobile_no, user_id, ltv, "exp coins utilised":..., "exp rank":...}
}

async function logUserLookup(entry) {
  try {
    const params = new URLSearchParams({
      action: 'log',
      timestamp: entry.timestamp,
      mobile: entry.mobile,
      coinsUtilized: entry.coinsUtilized,
      rank: entry.rank
    });
    const url = `${APPS_SCRIPT_URL}?${params.toString()}`;
    await fetch(url, { method: "GET" });
  } catch (err) {
    console.error("Failed to log user lookup:", err);
  }
}

function formatTerms(text) {
  if (!text) return "Terms & Conditions not available";

  // Split by double newlines for paragraphs
  const paragraphs = text.split(/\n\n+/);

  return paragraphs.map(p => {
    // Check if it's a list (starts with number or dash)
    if (/^\d+\.|\-/.test(p.trim())) {
      const items = p.split('\n').filter(i => i.trim());
      return `<ul>${items.map(item => `<li>${item.replace(/^\d+\.\s*|\-\s*/, '')}</li>`).join('')}</ul>`;
    }

    // Check if it's a heading (all caps or short)
    if (p.length < 50 && p === p.toUpperCase()) {
      return `<h3>${p}</h3>`;
    }

    // Bold some Keywords
    let formatted = p.replace(/(Campaign Period|Eligibility|Ranking Criteria|Prizes|General Terms)/gi, '<strong>$1</strong>');

    return `<p>${formatted}</p>`;
  }).join('');
}

async function fetchTermsAndConditions() {
  try {
    const url = `${APPS_SCRIPT_URL}?action=terms`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch T&C");
    const data = await response.json();
    return formatTerms(data.terms);
  } catch (err) {
    console.error("Failed to fetch T&C:", err);
    const fallback = `Campaign Period: 29 Jan – 1 Feb 2026\n\n1. Eligibility\n- Open to all registered Dostt users.\n- Valid mobile number required.\n\n2. Ranking Criteria\n- Based on total coins spent during campaign.\n\n3. Prizes\n- Rank #1: Apple AirPods 4.\n\n4. General Terms\n- Dostt reserves the right to modify rules.\n- Final decision by Dostt team.`;
    return formatTerms(fallback);
  }
}

function formatNumber(num) {
  return Number(num).toLocaleString();
}

async function handleLookup() {
  clearError();
  const mobile = document.getElementById("mobileInput").value.trim();

  // Normalize mobile number - remove +91 or 91 prefix if present
  let normalizedMobile = mobile.replace(/^\+91/, '').replace(/^91/, '');

  if (!validateMobile(normalizedMobile)) {
    showError("Invalid mobile number");
    return;
  }

  // Show loading state
  const btn = document.getElementById("lookupBtn");
  const btnText = btn.querySelector(".btn-text");
  const spinner = btn.querySelector(".spinner");
  btn.classList.add("loading");
  btnText.textContent = "Loading...";
  spinner.classList.remove("hidden");

  try {
    // Try multiple formats: plain 10-digit, with 91, with +91
    const formats = [normalizedMobile, `91${normalizedMobile}`, `+91${normalizedMobile}`];
    let row = null;

    for (const format of formats) {
      const testRow = await fetchLeaderboard(format);
      if (testRow && Object.keys(testRow).length > 0) {
        row = testRow;
        break;
      }
    }

    if (!row || Object.keys(row).length === 0) {
      showError("Mobile number not found");
      return;
    }

    // Populate UI with animation
    const resultSection = document.getElementById("resultSection");
    resultSection.classList.remove("hidden");
    resultSection.style.animation = "fadeIn 0.5s ease-out";

    document.getElementById("rankValue").textContent = row["exp rank"];
    document.getElementById("coinsUtilized").textContent = formatNumber(row["exp coins utilised"]);

    // Calculate Coins to go for Rank #1
    const userRank = Number(row["exp rank"]);
    const userCoins = Number(row["exp coins utilised"]);
    const rank1Coins = Number(row.rank1Coins) || 0;

    const coinsToRank1 = Math.max(0, rank1Coins - userCoins);

    const totalCoinsEl = document.getElementById("totalCoins");
    if (userRank === 1) {
      totalCoinsEl.textContent = "Goal Met! 🎉";
      totalCoinsEl.style.fontSize = "1.2rem";
    } else {
      totalCoinsEl.textContent = formatNumber(coinsToRank1);
      totalCoinsEl.style.fontSize = "2rem";
    }

    // Motivation message
    const motivationEl = document.getElementById("motivation");

    if (userRank === 1) {
      motivationEl.innerHTML = "🎉 <strong>You are currently Rank #1!</strong> Keep leading to win Apple AirPods 4!";
      motivationEl.style.color = "#4ade80";
      motivationEl.style.fontSize = "1.2rem";
      motivationEl.style.fontWeight = "600";
    } else {
      // Show generic motivation without fetching rank 1 (to avoid extra API calls)
      motivationEl.innerHTML = `🔥 You're Rank #${userRank}! <strong>Keep spending coins to climb higher!</strong>`;
      motivationEl.style.color = "#ffa500";
      motivationEl.style.fontSize = "1.1rem";
    }

    // Log the view (timestamp in IST)
    const now = new Date();
    const istOffset = 5.5 * 60; // minutes
    const istTime = new Date(now.getTime() + istOffset * 60 * 1000);
    const logEntry = {
      timestamp: istTime.toISOString(),
      mobile: normalizedMobile,
      "coinsUtilized": row["exp coins utilised"],
      "rank": row["exp rank"],
    };
    await logUserLookup(logEntry);
  } catch (err) {
    console.error(err);
    showError("Something went wrong. Please try again later.");
  } finally {
    // Reset button state
    btn.classList.remove("loading");
    btnText.textContent = "Check My Rank";
    spinner.classList.add("hidden");
  }
}

document.getElementById("lookupBtn").addEventListener("click", handleLookup);

// Allow Enter key to trigger lookup
document.getElementById("mobileInput").addEventListener("keypress", (e) => {
  if (e.key === "Enter") handleLookup();
});

// Terms modal handling with dynamic content loading
const termsLink = document.getElementById("termsLink");
const termsModal = document.getElementById("termsModal");
const closeModal = document.getElementById("closeModal");

termsLink.addEventListener("click", async (e) => {
  e.preventDefault();

  // Show loading state
  const modalContent = termsModal.querySelector(".modal-content");
  const termsBody = document.getElementById("termsBody");
  termsBody.innerHTML = "<p style='text-align:center;'>Loading...</p>";
  termsModal.classList.remove("hidden");

  // Fetch T&C from Google Docs
  const termsHtml = await fetchTermsAndConditions();
  termsBody.innerHTML = termsHtml;
});

closeModal.addEventListener("click", () => termsModal.classList.add("hidden"));
window.addEventListener("click", (e) => {
  if (e.target === termsModal) termsModal.classList.add("hidden");
});
