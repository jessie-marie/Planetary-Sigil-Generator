// === CORE LOGIC ===
function mapCharToNumber(char) {
  const alpha = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  return alpha.indexOf(char.toUpperCase()) + 1;
}

function hybridMap(phrase, kameaKey) {
  const kamea = kameaTables[kameaKey];
  const kameaSize = kamea.length;
  const lettersOnly = phrase.replace(/[^a-zA-Z]/g, "");
  return Array.from(lettersOnly).map((char, i) => {
    const base = mapCharToNumber(char);
    const spreadFactor = Math.floor(kameaSize / 26) + 1;
    return kamea[(base + i * spreadFactor) % kameaSize];
  });
}
