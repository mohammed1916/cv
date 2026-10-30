export const python = [
  "def areaOfMaxDiagonal(dimensions):",
  "    best_d2 = -1",
  "    best_area = 0",
  "    for length, width in dimensions:",
  "        d2 = length * length + width * width",
  "        area = length * width",
  "        if d2 > best_d2 or (d2 == best_d2 and area > best_area):",
  "            best_d2 = d2",
  "            best_area = area",
  "    return best_area",
].join("\n");

export const code = [
  "best squared diagonal = -1, best area = 0",
  "for each rectangle [length, width]",
  "if its squared diagonal beats the best, or ties with a larger area, update the best",
  "return the best area",
].map((text, index) => ({ line: index + 1, text }));

function parseJson(text) {
  try { return JSON.parse(text); } catch { throw new Error('Input must be valid JSON, for example {"dimensions": [[9,3],[8,6]]}.'); }
}

export function parseInput(text) {
  const data = typeof text === "string" ? parseJson(text) : text;
  if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error('Input must be a JSON object with a "dimensions" array.');
  const { dimensions } = data;
  if (!Array.isArray(dimensions) || dimensions.length < 1 || dimensions.length > 50) throw new Error("dimensions must hold 1 to 50 rectangles for this visualization.");
  for (const rect of dimensions) {
    if (!Array.isArray(rect) || rect.length !== 2 || !rect.every(v => Number.isInteger(v) && v >= 1 && v <= 1000)) throw new Error("Each rectangle must be [length, width] with integers from 1 to 1000.");
  }
  return { dimensions: dimensions.map(([l, w]) => [l, w]) };
}

export function buildTrace(input) {
  const dims = input.dimensions;
  let bestD2 = -1;
  let bestArea = 0;
  const frames = [];
  const seq = dims.map(([l, w]) => l * l + w * w);
  const push = (f) => frames.push({ seq, index: -1, stats: { bestD2, bestArea }, ...f });
  push({ phase: "init", activeLine: 1, pythonLine: 2, message: "Start with no best rectangle." });
  dims.forEach(([length, width], index) => {
    const d2 = length * length + width * width;
    const area = length * width;
    push({ phase: "scan", activeLine: 2, pythonLine: 5, index, stats: { length, width, d2, area, bestD2, bestArea }, message: `Rectangle ${index}: ${length} x ${width}, squared diagonal ${d2}, area ${area}.` });
    if (d2 > bestD2 || (d2 === bestD2 && area > bestArea)) {
      bestD2 = d2;
      bestArea = area;
      push({ phase: "update", activeLine: 3, pythonLine: 8, index, stats: { length, width, d2, area, bestD2, bestArea }, message: `New best: diagonal² ${d2}, area ${area}.` });
    }
  });
  push({ phase: "done", activeLine: 4, pythonLine: 10, index: -1, stats: { bestD2, bestArea }, message: `Return ${bestArea}.` });
  return { input, result: bestArea, frames };
}
