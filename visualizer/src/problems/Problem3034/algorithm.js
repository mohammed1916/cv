export const meta = {
  number: "3034",
  title: "Number of Subarrays That Match a Pattern I",
  slug: "number-of-subarrays-that-match-a-pattern-i",
  difficulty: "Medium",
  tags: ["Array", "Pattern Matching"],
  description: "Compare each adjacent pair in a window with the pattern: 1 means up, 0 means equal, -1 means down.",
  accent: "#0ea5e9",
};

export const PYTHON_LINES = [
  "def countMatchingSubarrays(nums, pattern):",
  "    m = len(pattern)",
  "    count = 0",
  "    for start in range(len(nums) - m):",
  "        ok = True",
  "        for k in range(m):",
  "            a = nums[start + k]",
  "            b = nums[start + k + 1]",
  "            sign = (b > a) - (b < a)",
  "            if sign != pattern[k]:",
  "                ok = False",
  "                break",
  "        if ok:",
  "            count += 1",
  "    return count",
];

export const CODE = `function countMatchingSubarrays(nums, pattern) {
  const m = pattern.length
  let count = 0
  for (let start = 0; start < nums.length - m; start++) {
    let ok = true
    for (let k = 0; k < m; k++) {
      const a = nums[start + k]
      const b = nums[start + k + 1]
      const sign = Math.sign(b - a)
      if (sign !== pattern[k]) {
        ok = false
        break
      }
    }
    if (ok) count += 1
  }
  return count
}`.split('\n');
export const code = CODE.map((text, index) => ({ line: index + 1, text }));
const L = k => { const i = code.findIndex(c => c.text.includes(k)); if (i < 0) throw new Error('No code line: ' + k); return i + 1 };
export const python = PYTHON_LINES.join("\n");

// Pseudocode line -> Python line (identity mapping by design; both are 15 steps long).
export const pythonLineMap = {
  1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9, 10: 10, 11: 11, 12: 12, 13: 13, 14: 14, 15: 15,
};

const sign = (a, b) => (b > a ? 1 : b < a ? -1 : 0);

export function parseInput(text) {
  let data = text;
  if (typeof text === "string") {
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error('Input must be JSON, e.g. {"nums": [1,2,3], "pattern": [1,1]}');
    }
  }
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("Input must be a JSON object with keys nums and pattern");
  }
  const { nums, pattern } = data;
  if (!Array.isArray(nums) || nums.length < 2 || nums.length > 100) {
    throw new Error("nums must be an array with 2 to 100 elements");
  }
  if (!nums.every((x) => Number.isInteger(x) && x >= 1 && x <= 1e9)) {
    throw new Error("Each nums[i] must be an integer from 1 to 1000000000");
  }
  if (!Array.isArray(pattern) || pattern.length < 1 || pattern.length >= nums.length) {
    throw new Error("pattern must be an array with 1 to (nums.length - 1) elements");
  }
  if (!pattern.every((p) => p === -1 || p === 0 || p === 1)) {
    throw new Error("Each pattern[i] must be -1, 0 or 1");
  }
  return { nums: [...nums], pattern: [...pattern] };
}

