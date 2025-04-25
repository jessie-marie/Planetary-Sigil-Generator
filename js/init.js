document.addEventListener("DOMContentLoaded", () => {
  // === Planetary Hour + Theme Sync ===
  getCurrentPlanetaryHour(({ hourRuler, dayRuler }) => {
    document.body.setAttribute("data-theme", hourRuler);

    const dayLabel = document.getElementById("dayRuler");
    const hourLabel = document.getElementById("planetHourLabel");
    const timeLabel = document.getElementById("localTime");

    if (dayLabel) dayLabel.textContent = dayRuler.toUpperCase();
    if (hourLabel) hourLabel.textContent = hourRuler.toUpperCase();
    if (timeLabel) {
      const now = new Date();
      timeLabel.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    const dropdown = document.getElementById("kameaSize");
    if (dropdown) dropdown.value = hourRuler;

    generateSigil();
    updateDictionaryDisplay();
  });

  // === Input Event Listeners ===
  ['phraseInput', 'modeSelect', 'showGrid', 'kameaSize'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', generateSigil);
  });

  // === Save Edit Modal Button ===
  const saveEditBtn = document.getElementById("saveEditBtn");
  if (saveEditBtn) {
    saveEditBtn.addEventListener("click", saveEditedEntry);
  }

  // === Dark Mode Toggle ===
  const toggleBtn = document.getElementById("darkModeToggle");
  const savedMode = localStorage.getItem("darkMode");

  if (savedMode === "true") {
    document.body.classList.add("dark");
    if (toggleBtn) toggleBtn.textContent = "🌞 Light Mode";
  } else {
    if (toggleBtn) toggleBtn.textContent = "🌗 Dark Mode";
  }

  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      const isNowDark = document.body.classList.toggle("dark");
      localStorage.setItem("darkMode", isNowDark);
      toggleBtn.textContent = isNowDark ? "🌞 Light Mode" : "🌗 Dark Mode";
    });
  }
});
