const PYTHON_LINES = [
  "def maxValueAfterReverse(nums):",
  "    n = len(nums)",
  "    base = sum(abs(nums[i] - nums[i + 1]) for i in range(n - 1))",
  "    gain = 0",
  "    max_min = float('-inf')",
  "    min_max = float('inf')",
  "    for i in range(n - 1):",
  "        gain = max(gain, abs(nums[0] - nums[i + 1]) - abs(nums[i] - nums[i + 1]),",
  "                   abs(nums[n - 1] - nums[i]) - abs(nums[i] - nums[i + 1]))",
  "        max_min = max(max_min, min(nums[i], nums[i + 1]))",
  "        min_max = min(min_max, max(nums[i], nums[i + 1]))",
  "    gain = max(gain, 2 * (max_min - min_max))",
  "    return base + gain",
];

export const python = PYTHON_LINES.join("\n");

export const code = [
  { line: 1, text: "base = sum of |nums[i] - nums[i+1]| over adjacent pairs" },
  { line: 2, text: "gain = 0" },
  { line: 3, text: "for each boundary i from 0 to n-2:" },
  { line: 4, text: "gain = max(gain, prefix flip gain, suffix flip gain)" },
  { line: 5, text: "maxMin = max(maxMin, min(nums[i], nums[i+1]))" },
  { line: 6, text: "minMax = min(minMax, max(nums[i], nums[i+1]))" },
  { line: 7, text: "gain = max(gain, 2 * (maxMin - minMax))" },
  { line: 8, text: "return base + gain" },
];

// Maps each pseudocode line used by the frames to the Python line doing the same action.
export const pythonLineMap = { 1: 3, 2: 4, 3: 7, 4: 8, 5: 9, 6: 10, 7: 11, 8: 12 };

export const examples = [
  { label: "Example 1", input: '{"nums":[2,3,1,5,4]}' },
  { label: "Example 2", input: '{"nums":[2,4,9,24,2,1,10]}' },
  { label: "Two values", input: '{"nums":[1,5]}' },
];

export function parseInput(text) {
  let data;
  try {
    data = typeof text === "string" ? JSON.parse(text) : text;
  } catch {
    throw new Error('Input must be a JSON object, e.g. {"nums":[2,3,1,5,4]}');
  }
  if (data === null || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("Input must be a JSON object with a nums array");
  }
  const { nums } = data;
  if (!Array.isArray(nums)) throw new Error("nums must be an array of integers");
  if (nums.length < 2) throw new Error("nums needs at least 2 values");
  if (nums.length > 50) throw new Error(`nums has ${nums.length} values; the visualization caps it at 50`);
  nums.forEach((v, i) => {
    if (!Number.isInteger(v) || Math.abs(v) > 100000) {
      throw new Error(`nums[${i}] must be an integer with absolute value at most 100000`);
    }
  });
  return { nums: [...nums] };
}

export function buildTrace(input) {
  const a = input.nums;
  const n = a.length;
  const frames = [];
  let base = 0;
  for (let i = 0; i < n - 1; i++) base += Math.abs(a[i] - a[i + 1]);
  frames.push({ phase: "base", activeLine: 1, message: `Base value is ${base}.`, i: -1, base, gain: 0, maxMin: null, minMax: null });
  frames.push({ phase: "base", activeLine: 2, message: "Start with no extra gain.", i: -1, base, gain: 0, maxMin: null, minMax: null });

  let gain = 0;
  let maxMin = -Infinity;
  let minMax = Infinity;
  const shown = (v) => (Number.isFinite(v) ? v : null);
  for (let i = 0; i < n - 1; i++) {
    frames.push({ phase: "scan", activeLine: 3, message: `Check boundary ${i} between nums[${i}] and nums[${i + 1}].`, i, base, gain, maxMin: shown(maxMin), minMax: shown(minMax) });
    const prefix = Math.abs(a[0] - a[i + 1]) - Math.abs(a[i] - a[i + 1]);
    const suffix = Math.abs(a[n - 1] - a[i]) - Math.abs(a[i] - a[i + 1]);
    gain = Math.max(gain, prefix, suffix);
    frames.push({ phase: "scan", activeLine: 4, message: `End flips at boundary ${i} gain ${prefix} (prefix) or ${suffix} (suffix); best gain is ${gain}.`, i, base, gain, maxMin: shown(maxMin), minMax: shown(minMax) });
    maxMin = Math.max(maxMin, Math.min(a[i], a[i + 1]));
    frames.push({ phase: "scan", activeLine: 5, message: `Largest lower value of a pair so far is ${maxMin}.`, i, base, gain, maxMin: shown(maxMin), minMax: shown(minMax) });
    minMax = Math.min(minMax, Math.max(a[i], a[i + 1]));
    frames.push({ phase: "scan", activeLine: 6, message: `Smallest upper value of a pair so far is ${minMax}.`, i, base, gain, maxMin: shown(maxMin), minMax: shown(minMax) });
  }
  const interior = 2 * (maxMin - minMax);
  gain = Math.max(gain, interior);
  frames.push({ phase: "finish", activeLine: 7, message: `Interior reversal gains ${interior}; best extra gain is ${gain}.`, i: -1, base, gain, maxMin: shown(maxMin), minMax: shown(minMax) });
  const result = base + gain;
  frames.push({ phase: "done", activeLine: 8, message: `Maximum array value is ${result}.`, i: -1, base, gain, maxMin: shown(maxMin), minMax: shown(minMax) });
  return { input, result, frames };
}
