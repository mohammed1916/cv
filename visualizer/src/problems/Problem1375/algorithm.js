const PYTHON_LINES = [
  "def numTimesAligned(flips):",
  "    count = 0",
  "    max_index = 0",
  "    for i, f in enumerate(flips, start=1):",
  "        max_index = max(max_index, f)",
  "        if max_index == i:",
  "            count += 1",
  "    return count",
];

export const python = PYTHON_LINES.join("\n");

export const code = [
  { line: 1, text: "count = 0; highest = 0" },
  { line: 2, text: "for step i from 1 to n:" },
  { line: 3, text: "highest = max(highest, flips[i])" },
  { line: 4, text: "if highest == i: count += 1 (the first i bits are exactly ones)" },
  { line: 5, text: "return count" },
];

export const pythonLineMap = { 1: 2, 2: 4, 3: 5, 4: 6, 5: 8 };

export const examples = [
  { label: "[3,2,4,1,5]", input: '{"flips":[3,2,4,1,5]}' },
  { label: "[4,1,2,3]", input: '{"flips":[4,1,2,3]}' },
  { label: "Single", input: '{"flips":[1]}' },
];

export function parseInput(text) {
  let data;
  try {
    data = typeof text === "string" ? JSON.parse(text) : text;
  } catch {
    throw new Error('Input must be a JSON object, e.g. {"flips":[3,2,4,1,5]}');
  }
  if (data === null || typeof data !== "object" || Array.isArray(data)) throw new Error("Input must be a JSON object with a flips array");
  const { flips } = data;
  if (!Array.isArray(flips) || flips.length < 1) throw new Error("flips must be a non-empty array");
  if (flips.length > 50) throw new Error(`flips has ${flips.length} values; the visualization caps it at 50`);
  const n = flips.length;
  const seen = new Set();
  flips.forEach((v, i) => {
    if (!Number.isInteger(v) || v < 1 || v > n) throw new Error(`flips[${i}] must be an integer from 1 to ${n}`);
    seen.add(v);
  });
  if (seen.size !== n) throw new Error("flips must be a permutation of 1 to n (no repeats)");
  return { flips: [...flips] };
}

export function buildTrace(input) {
  const flips = input.flips;
  const n = flips.length;
  const frames = [];
  const bits = Array(n).fill(0);
  let count = 0;
  let highest = 0;
  frames.push({ phase: "scan", activeLine: 1, message: "Start with count 0 and highest 0.", i: 0, highest, count, bits: [...bits], aligned: false });
  for (let i = 1; i <= n; i++) {
    bits[flips[i - 1] - 1] = 1;
    frames.push({ phase: "scan", activeLine: 2, message: `Step ${i}: flip position ${flips[i - 1]}.`, i, highest, count, bits: [...bits], aligned: false });
    highest = Math.max(highest, flips[i - 1]);
    frames.push({ phase: "scan", activeLine: 3, message: `Highest flipped position is ${highest}.`, i, highest, count, bits: [...bits], aligned: false });
    const aligned = highest === i;
    if (aligned) count += 1;
    frames.push({ phase: "scan", activeLine: 4, message: aligned ? `Highest ${highest} equals step ${i}, so the string is prefix-aligned; count is ${count}.` : `Highest ${highest} is not ${i}; not aligned.`, i, highest, count, bits: [...bits], aligned });
  }
  frames.push({ phase: "done", activeLine: 5, message: `Prefix-aligned after ${count} steps.`, i: n, highest, count, bits: [...bits], aligned: false });
  return { input, result: count, frames };
}
