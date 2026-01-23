// PWA: Service Worker setup
if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      await navigator.serviceWorker.register("/sw.js");
      console.log("Service worker registered");
    } catch (err) {
      console.error("Service worker registration failed:", err);
    }
  });
}


document.addEventListener("DOMContentLoaded", () => {

  // -------------------------
  // 1. Inject navbar safely
  // -------------------------
  const navbarContainer = document.getElementById("navbar");
  if (navbarContainer) {
    navbarContainer.innerHTML = `
      <nav class="navbar">
        <div class="logo">Nishal's Journal</div>
        <ul class="nav-links">
          <li><a href="/index.html">Home</a></li>
          <li><a href="/journal.html">Journal</a></li>
          <li><a href="/projects.html">Projects</a></li>
          <li><a href="/about.html">About</a></li>
          <li><a href="/dashboard.html">Dashboard</a></li>
          <li><button id="themeToggle" title="Toggle theme">🌗</button></li>
        </ul>
      </nav>
    `;

    // highlight active page
    const currentPage = "/" + location.pathname.split("/").pop();
    navbarContainer.querySelectorAll("a").forEach(link => {
      if (link.getAttribute("href") === currentPage) link.classList.add("active");
    });
  }

  /* 2. Load saved theme from localStorage (Week 4 Storage API) */
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    document.body.classList.add("dark");
  }

  /* 3. Theme toggle + save to localStorage */
  document.addEventListener("click", (e) => {
    if (e.target.id === "themeToggle") {
      document.body.classList.toggle("dark");
      // save choice
      if (document.body.classList.contains("dark")) {
        localStorage.setItem("theme", "dark");
      } else {
        localStorage.setItem("theme", "light");
      }
    }
  });

  /* 4. Show today’s date on homepage */
  const dateEl = document.getElementById("dateDisplay");
  if (dateEl) {
    const today = new Date();
    dateEl.textContent = `Today is ${today.toDateString()}`;
  }

  /* 5. Collapsible journal entries (Week 3) */
  const collapsibleTitles = document.querySelectorAll(".collapsible h2");
  collapsibleTitles.forEach(title => {
    title.addEventListener("click", () => {
      const content = title.nextElementSibling;
      content.classList.toggle("hidden");
    });
  });

  /* 6. Week 4: journal form + localStorage */
  const journalForm = document.getElementById("journalForm");
  const entriesList = document.getElementById("entriesList");

  // helper: render entries from storage
  function renderEntries() {
    if (!entriesList) return;
    entriesList.innerHTML = "";
    const saved = JSON.parse(localStorage.getItem("journalEntries") || "[]");
    saved.forEach((entry, index) => {
      const div = document.createElement("div");
      div.className = "saved-entry card";
      div.innerHTML = `
        <p>${entry}</p>
        <button data-copy="${index}" class="btn small-btn">Copy</button>
      `;
      entriesList.appendChild(div);
    });
  }

  // initial render
  renderEntries();

  if (journalForm) {
    journalForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const text = document.getElementById("journalText").value.trim();
        const mood = document.getElementById("journalMood").value;

        if (text.length < 5) {
            alert("Please write a bit more for your journal entry.");
            return;
        }

        // Optional: set week & title dynamically
        const week = 0; // or get from a form input
        const title = text.split(".")[0].slice(0, 30); // first sentence as title

        const payload = {
            reflection: text,
            mood: mood,
            week: week,
            title: title,
            name: "Nishal"
        };

        try {
            const response = await fetch("/add_reflection", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error("Failed to save reflection");

            const saved = await response.json();
            alert("Journal entry saved to backend ✅");
            document.getElementById("journalText").value = "";
            document.getElementById("journalMood").value = "";
            
            // Refresh reflections list
            if (window.allReflections) loadJsonReflections();

        } catch (err) {
            console.error(err);
            alert("Error saving entry. See console.");
        }
    });
}


  /* 7. Browser API: copy to clipboard */
  document.addEventListener("click", async (e) => {
    if (e.target.matches("[data-copy]")) {
      const index = e.target.getAttribute("data-copy");
      const saved = JSON.parse(localStorage.getItem("journalEntries") || "[]");
      const textToCopy = saved[index];
      if (navigator.clipboard && textToCopy) {
        await navigator.clipboard.writeText(textToCopy);
        alert("Entry copied to clipboard!");
      }
    }
  });
});
// ========================
// Task 2: JSON reflections
// ========================

