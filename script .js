/* =============================================
   IPL 2025 GC PREDICTIONS — FIREBASE SCRIPT
   ============================================= */

// ─────────────────────────────────────────────
//  🔥 STEP 1: PASTE YOUR FIREBASE CONFIG HERE
//  Replace every value below with your own
//  (from Firebase Console → Project Settings)
// ─────────────────────────────────────────────
const FIREBASE_CONFIG = {
  apiKey:            "PASTE_YOUR_apiKey_HERE",
  authDomain:        "PASTE_YOUR_authDomain_HERE",
  databaseURL:       "PASTE_YOUR_databaseURL_HERE",
  projectId:         "PASTE_YOUR_projectId_HERE",
  storageBucket:     "PASTE_YOUR_storageBucket_HERE",
  messagingSenderId: "PASTE_YOUR_messagingSenderId_HERE",
  appId:             "PASTE_YOUR_appId_HERE",
};
// ─────────────────────────────────────────────

// ─── DATA ─────────────────────────────────────
const IPL_TEAMS = [
  { id: "csk",  name: "Chennai Super Kings",         short: "CSK",  logo: "🦁" },
  { id: "mi",   name: "Mumbai Indians",              short: "MI",   logo: "🔵" },
  { id: "rcb",  name: "Royal Challengers Bengaluru", short: "RCB",  logo: "🔴" },
  { id: "kkr",  name: "Kolkata Knight Riders",       short: "KKR",  logo: "💜" },
  { id: "dc",   name: "Delhi Capitals",              short: "DC",   logo: "🔷" },
  { id: "pbks", name: "Punjab Kings",                short: "PBKS", logo: "❤️" },
  { id: "rr",   name: "Rajasthan Royals",            short: "RR",   logo: "🩷" },
  { id: "srh",  name: "Sunrisers Hyderabad",         short: "SRH",  logo: "🟠" },
  { id: "lsg",  name: "Lucknow Super Giants",        short: "LSG",  logo: "🩵" },
  { id: "gt",   name: "Gujarat Titans",              short: "GT",   logo: "🔵" },
];

const MVP_PLAYERS = [
  { id: "rv",  name: "Virat Kohli",      team: "RCB", emoji: "👑" },
  { id: "ms",  name: "MS Dhoni",         team: "CSK", emoji: "🧤" },
  { id: "rg",  name: "Rohit Sharma",     team: "MI",  emoji: "🧢" },
  { id: "sr",  name: "Suryakumar Yadav", team: "MI",  emoji: "🌤️" },
  { id: "hs",  name: "Hardik Pandya",    team: "MI",  emoji: "💪" },
  { id: "jb",  name: "Jos Buttler",      team: "RR",  emoji: "🏏" },
  { id: "rs",  name: "Rishabh Pant",     team: "LSG", emoji: "🧤" },
  { id: "sa",  name: "Shubman Gill",     team: "GT",  emoji: "🌟" },
  { id: "kl",  name: "KL Rahul",         team: "DC",  emoji: "🎯" },
  { id: "hc",  name: "Heinrich Klaasen", team: "SRH", emoji: "💥" },
  { id: "pa",  name: "Pat Cummins",      team: "SRH", emoji: "⚡" },
  { id: "tj",  name: "Travis Head",      team: "SRH", emoji: "🔥" },
];

const BATTERS = [
  { id: "rv2", name: "Virat Kohli",      team: "RCB", emoji: "👑" },
  { id: "jb2", name: "Jos Buttler",      team: "RR",  emoji: "🏏" },
  { id: "rs2", name: "Shubman Gill",     team: "GT",  emoji: "🌟" },
  { id: "kl2", name: "KL Rahul",         team: "DC",  emoji: "🎯" },
  { id: "tj2", name: "Travis Head",      team: "SRH", emoji: "🔥" },
  { id: "sk",  name: "Sanju Samson",     team: "RR",  emoji: "😤" },
  { id: "sr2", name: "Suryakumar",       team: "MI",  emoji: "🌤️" },
  { id: "hc2", name: "H. Klaasen",       team: "SRH", emoji: "💥" },
  { id: "ab",  name: "Abhishek Sharma",  team: "SRH", emoji: "⚡" },
  { id: "dy",  name: "Devdutt Padikkal", team: "RR",  emoji: "🌸" },
];

