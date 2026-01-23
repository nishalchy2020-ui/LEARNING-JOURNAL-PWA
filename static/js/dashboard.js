document.addEventListener("DOMContentLoaded", () => {
  fetchReflections();
});

async function fetchReflections() {
  try {
    const response = await fetch("/reflections");
    const reflections = await response.json();

    updateEntryCount(reflections);
    renderMoodChart(reflections);
  } catch (error) {
    console.error("Failed to load reflections:", error);
    document.getElementById("entryCount").textContent =
      "Offline or no data available";
  }
}

function updateEntryCount(reflections) {
  const countElement = document.getElementById("entryCount");
  countElement.textContent = reflections.length;
}

function renderMoodChart(reflections) {
  const moodCounts = {};

  reflections.forEach(entry => {
    const mood = entry.mood || "Not specified";
    moodCounts[mood] = (moodCounts[mood] || 0) + 1;
  });

  const labels = Object.keys(moodCounts);
  const data = Object.values(moodCounts);

  const ctx = document.getElementById("moodChart").getContext("2d");

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [{
        label: "Mood Count",
        data: data
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1
          }
        }
      }
    }
  });
}
