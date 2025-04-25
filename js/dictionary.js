// === DICTIONARY MANAGEMENT ===

function generateMiniSVG(numbers, kameaKey) {
  if (!kameaTables[kameaKey]) {
    console.warn("Invalid kameaKey in generateMiniSVG:", kameaKey);
    return document.createElementNS("http://www.w3.org/2000/svg", "svg");
  }
  const kamea = kameaTables[kameaKey];
  const size = Math.sqrt(kamea.length);
  const cellSize = 150 / size;
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", 150);
  svg.setAttribute("height", 150);
  const points = numbers.map(n => {
    const idx = kamea.indexOf(n);
    const row = Math.floor(idx / size);
    const col = idx % size;
    return `${col * cellSize + cellSize / 2},${row * cellSize + cellSize / 2}`;
  });
  const path = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
  path.setAttribute("points", points.join(" "));
  path.setAttribute("fill", "none");
  path.setAttribute("stroke", "black");
  path.setAttribute("stroke-width", "2");
  svg.appendChild(path);
  return svg;
}

function saveToDictionary(entry) {
  const dictionary = JSON.parse(localStorage.getItem("sigilDictionary")) || [];
  dictionary.push(entry);
  localStorage.setItem("sigilDictionary", JSON.stringify(dictionary));

  const user = firebase.auth().currentUser;
  if (user) {
    saveUserDictionary(user.uid, dictionary);
  }

  updateDictionaryDisplay();
}

function deleteFromDictionary(index) {
  const dict = JSON.parse(localStorage.getItem("sigilDictionary")) || [];
  dict.splice(index, 1);
  localStorage.setItem("sigilDictionary", JSON.stringify(dict));

  const user = firebase.auth().currentUser;
  if (user) {
    saveUserDictionary(user.uid, dict);
  }

  updateDictionaryDisplay();
}

function openEditModal(index) {
  const dict = JSON.parse(localStorage.getItem("sigilDictionary")) || [];
  const entry = dict[index];

  document.getElementById("editIndex").value = index;
  document.getElementById("editPhrase").value = entry.phrase;
  document.getElementById("editTags").value = entry.tags?.join(", ") || "";

  new bootstrap.Modal(document.getElementById("editModal")).show();
}

function saveEditedEntry() {
  const index = parseInt(document.getElementById("editIndex").value, 10);
  const newPhrase = document.getElementById("editPhrase").value.trim();
  const newTags = document.getElementById("editTags").value.split(",").map(t => t.trim()).filter(Boolean);

  const dict = JSON.parse(localStorage.getItem("sigilDictionary")) || [];
  if (!newPhrase || !dict[index]) return;

  dict[index].phrase = newPhrase;
  dict[index].tags = newTags;
  dict[index].numbers = hybridMap(newPhrase, dict[index].kamea);
  dict[index].timestamp = new Date().toISOString();

  localStorage.setItem("sigilDictionary", JSON.stringify(dict));

  const user = firebase.auth().currentUser;
  if (user) {
    saveUserDictionary(user.uid, dict);
  }

  updateDictionaryDisplay();
  bootstrap.Modal.getInstance(document.getElementById("editModal")).hide();
}

