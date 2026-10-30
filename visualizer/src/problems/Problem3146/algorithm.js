const PYTHON_LINES = [
  "def findPermutationDifference(s, t):",
  "    pos = {}",
  "    for i, ch in enumerate(s):",
  "        pos[ch] = i",
  "    total = 0",
  "    for j, ch in enumerate(t):",
  "        total += abs(pos[ch] - j)",
  "    return total",
];

const CODE = [
  "FUNCTION findPermutationDifference(s, t)",
  "    pos ← empty map",
  "    FOR i, ch IN s",
  "        pos[ch] ← i",
  "    total ← 0",
  "    FOR j, ch IN t",
  "        total ← total + |pos[ch] − j|",
  "    RETURN total",
];

export const code = CODE.map((text, index) => ({ line: index + 1, text }));
export const python = PYTHON_LINES.join("\n");

export function parseInput(text) {
  let data = text;
  if (typeof text === "string") {
    try {
      data = JSON.parse(text);
    } catch (error) {
      throw new Error(`Input must be valid JSON: ${error.message}`);
    }
  }
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error('Input must be a JSON object like {"s": "abc", "t": "bac"}');
  }
  const { s, t } = data;
  if (typeof s !== "string" || typeof t !== "string") {
    throw new Error("s and t must both be strings");
  }
  if (s.length < 1 || s.length > 26) {
    throw new Error(`s length (${s.length}) must be between 1 and 26 for the visualization`);
  }
  if (!/^[a-z]+$/.test(s) || !/^[a-z]+$/.test(t)) {
    throw new Error("s and t must contain lowercase English letters only");
  }
  if (new Set(s).size !== s.length) {
    throw new Error("Each character of s must appear at most once");
  }
  if (t.length !== s.length || [...s].sort().join("") !== [...t].sort().join("")) {
    throw new Error("t must be a permutation of s");
  }
  return { s, t };
}

export function buildTrace(input) {
  const { s, t } = parseInput(input);
  const frames = [];
  const pos = {};
  let total = 0;
  const push = (frame) => frames.push({ s, t, pos: { ...pos }, total, index: -1, ...frame });

  push({ phase: "setup", activeLine: 2, pythonLine: 2, message: "Start with an empty map from each character to its index in s." });
  for (let i = 0; i < s.length; i += 1) {
    push({ phase: "index", activeLine: 3, pythonLine: 3, index: i, message: `Visit s[${i}] = "${s[i]}".` });
    pos[s[i]] = i;
    push({ phase: "index", activeLine: 4, pythonLine: 4, index: i, message: `Record pos["${s[i]}"] = ${i}.` });
  }
  push({ phase: "sum", activeLine: 5, pythonLine: 5, message: "Start the running total at 0." });
  for (let j = 0; j < t.length; j += 1) {
    push({ phase: "sum", activeLine: 6, pythonLine: 6, index: j, message: `Visit t[${j}] = "${t[j]}".` });
    const diff = Math.abs(pos[t[j]] - j);
    total += diff;
    push({ phase: "sum", activeLine: 7, pythonLine: 7, index: j, diff, message: `Add |${pos[t[j]]} − ${j}| = ${diff}; total is now ${total}.` });
  }
  push({ phase: "done", activeLine: 8, pythonLine: 8, message: `Return ${total}.`, result: total });

  return { input: { s, t }, result: total, frames };
}