const BOWLERS = [
  { id: "pa2", name: "Pat Cummins",       team: "SRH",  emoji: "⚡" },
  { id: "jb3", name: "Jasprit Bumrah",    team: "MI",   emoji: "🎯" },
  { id: "yu",  name: "Yuzvendra Chahal",  team: "RR",   emoji: "🕸️" },
  { id: "rj",  name: "Rashid Khan",       team: "GT",   emoji: "🌀" },
  { id: "ma",  name: "Mohammed Shami",    team: "GT",   emoji: "🔥" },
  { id: "ts",  name: "T. Natarajan",      team: "SRH",  emoji: "🎳" },
  { id: "az",  name: "Arshdeep Singh",    team: "PBKS", emoji: "💪" },
  { id: "mb",  name: "Mitchell Starc",    team: "KKR",  emoji: "⚡" },
  { id: "hb",  name: "Harshal Patel",     team: "PBKS", emoji: "🎯" },
  { id: "ar",  name: "Axar Patel",        team: "DC",   emoji: "🔄" },
];

// ─── STATE ────────────────────────────────────
let picks       = { team: null, mvp: null, orange: null, purple: null };
let predictions = [];   // live from Firebase
let predsRef    = null; // Firebase DB reference

// ─── FIREBASE INIT ────────────────────────────
async function initFirebase() {
  const { initializeApp } = await import(
    "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js"
  );
  const { getDatabase, ref, onValue, query, orderByChild } = await import(
    "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js"
  );

  const app = initializeApp(FIREBASE_CONFIG);
  const db  = getDatabase(app);
  predsRef  = ref(db, "ipl2025predictions");

  // 🔴 Real-time listener — all GC members see updates instantly
  const q = query(predsRef, orderByChild("timestamp"));
  onValue(q, (snapshot) => {
    predictions = [];
    snapshot.forEach((child) => {
      predictions.push({ _key: child.key, ...child.val() });
    });
    refreshLeaderboard();
    updateHeroStats();
  });
}

// ─── INIT ─────────────────────────────────────
document.addEventListener("DOMContentLoaded", async () => {
  renderTeamGrid();
  renderPlayerGrid("mvpGrid",    MVP_PLAYERS, "mvp");
  renderPlayerGrid("orangeGrid", BATTERS,     "orange");
  renderPlayerGrid("purpleGrid", BOWLERS,     "purple");
  setDaysLeft();

  document.getElementById("predTableBody").innerHTML =
    `<tr class="empty-row"><td colspan="6">⏳ Connecting to live database...</td></tr>`;

  try {
    await initFirebase();
  } catch (err) {
    console.error("Firebase init error:", err);
    document.getElementById("predTableBody").innerHTML =
      `<tr class="empty-row"><td colspan="6">⚠️ Firebase not configured. Paste your config in script.js</td></tr>`;
    showToast("Paste your Firebase config in script.js first!", true);
  }
});

// ─── SCROLL ───────────────────────────────────
function scrollToForm() {
  document.getElementById("predForm").scrollIntoView({ behavior: "smooth", block: "start" });
}

// ─── DAYS LEFT ────────────────────────────────
function setDaysLeft() {
  const deadline = new Date("2025-03-29");
  const today    = new Date();
  const diff     = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
  document.getElementById("daysLeft").textContent = diff > 0 ? diff : "0";
}

// ─── RENDER TEAM GRID ─────────────────────────
function renderTeamGrid() {
  const grid = document.getElementById("teamGrid");
  grid.innerHTML = "";
  IPL_TEAMS.forEach(team => {
    const card = document.createElement("div");
    card.className = "team-card";
    card.innerHTML = `<div class="team-logo">${team.logo}</div><div class="team-name">${team.short}</div>`;
    card.addEventListener("click", () => {
      document.querySelectorAll("#teamGrid .team-card").forEach(c => c.classList.remove("selected"));
      card.classList.add("selected");
      picks.team = team.id;
      pulseCard(card);
    });
    grid.appendChild(card);
  });
}

// ─── RENDER PLAYER GRID ───────────────────────
function renderPlayerGrid(containerId, players, type) {
  const grid = document.getElementById(containerId);
  grid.innerHTML = "";
  players.forEach(p => {
    const card = document.createElement("div");
    card.className = "player-card";
    card.innerHTML = `
      <div class="player-emoji">${p.emoji}</div>
      <div class="player-name">${p.name}</div>
      <div class="player-team">${p.team}</div>
    `;
    card.addEventListener("click", () => {
      document.querySelectorAll(`#${containerId} .player-card`).forEach(c =>
        c.classList.remove("selected-mvp", "selected-orange", "selected-purple")
      );
      card.classList.add(`selected-${type}`);
      picks[type] = p.id;
      pulseCard(card);
    });
    grid.appendChild(card);
  });
}

// ─── PULSE ────────────────────────────────────
function pulseCard(el) {
  el.style.transform = "scale(1.06) translateY(-4px)";
  setTimeout(() => { el.style.transform = ""; }, 200);
}