// 1. Fetch the reflections from reflections.json
async function loadJsonReflections() {
  try{
   // if reflections.json is in thee same folder as journal.html:
    const response = await fetch("/reflections");

     // // If it's inside a "data" folder instead, change to:
    // const response = await fetch("data/reflections.json");

    const reflections = await response.json();

    // store globally for filtering + export
    window.allReflections = reflections;

    renderJsonReflections(reflections);
    updateJsonCount(reflections);
  } catch (error) {
    console.error("Error loading reflections.json:", error);
  }
}

// 2. Render the reflections inside #jsonEntries
function renderJsonReflections(reflections) {
  const container = document.getElementById("jsonEntries");
  if (!container) return; // not on this page

  container.innerHTML = "";

  if (reflections.length === 0) {
    container.innerHTML = "<p>No reflections found in JSON.</p>";
    return;
  }
  reflections.forEach(entry => {
    const card = document.createElement("article");
    card.classList.add("journal-card");

    card.innerHTML = `
        <h3>${entry.title}</h3>
        <p><strong>Date:</strong> ${entry.date}</p>
        <p><strong>Mood:</strong> ${entry.mood}</p>
        <p>${entry.reflection}</p>
      `;

    container.appendChild(card);
});

}

 // 3. Update how many entries are shown
function updateJsonCount(reflections) {
    const countEl = document.getElementById("entryCount");
    if (!countEl) return;
    countEl.textContent = `Total JSON reflections: ${reflections.length}`;
}

// 4. Extra feature: filter JSON reflections by week
function setupWeekFilter() {
    const select = document.getElementById("weekFilter");
    if (!select) return;

    select.addEventListener("change", () => {
      if (!window.allReflections) return;

      const value = select.value;

      if (value === "all") {
          renderJsonReflections(window.allReflections);
          updateJsonCount(window.allReflections);
      } else {
          const weekNumber = parseInt(value);
          const filtered = window.allReflections.filter(
           (entry) => entry.week === weekNumber
          );
          renderJsonReflections(filtered);
          updateJsonCount(filtered);
      }
    });
}
// 5. Extra feature: export current JSON reflections as a file
function setupExportButton() {
    const btn = document.getElementById("exportJsonBtn");
    if (!btn) return;

    btn.addEventListener("click", () => {
        if (!window.allReflections) {
            alert("No reflections loaded yet.");
            return;
        }

        const blob = new Blob(
            [JSON.stringify(window.allReflections, null, 2)],
            { type: "application/json" }
        );
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "reflections.json";
        document.body.appendChild(a);
        a.click();

        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });
}


// 6. Run JSON features when the page loads
document.addEventListener("DOMContentLoaded", () => {
    // Only run on journal page (where jsonEntries exists)
    if (document.getElementById("jsonEntries")) {
        loadJsonReflections();
        setupWeekFilter();
       setupExportButton();
    }
  });


  // offline overlay
  // ----------------- Offline overlay -----------------
const offlineOverlay = document.createElement("div");
offlineOverlay.id = "offlineOverlay";
offlineOverlay.className = "offline-overlay hidden";
offlineOverlay.innerHTML = "⚠ You are offline";
document.body.appendChild(offlineOverlay);

function updateOnlineStatus() {
  if (navigator.onLine) {
    offlineOverlay.classList.remove("visible");
    offlineOverlay.classList.add("hidden");
  } else {
    offlineOverlay.classList.remove("hidden");
    offlineOverlay.classList.add("visible");
  }
}

// Initial check
updateOnlineStatus();

// Listen for changes
window.addEventListener("online", updateOnlineStatus);
window.addEventListener("offline", updateOnlineStatus);


let deferredPrompt;

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  const installBtn = document.createElement("button");
  installBtn.textContent = "Install App";
  installBtn.className = "install-btn";
  document.body.appendChild(installBtn);

  installBtn.addEventListener("click", async () => {
    deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;
    console.log(choiceResult.outcome);
    deferredPrompt = null;
    installBtn.remove();
  });
});
