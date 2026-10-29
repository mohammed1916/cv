const CODE = [
  "FUNCTION maximumCostSubstring(s, chars, vals)",
  "    custom ← cost of each character listed in chars",
  "    bestEnding ← 0",
  "    best ← 0",
  "    FOR each character ch in s",
  "        value ← custom cost of ch, or its alphabet position if not listed",
  "        bestEnding ← max(0, bestEnding + value)",
  "        best ← max(best, bestEnding)",
  "    RETURN best",
];
export const code = CODE.map((text, index) => ({ line: index + 1, text }));
export const python = `def maximumCostSubstring(s, chars, vals):
    custom = dict(zip(chars, vals))
    best_ending = 0
    best = 0
    for ch in s:
        value = custom.get(ch, ord(ch) - ord('a') + 1)
        best_ending = max(0, best_ending + value)
        best = max(best, best_ending)
    return best
`;
export const pythonLineMap = { 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9 };

const snapshot = table => table.map(row => row.map(cell => (Array.isArray(cell) ? [...cell] : cell)));
function emit(frames, table, info, write = false) {
  if (write) table[info.row][info.column] = info.value;
  frames.push({ phase: info.phase, activeLine: info.line, message: info.message, row: info.row, column: info.column, value: info.value, table: snapshot(table) });
}

export function parseInput(text) {
  let data;
  try { data = typeof text === "string" ? JSON.parse(text) : text; }
  catch { throw new Error('Input must be valid JSON, for example {"s": "adaa", "chars": "d", "vals": [-1000]}.'); }
  if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error("Input must be a JSON object with keys s, chars and vals.");
  const { s, chars, vals } = data;
  if (typeof s !== "string" || !/^[a-z]{1,50}$/.test(s)) throw new Error("s must be 1 to 50 lowercase letters (visualization cap; LeetCode allows up to 10^5).");
  if (typeof chars !== "string" || !/^[a-z]{1,26}$/.test(chars) || new Set(chars).size !== chars.length) throw new Error("chars must be distinct lowercase letters.");
  if (!Array.isArray(vals) || vals.length !== chars.length) throw new Error("vals must be an array with one value per character in chars.");
  if (!vals.every(v => Number.isInteger(v) && v >= -1000 && v <= 1000)) throw new Error("Each value in vals must be an integer from -1000 to 1000.");
  return { s, chars, vals };
}

export function buildTrace(input) {
  const { s, chars, vals } = input;
  const custom = new Map(chars.split("").map((ch, i) => [ch, vals[i]]));
  const table = [s.split("").map(() => null), s.split("").map(() => null)];
  const rowLabels = ["bestEnding", "best"];
  const columnLabels = s.split("").map((ch, i) => `${i}:${ch}`);
  const frames = [];
  let bestEnding = 0, best = 0;
  emit(frames, table, { phase: "setup", line: 3, row: 0, column: 0, value: 0, message: "Start with the empty substring: bestEnding = 0 and best = 0 (the empty substring costs 0)." });
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    const value = custom.has(ch) ? custom.get(ch) : ch.charCodeAt(0) - 96;
    emit(frames, table, { phase: "scan", line: 5, row: 0, column: i, value: null, message: `Read "${ch}" at index ${i}.` });
    emit(frames, table, { phase: "scan", line: 6, row: 0, column: i, value, message: `Cost of "${ch}" is ${value}.` });
    bestEnding = Math.max(0, bestEnding + value);
    emit(frames, table, { phase: "compute", line: 7, row: 0, column: i, value: bestEnding, message: `bestEnding = max(0, previous + ${value}) = ${bestEnding}.` }, true);
    best = Math.max(best, bestEnding);
    emit(frames, table, { phase: "compute", line: 8, row: 1, column: i, value: best, message: `best = max(best, bestEnding) = ${best}.` }, true);
  }
  emit(frames, table, { phase: "result", line: 9, row: 1, column: s.length - 1, value: best, message: `Return best = ${best}.` });
  return { input, result: best, frames, rowLabels, columnLabels };
}
