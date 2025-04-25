 // === Kamea Tables ===
// These define the planetary magic squares used to encode the sigils.
const kameaTables = {
    sun: [6, 32, 3, 34, 35, 1, 7, 11, 27, 28, 8, 30, 31, 26, 9, 10, 17, 21, 23, 14, 15, 16, 13, 12, 19, 25, 18, 5, 4, 36, 29, 22, 20, 33, 24, 2],
    moon: [37, 78, 29, 70, 21, 62, 13, 54, 5, 6, 38, 79, 30, 71, 22, 63, 14, 46, 47, 7, 39, 80, 31, 72, 23, 64, 15, 55, 56, 48, 8, 40, 81, 32, 73, 24, 65, 16, 6, 57, 49, 9, 41, 1, 33, 74, 25, 66, 17, 58, 50, 10, 42, 2, 34, 75, 26, 67, 18, 59, 51, 11, 43, 3, 35, 76, 27, 68, 19, 60, 52, 12, 44, 4, 36, 77, 28, 69, 20, 61, 53],
    mars: [11, 24, 7, 20, 3, 4, 12, 25, 8, 16, 17, 5, 13, 21, 9, 10, 18, 1, 14, 22, 23, 6, 19, 2, 15],
    venus: [22, 47, 16, 41, 10, 35, 4, 5, 23, 48, 17, 42, 11, 29, 6, 34, 13, 38, 19, 27, 8, 40, 15, 37, 21, 30, 1, 46, 25, 32, 3, 45, 24, 31, 2, 44, 26, 33, 7, 43, 14, 36, 9, 39, 12, 28, 20, 18, 49],
    mercury: [64, 2, 3, 61, 60, 6, 7, 57, 56, 10, 11, 53, 52, 14, 15, 49, 48, 18, 19, 45, 44, 22, 23, 41, 40, 26, 27, 37, 36, 30, 31, 33, 32, 34, 35, 29, 28, 38, 39, 25, 24, 42, 43, 21, 20, 46, 47, 17, 16, 50, 51, 13, 12, 54, 55, 9, 8, 58, 59, 5, 4, 62, 63, 1],
    jupiter: [4, 14, 15, 1, 9, 7, 6, 12, 5, 11, 10, 8, 16, 2, 3, 13],
    saturn: [4, 9, 2, 3, 5, 7, 8, 1, 6]
  };
  
  // === Utilities ===
  
  // Converts a character (A-Z) into a number (1–26)
  function mapCharToNumber(char) {
    const alpha = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    return alpha.indexOf(char.toUpperCase()) + 1;
  }
  
  // Converts a phrase into kamea-mapped numbers using hybrid logic
  function hybridMap(phrase, kameaKey) {
    const kamea = kameaTables[kameaKey];
    const kameaSize = kamea.length;
    const lettersOnly = phrase.replace(/[^a-zA-Z]/g, "");
    return Array.from(lettersOnly).map((char, i) => {
      const base = mapCharToNumber(char);
      const spreadFactor = Math.floor(kameaSize / 26) + 1;
      const hybridIndex = (base + i * spreadFactor) % kameaSize;
      return kamea[hybridIndex];
    });
  }
  
  // === SVG Generator ===
  
  // Generates a small SVG element based on kamea path for preview
  function generateMiniSVG(numbers, kameaKey) {
    const kamea = kameaTables[kameaKey];
    const size = Math.sqrt(kamea.length);
    const cellSize = 150 / size;
  
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", 150);
    svg.setAttribute("height", 150);
  
    const points = numbers.map(n => {
      const index = kamea.indexOf(n);
      const row = Math.floor(index / size);
      const col = index % size;
      const x = col * cellSize + cellSize / 2;
      const y = row * cellSize + cellSize / 2;
      return `${x},${y}`;
    });
  
    const path = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
    path.setAttribute("points", points.join(" "));
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", "black");
    path.setAttribute("stroke-width", "2");
    svg.appendChild(path);
    return svg;
  }
  
  // === Dictionary ===
  
  // Save entry to localStorage and update the display
  function saveToDictionary(entry) {
    const dictionary = JSON.parse(localStorage.getItem("sigilDictionary")) || [];
    dictionary.push(entry);
    localStorage.setItem("sigilDictionary", JSON.stringify(dictionary));
    updateDictionaryDisplay();
  }
  
  // Display all saved sigils from localStorage
  function updateDictionaryDisplay() {
    const container = document.getElementById("dictionaryEntries");
    container.innerHTML = "";
    const dictionary = JSON.parse(localStorage.getItem("sigilDictionary")) || [];
  
    if (dictionary.length === 0) {
      container.innerHTML = "<p class='text-muted'>No sigils saved yet.</p>";
      return;
    }
  
    dictionary.slice().reverse().forEach((entry, displayIndex) => {
        const actualIndex = dictionary.length - 1 - displayIndex; // Since we're reversing
      
        const card = document.createElement("div");
        card.className = "card mb-3";
      
        const svgPreview = generateMiniSVG(entry.numbers, entry.kamea);
        svgPreview.style.marginBottom = "1rem";
      
        card.innerHTML = `
          <div class="card-body">
            <h5 class="card-header">${entry.kamea.toUpperCase()} – ${entry.phrase}</h5>
            <div class="img"></div>
            <div class="inline">
              <p class="card-text mb-1"><strong>Mode:</strong> ${entry.mode}</p>
              <p class="card-text"><strong>Numbers:</strong> ${entry.numbers.join(", ")}</p>
              <p class="card-text"><small class="text-muted">${new Date(entry.timestamp).toLocaleString()}</small></p>
              <button class="btn btn-sm btn-outline-primary mt-2 me-2" onclick="openEditModal(${actualIndex})">Edit</button>
              <button class="btn btn-sm btn-outline-danger mt-2" onclick="deleteFromDictionary(${actualIndex})">Delete</button>

              </div>
          </div>
        `;
      
        card.querySelector(".img").prepend(svgPreview);
        container.appendChild(card);
      });
    }
      
  
  // === Delete Sigil from Dictionary ===

  function deleteFromDictionary(indexToRemove) {
    const dictionary = JSON.parse(localStorage.getItem("sigilDictionary")) || [];
    dictionary.splice(indexToRemove, 1); // Remove by index
    localStorage.setItem("sigilDictionary", JSON.stringify(dictionary));
    updateDictionaryDisplay();
  }
  
  // === Edit Sigil in Dictionary ===

  function openEditModal(index) {
    const dictionary = JSON.parse(localStorage.getItem("sigilDictionary")) || [];
    const entry = dictionary[index];
  
    document.getElementById("editIndex").value = index;
    document.getElementById("editPhrase").value = entry.phrase;
  
    const modal = new bootstrap.Modal(document.getElementById("editModal"));
    modal.show();
  }
  
  function saveEditedEntry() {
    const dictionary = JSON.parse(localStorage.getItem("sigilDictionary")) || [];
    const index = parseInt(document.getElementById("editIndex").value, 10);
    const newPhrase = document.getElementById("editPhrase").value;
  
    // Recalculate sigil with updated phrase
    const updatedNumbers = hybridMap(newPhrase, dictionary[index].kamea);
  
    dictionary[index].phrase = newPhrase;
    dictionary[index].numbers = updatedNumbers;
    dictionary[index].timestamp = new Date().toISOString();
  
    localStorage.setItem("sigilDictionary", JSON.stringify(dictionary));
    updateDictionaryDisplay();
  
    const modal = bootstrap.Modal.getInstance(document.getElementById("editModal"));
    modal.hide();
  }
  
  // === Drawing + Buttons ===
  
  function drawSigil(groups, kameaKey, words, mode) {
    const kamea = kameaTables[kameaKey];
    const gridSize = Math.sqrt(kamea.length);
    const cellSize = 300 / gridSize;
    const container = document.getElementById("svgContainer");
    container.innerHTML = "";
    const showGrid = document.getElementById("showGrid").checked;
  
    groups.forEach((numbers, i) => {
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("width", "300");
      svg.setAttribute("height", "300");
      svg.classList.add("border", "border-secondary");
  
      // Draw background grid with numbers
      if (showGrid) {
        for (let row = 0; row < gridSize; row++) {
          for (let col = 0; col < gridSize; col++) {
            const index = row * gridSize + col;
            const number = kamea[index];
            const x = col * cellSize;
            const y = row * cellSize;
  
            const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            rect.setAttribute("x", x);
            rect.setAttribute("y", y);
            rect.setAttribute("width", cellSize);
            rect.setAttribute("height", cellSize);
            rect.setAttribute("fill", "none");
            rect.setAttribute("stroke", "#ccc");
            svg.appendChild(rect);
  
            const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
            text.setAttribute("x", x + cellSize / 2);
            text.setAttribute("y", y + cellSize / 2);
            text.setAttribute("text-anchor", "middle");
            text.setAttribute("dominant-baseline", "middle");
            text.setAttribute("font-size", `${cellSize * 0.5}`);
            text.setAttribute("fill", "#bbb");
            text.textContent = number;
            svg.appendChild(text);
          }
        }
      }
  
      // Draw sigil path
      const points = numbers.map(n => {
        const index = kamea.indexOf(n);
        const row = Math.floor(index / gridSize);
        const col = index % gridSize;
        const x = col * cellSize + cellSize / 2;
        const y = row * cellSize + cellSize / 2;
        return `${x},${y}`;
      });
  
      const path = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
      path.setAttribute("points", points.join(" "));
      path.setAttribute("fill", "none");
      path.setAttribute("stroke", "black");
      path.setAttribute("stroke-width", "2");
      svg.appendChild(path);
  
      // Create wrapper div
      const wrapper = document.createElement("div");
      wrapper.appendChild(svg);
  
      const word = words[i].replace(/\s+/g, "-").toLowerCase();
  
      // Download button
      const downloadBtn = document.createElement("button");
      downloadBtn.className = "btn btn-sm btn-outline-primary mt-2 me-2";
      downloadBtn.textContent = "Download PNG";
      downloadBtn.onclick = () => downloadSVGAsPNG(svg, `${kameaKey}-${word}-sigil.png`);
      wrapper.appendChild(downloadBtn);
  
      // Save to Dictionary button with confirmation
      const saveBtn = document.createElement("button");
      saveBtn.className = "btn btn-sm btn-outline-secondary mt-2";
      saveBtn.textContent = "Save to Dictionary";
      saveBtn.onclick = () => {
        saveToDictionary({
          phrase: words[i],
          kamea: kameaKey,
          mode: mode,
          numbers: numbers,
          timestamp: new Date().toISOString()
        });
  
        saveBtn.classList.remove("btn-outline-secondary");
        saveBtn.classList.add("btn-success");
        saveBtn.textContent = "✓ Saved!";
        setTimeout(() => {
          saveBtn.classList.add("btn-outline-secondary");
          saveBtn.classList.remove("btn-success");
          saveBtn.textContent = "Save to Dictionary";
        }, 1200);
      };
      wrapper.appendChild(saveBtn);
  
      container.appendChild(wrapper);
    });
  }
  
  // === Sigil Generation Trigger ===
  
  function generateSigil() {
    const phrase = document.getElementById('phraseInput').value;
    const kameaKey = document.getElementById('kameaSize').value;
    const mode = document.getElementById('modeSelect').value;
    const words = mode === 'phrase' ? [phrase] : phrase.split(/\s+/).filter(Boolean);
    const groups = words.map(word => hybridMap(word, kameaKey));
  
    // Show numbers
    document.getElementById('result').innerHTML = groups.map((g, i) =>
      `<div class='mb-2'><strong>${words[i]}</strong>: ${g.map(n =>
        `<span class='badge bg-secondary mx-1'>${n}</span>`).join('')}</div>`).join("");
  
    document.getElementById('resultSection').style.display = 'block';
    drawSigil(groups, kameaKey, words, mode);
  }
  
  // === Init ===
  document.addEventListener('DOMContentLoaded', () => {
    ['phraseInput', 'modeSelect', 'showGrid', 'kameaSize'].forEach(id =>
      document.getElementById(id).addEventListener('input', generateSigil)
    );
    updateDictionaryDisplay();
    document.getElementById("saveEditBtn").addEventListener("click", saveEditedEntry);

  });
  