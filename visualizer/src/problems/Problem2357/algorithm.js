const PYTHON_LINES = [
  "def minimumOperations(nums):",
  "    seen = set()",
  "    for v in nums:",
  "        if v > 0:",
  "            seen.add(v)",
  "    return len(seen)",
];

const CODE_LINES = [
  "FUNCTION minimumOperations(nums)",
  "  seen <- empty set",
  "  FOR each value v in nums",
  "    IF v > 0 THEN",
  "      add v to seen",
  "  RETURN the size of seen",
];

const MAX_VALUES = 50;

export const python = PYTHON_LINES.join("\n");
export const code = CODE_LINES.map((text, index) => ({ line: index + 1, text }));

// Pseudocode line -> Python line doing the same action.
export const pythonLineMap = { 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6 };

export function parseInput(text) {
  let obj;
  try {
    obj = typeof text === "string" ? JSON.parse(text) : text;
  } catch {
    throw new Error('Input must be a JSON object such as {"nums": [1,5,0,3,5]}');
  }
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) throw new Error("Input must be a JSON object with a nums key");
  const { nums } = obj;
  if (!Array.isArray(nums)) throw new Error("nums must be an array of integers");
  if (nums.length < 1 || nums.length > MAX_VALUES) {
    throw new Error(`nums must contain between 1 and ${MAX_VALUES} entries for this visualization`);
  }
  nums.forEach((value, index) => {
    if (!Number.isInteger(value) || value < 0) throw new Error(`nums[${index}] must be a non-negative integer`);
  });
  return { nums };
}

export function buildTrace(input) {
  const { nums } = input.nums ? input : parseInput(input);
  const seen = new Set();
  const frames = [];
  const snap = (phase, activeLine, message, extra = {}) => frames.push({
    phase, activeLine, message, i: -1, seen: [...seen].sort((a, b) => a - b), ...extra,
  });

  snap("setup", 2, "Start with an empty set of nonzero values.");
  for (let i = 0; i < nums.length; i++) {
    const v = nums[i];
    snap("scan", 3, `Read value ${v} at index ${i}.`, { i });
    snap("check", 4, v > 0 ? `${v} is nonzero.` : `${v} is zero, so it is skipped.`, { i });
    if (v > 0) {
      seen.add(v);
      snap("record", 5, `Add ${v} to the set.`, { i });
    }
  }
  const result = seen.size;
  snap("done", 6, `Return ${result} distinct nonzero value(s).`, { result });
  return { input: nums, result, frames };
}
