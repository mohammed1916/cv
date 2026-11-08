const CODE = [
  "function numTimesAligned(flips) {",
  "  let count = 0",
  "  let highest = 0",
  "  for (let i = 1; i <= flips.length; i++) {",
  "    highest = Math.max(highest, flips[i - 1])",
  "    if (highest === i) count += 1",
  "  }",
  "  return count",
  "}",
];

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

export const code = CODE.map((text, index) => ({ line: index + 1, text }));

export const pythonLineMap = { 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 8 };

export const examples = [
  { label: "[2,1,3,5,4]", input: '{"flips":[2,1,3,5,4]}' },
  { label: "[2,4,1,3]", input: '{"flips":[2,4,1,3]}' },
  { label: "Single", input: '{"flips":[1]}' },
  { label: "Identity order", input: "{\"flips\":[1,2,3,4,5,6]}" },
  { label: "Reverse of 50", input: "{\"flips\":[50,49,48,47,46,45,44,43,42,41,40,39,38,37,36,35,34,33,32,31,30,29,28,27,26,25,24,23,22,21,20,19,18,17,16,15,14,13,12,11,10,9,8,7,6,5,4,3,2,1]}" },
  { label: "Long run: 50 flips", input: "{\"flips\":[48,29,32,4,10,9,40,34,18,26,22,5,46,25,43,45,3,17,21,6,20,44,8,2,19,12,23,28,13,37,38,30,7,11,50,35,41,31,14,47,24,42,16,1,33,36,27,15,49,39]}" },
];

export function parseInput(text) {
  let data;
  try {
    data = typeof text === "string" ? JSON.parse(text) : text;
  } catch {
    throw new Error('Input must be a JSON object, e.g. {"flips":[2,4,1,3]}');
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
  frames.push({ phase: "scan", activeLine: 2, pythonLine: 2, message: "Start with count 0 and highest 0.", i: 0, highest, count, bits: [...bits], aligned: false });
  for (let i = 1; i <= n; i++) {
    bits[flips[i - 1] - 1] = 1;
    frames.push({ phase: "scan", activeLine: 4, pythonLine: 4, message: `Step ${i}: flip position ${flips[i - 1]}.`, i, highest, count, bits: [...bits], aligned: false });
    highest = Math.max(highest, flips[i - 1]);
    frames.push({ phase: "scan", activeLine: 5, pythonLine: 5, message: `Highest flipped position is ${highest}.`, i, highest, count, bits: [...bits], aligned: false });
    const aligned = highest === i;
    if (aligned) count += 1;
    frames.push({ phase: "scan", activeLine: 6, pythonLine: 6, message: aligned ? `Highest ${highest} equals step ${i}, so the string is prefix-aligned; count is ${count}.` : `Highest ${highest} is not ${i}; not aligned.`, i, highest, count, bits: [...bits], aligned });
  }
  frames.push({ phase: "done", activeLine: 8, pythonLine: 8, message: `Prefix-aligned after ${count} steps.`, i: n, highest, count, bits: [...bits], aligned: false });
  return { input, result: count, frames };
}