function updateDictionaryDisplay() {
  const container = document.getElementById("dictionaryEntries");
  container.innerHTML = "";

  const searchTerm = document.getElementById("searchInput")?.value.toLowerCase() || "";
  const planetFilter = document.getElementById("planetFilter")?.value || "";
  const dictionary = JSON.parse(localStorage.getItem("sigilDictionary")) || [];

  if (dictionary.length === 0) {
    container.innerHTML = "<p class='text-muted'>No sigils saved yet.</p>";
    return;
  }

  const wrapper = document.createElement("div");
  wrapper.className = "d-flex flex-wrap gap-3";

  dictionary.slice().reverse().forEach((entry, displayIndex) => {
    const actualIndex = dictionary.length - 1 - displayIndex;

    const matchesSearch =
      entry.phrase.toLowerCase().includes(searchTerm) ||
      (entry.tags && entry.tags.some(tag => tag.toLowerCase().includes(searchTerm)));

    const matchesPlanet = !planetFilter || entry.kamea === planetFilter;
    if (!matchesSearch || !matchesPlanet) return;

    const card = document.createElement("div");
    card.className = "card";
    card.style.width = "18rem";

    const cardBody = document.createElement("div");
    cardBody.className = "card-body text-center";

    const svg = generateMiniSVG(entry.numbers, entry.kamea);
    svg.setAttribute("width", "150");
    svg.setAttribute("height", "150");
    svg.style.margin = "0 auto 1rem";

    const title = document.createElement("h5");
    title.className = "card-title";
    title.textContent = `${entry.kamea.toUpperCase()} – ${entry.phrase}`;

    const mode = document.createElement("p");
    mode.className = "card-text mb-1";
    mode.innerHTML = `<strong>Mode:</strong> ${entry.mode}`;

    const numbers = document.createElement("p");
    numbers.className = "card-text";
    numbers.innerHTML = `<strong>Numbers:</strong><br>${entry.numbers.join(", ")}`;

    const timestamp = document.createElement("p");
    timestamp.className = "card-text";
    timestamp.innerHTML = `<small class="text-muted">${new Date(entry.timestamp).toLocaleString()}</small>`;

    cardBody.appendChild(svg);
    cardBody.appendChild(title);
    cardBody.appendChild(mode);
    cardBody.appendChild(numbers);

    if (entry.tags?.length) {
      const tags = document.createElement("p");
      tags.className = "card-text";
      tags.innerHTML = `<strong>Tags:</strong> `;
      entry.tags.forEach(tag => {
        const badge = document.createElement("span");
        badge.className = "badge bg-secondary me-1";
        badge.textContent = tag;
        tags.appendChild(badge);
      });
      cardBody.appendChild(tags);
    }

    cardBody.appendChild(timestamp);

    const downloadBtn = document.createElement("button");
    downloadBtn.className = "btn btn-sm btn-outline-primary mt-2 me-2";
    downloadBtn.textContent = "Download PNG";
    downloadBtn.onclick = () => {
      const clone = generateMiniSVG(entry.numbers, entry.kamea);
      downloadSVGAsPNG(clone, `${entry.kamea}-${entry.phrase.replace(/\s+/g, "-")}-sigil.png`);
    };

    const editBtn = document.createElement("button");
    editBtn.className = "btn btn-sm btn-outline-secondary mt-2 me-2";
    editBtn.textContent = "Edit";
    editBtn.onclick = () => openEditModal(actualIndex);

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "btn btn-sm btn-outline-danger mt-2";
    deleteBtn.textContent = "Delete";
    deleteBtn.onclick = () => {
      if (confirm(`Delete sigil for "${entry.phrase}"?`)) {
        const all = JSON.parse(localStorage.getItem("sigilDictionary")) || [];
        all.splice(actualIndex, 1);
        localStorage.setItem("sigilDictionary", JSON.stringify(all));

        const user = firebase.auth().currentUser;
        if (user) {
          saveUserDictionary(user.uid, all);
        }

        updateDictionaryDisplay();
      }
    };

    cardBody.appendChild(downloadBtn);
    cardBody.appendChild(editBtn);
    cardBody.appendChild(deleteBtn);
    card.appendChild(cardBody);
    wrapper.appendChild(card);
  });

  container.appendChild(wrapper);
}

function resetDictionary() {
  if (confirm("Are you sure you want to delete all saved sigils? This cannot be undone.")) {
    localStorage.removeItem("sigilDictionary");

    const user = firebase.auth().currentUser;
    if (user) {
      saveUserDictionary(user.uid, []); // Clear Firestore
    }

    updateDictionaryDisplay();
  }
}

window.generateMiniSVG = generateMiniSVG;
window.saveToDictionary = saveToDictionary;
window.deleteFromDictionary = deleteFromDictionary;
window.openEditModal = openEditModal;
window.saveEditedEntry = saveEditedEntry;
window.updateDictionaryDisplay = updateDictionaryDisplay;
window.resetDictionary = resetDictionary;
