function generateSigil() {
  const phrase = document.getElementById('phraseInput').value;
  const kameaKey = document.getElementById('kameaSize').value;
  const mode = document.getElementById('modeSelect').value;
  const words = mode === 'phrase' ? [phrase] : phrase.split(/\s+/).filter(Boolean);
  const groups = words.map(word => hybridMap(word, kameaKey));

  const resultSection = document.getElementById('resultSection');
  const result = document.getElementById('result');
  const validGroups = groups.filter(g => g && g.length > 0);

  // Apply planetary theme
  document.body.setAttribute("data-theme", kameaKey);

  if (!phrase.trim() || validGroups.length === 0) {
    resultSection.style.display = 'none';
    result.innerHTML = '';
    document.getElementById('svgContainer').innerHTML = '';
    return;
  }

  result.innerHTML = groups.map((g, i) =>
    `<div class='mb-2'><strong>${words[i]}</strong>: ${g.map(n =>
      `<span class='badge bg-secondary mx-1'>${n}</span>`).join('')}</div>`).join("");

  resultSection.style.display = 'block';
  drawSigil(groups, kameaKey, words, mode);
}

function drawSigil(groups, kameaKey, words, mode) {
  const kamea = kameaTables[kameaKey];
  const gridSize = Math.sqrt(kamea.length);
  const cellSize = 300 / gridSize;
  const container = document.getElementById("svgContainer");
  container.innerHTML = "";
  const showGrid = document.getElementById("showGrid").checked;

  groups.forEach((numbers, i) => {
    if (!numbers.length) return;

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "300");
    svg.setAttribute("height", "300");
    svg.classList.add("border", "border-secondary");

    // Draw grid + numbers
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
    path.setAttribute("stroke", "var(--accent)");
    path.setAttribute("stroke-width", "2");
    svg.appendChild(path);

    const wrapper = document.createElement("div");
    wrapper.appendChild(svg);

    const word = words[i].replace(/\s+/g, "-").toLowerCase();

    // Download button
    const downloadBtn = document.createElement("button");
    downloadBtn.className = "btn btn-sm btn-outline-primary mt-2 me-2 fade-in";
    downloadBtn.textContent = "Download PNG";
    downloadBtn.onclick = () => downloadSVGAsPNG(svg, `${kameaKey}-${word}-sigil.png`);

    // Save button
    const saveBtn = document.createElement("button");
    saveBtn.className = "btn btn-sm btn-outline-secondary mt-2 fade-in";
    saveBtn.textContent = "Save to Dictionary";
    saveBtn.onclick = () => {
      saveToDictionary({
        phrase: words[i],
        kamea: kameaKey,
        mode,
        numbers,
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

    wrapper.appendChild(downloadBtn);
    wrapper.appendChild(saveBtn);
    container.appendChild(wrapper);
  });
}