export function buildTrace(input) {
  const { nums, pattern } = parseInput(input);
  const n = nums.length;
  const m = pattern.length;
  const frames = [];
  let count = 0;
  const windows = [];

  const push = (f) =>
    frames.push({
      phase: f.phase,
      activeLine: f.activeLine,
      pythonLine: f.pythonLine,
      message: f.message,
      explanation: f.explanation ?? f.message,
      nums: [...nums],
      pattern: [...pattern],
      start: f.start ?? -1,
      k: f.k ?? -1,
      comparison: f.comparison ?? null,
      windowOk: f.windowOk ?? null,
      count,
      windows: [...windows],
    });

  push({ phase: "init", activeLine: L('const m = pattern.length'), pythonLine: 2, message: `m = ${m}, so each candidate window has ${m + 1} elements.` });
  push({ phase: "init", activeLine: L('let count = 0'), pythonLine: 3, message: "count = 0." });

  for (let start = 0; start < n - m; start++) {
    push({ phase: "loop", activeLine: L('for (let start'), pythonLine: 4, start, message: `Window starts at index ${start}: nums[${start}..${start + m}].` });
    let ok = true;
    push({ phase: "loop", activeLine: L('let ok = true'), pythonLine: 5, start, message: "ok = true." });
    for (let k = 0; k < m; k++) {
      const a = nums[start + k];
      const b = nums[start + k + 1];
      const s = sign(a, b);
      push({ phase: "compare", activeLine: L('for (let k = 0'), pythonLine: 6, start, k, message: `Check pair (${a}, ${b}) against pattern[${k}] = ${pattern[k]}.` });
      push({ phase: "compare", activeLine: L('const a = nums'), pythonLine: 7, start, k, comparison: s, message: `a = ${a}.` });
      push({ phase: "compare", activeLine: L('const b = nums'), pythonLine: 8, start, k, comparison: s, message: `b = ${b}.` });
      push({ phase: "compare", activeLine: L('const sign = Math.sign'), pythonLine: 9, start, k, comparison: s, message: `Comparison result: ${s} (${s > 0 ? "up" : s < 0 ? "down" : "equal"}).` });
      if (s !== pattern[k]) {
        ok = false;
        push({ phase: "check", activeLine: L('if (sign !== pattern[k])'), pythonLine: 10, start, k, comparison: s, windowOk: false, message: `${s} != pattern[${k}] = ${pattern[k]}, mismatch.` });
        push({ phase: "check", activeLine: L('ok = false'), pythonLine: 11, start, k, windowOk: false, message: "ok = false." });
        push({ phase: "check", activeLine: L('break'), pythonLine: 12, start, k, windowOk: false, message: "Stop checking this window." });
        break;
      }
      push({ phase: "check", activeLine: L('if (sign !== pattern[k])'), pythonLine: 10, start, k, comparison: s, windowOk: true, message: `${s} matches pattern[${k}] = ${pattern[k]}.` });
    }
    push({ phase: "check", activeLine: L('if (ok) count += 1'), pythonLine: 13, start, windowOk: ok, message: ok ? "Every pair matched; the window is valid." : "Window rejected." });
    if (ok) {
      count += 1;
      windows.push(start);
      push({ phase: "count", activeLine: L('if (ok) count += 1'), pythonLine: 14, start, windowOk: true, message: `count = ${count}.` });
    }
  }

  push({ phase: "done", activeLine: L('return count'), pythonLine: 15, message: `Return count = ${count}.` });
  return { input: { nums, pattern }, result: count, frames };
}

export const sampleInputs = [
  { label: "Example 1", input: { nums: [6, 2, 2, 5, 9, 9], pattern: [-1, 0] } },
  { label: "Example 2", input: { nums: [1, 2, 1, 5, 5, 4, 8, 3], pattern: [1, -1] } },
  { label: "Single pair", input: {"nums":[1,2],"pattern":[1]} },
  { label: "Equal values", input: {"nums":[4,4,4,4],"pattern":[0,0]} },
  { label: "Largest values", input: {"nums":[1000000000,1,1000000000,1000000000],"pattern":[1,-1]} },
  { label: "Long run: 100 values", input: {"nums":[44,45,4,11,10,1,12,23,14,17,50,19,28,5,12,49,44,45,16,11,44,19,48,47,46,49,46,23,12,45,50,35,8,7,32,47,48,21,12,11,14,43,32,39,32,9,14,9,36,11,40,37,18,3,38,37,42,37,2,7,12,15,22,23,14,25,20,1,12,5,20,37,10,41,2,33,48,13,44,33,8,17,50,31,40,27,6,43,2,5,12,1,22,45,4,21,48,33,44,13],"pattern":[1,0,-1]} },
];
