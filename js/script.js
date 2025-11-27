document.addEventListener("DOMContentLoaded", () => {
  /* 1. Inject navbar on every page */
  const navbarHTML = `
    <nav class="navbar">
      <div class="logo">Nishal's Journal</div>
      <ul class="nav-links">
        <li><a href="index.html">Home</a></li>
        <li><a href="journal.html">Journal</a></li>
        <li><a href="projects.html">Projects</a></li>
        <li><a href="about.html">About</a></li>
        <li><button id="themeToggle" title="Toggle theme">🌗</button></li>
      </ul>
    </nav>
  `;
  const navbarContainer = document.getElementById("navbar");
  if (navbarContainer) {
    navbarContainer.innerHTML = navbarHTML;

    // highlight active link
    const links = navbarContainer.querySelectorAll("a");
    const currentPage = location.pathname.split("/").pop();
    links.forEach(link => {
      if (link.getAttribute("href") === currentPage) {
        link.classList.add("active");
      }
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
    journalForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const textarea = document.getElementById("journalText");
      const text = textarea.value.trim();
      if (text.length < 5) {
        alert("Please write a bit more for your journal entry.");
        return;
      }
      const saved = JSON.parse(localStorage.getItem("journalEntries") || "[]");
      saved.unshift(text); // newest first
      localStorage.setItem("journalEntries", JSON.stringify(saved));
      textarea.value = "";
      renderEntries();
      alert("Journal entry saved ✅");
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
    const response = await fetch("https://nishalchy2020.pythonanywhere.com/api/reflections");
    
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
            <h3>Week ${entry.week}: ${entry.title}</h3>
            <p><strong>Date:</strong> ${entry.date}</p>
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