// ─── SUBMIT ───────────────────────────────────
async function submitPrediction() {
  if (!predsRef) { showToast("Database not ready. Check Firebase config!", true); return; }

  const nameEl = document.getElementById("userName");
  const name   = nameEl.value.trim();
  const msg    = document.getElementById("formMsg");

  // Validation
  if (!name)         { showToast("Enter your name! 👤", true); nameEl.focus(); return; }
  if (!picks.team)   { showToast("Pick a champion team! 🏆", true); return; }
  if (!picks.mvp)    { showToast("Pick your MVP! ⭐", true); return; }
  if (!picks.orange) { showToast("Pick an Orange Cap holder! 🟠", true); return; }
  if (!picks.purple) { showToast("Pick a Purple Cap holder! 🟣", true); return; }

  // Duplicate check (live DB data)
  const duplicate = predictions.some(
    p => p.name.toLowerCase() === name.toLowerCase()
  );
  if (duplicate) {
    showToast(`${name}'s prediction is already locked! 🔒`, true);
    return;
  }

  // Disable button
  const btn = document.getElementById("submitBtn");
  btn.disabled = true;
  btn.innerHTML = "⏳ Locking in...";

  // Build entry
  const team   = IPL_TEAMS.find(t => t.id === picks.team);
  const mvp    = MVP_PLAYERS.find(p => p.id === picks.mvp);
  const orange = BATTERS.find(p => p.id === picks.orange);
  const purple = BOWLERS.find(p => p.id === picks.purple);

  const entry = {
    name,
    team:      team.short,
    teamFull:  team.name,
    mvp:       mvp.name,
    orange:    orange.name,
    purple:    purple.name,
    locked:    true,
    timestamp: Date.now(),
  };

  try {
    const { push } = await import(
      "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js"
    );
    await push(predsRef, entry);

    showToast(`🎉 ${name}'s prediction locked in for everyone!`);
    msg.textContent = "✅ Locked! Your picks are saved and visible to the whole GC.";

    // Reset
    setTimeout(() => {
      picks = { team: null, mvp: null, orange: null, purple: null };
      nameEl.value    = "";
      msg.textContent = "";
      document.querySelectorAll(".team-card").forEach(c => c.classList.remove("selected"));
      document.querySelectorAll(".player-card").forEach(c =>
        c.classList.remove("selected-mvp","selected-orange","selected-purple")
      );
      btn.disabled = false;
      btn.innerHTML = "Submit Prediction 🚀";
    }, 1500);

    document.getElementById("leaderboard").scrollIntoView({ behavior: "smooth" });

  } catch (err) {
    console.error("Push error:", err);
    showToast("Save failed. Check internet / Firebase rules.", true);
    btn.disabled = false;
    btn.innerHTML = "Submit Prediction 🚀";
  }
}

// ─── LEADERBOARD ─────────────────────────────
function refreshLeaderboard() {
  const tbody = document.getElementById("predTableBody");
  tbody.innerHTML = "";

  if (predictions.length === 0) {
    tbody.innerHTML = `<tr class="empty-row"><td colspan="6">No predictions yet — be the first! 🏏</td></tr>`;
    return;
  }

  const sorted = [...predictions].sort((a, b) => a.timestamp - b.timestamp);
  sorted.forEach((p, i) => {
    const tr = document.createElement("tr");
    tr.style.animation = `fadeInUp 0.4s ease ${i * 0.04}s both`;
    tr.innerHTML = `
      <td>${i + 1}</td>
      <td class="name-cell">${escHtml(p.name)} <span class="lock-badge">🔒</span></td>
      <td>${escHtml(p.team)}</td>
      <td>${escHtml(p.mvp)}</td>
      <td>${escHtml(p.orange)}</td>
      <td>${escHtml(p.purple)}</td>
    `;
    tbody.appendChild(tr);
  });

  renderSummary();
}

function renderSummary() {
  if (!predictions.length) return;
  document.getElementById("favTeam").textContent   = getMostPicked("team");
  document.getElementById("favMVP").textContent    = getMostPicked("mvp");
  document.getElementById("favOrange").textContent = getMostPicked("orange");
  document.getElementById("favPurple").textContent = getMostPicked("purple");
}

function getMostPicked(field) {
  const freq = {};
  predictions.forEach(p => { freq[p[field]] = (freq[p[field]] || 0) + 1; });
  return Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";
}

function updateHeroStats() {
  document.getElementById("totalPreds").textContent = predictions.length;
  document.getElementById("topTeam").textContent    =
    predictions.length > 0 ? getMostPicked("team") : "—";
}

// ─── TOAST ────────────────────────────────────
function showToast(msg, isError = false) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.className   = "toast" + (isError ? " error" : "");
  void toast.offsetWidth;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3500);
}

// ─── UTILS ────────────────────────────────────
function escHtml(str) {
  return String(str)
    .replace(/&/g,"&amp;").replace(/</g,"&lt;")
    .replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}
