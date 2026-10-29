const PYTHON_LINES = [
  "def minCost(nums, cost):",
  '    best = float("inf")',
  "    for target in nums:",
  "        total = 0",
  "        for k in range(len(nums)):",
  "            total += abs(nums[k] - target) * cost[k]",
  "        best = min(best, total)",
  "    return best",
];

const CODE_LINES = [
  "FUNCTION minCost(nums, cost)",
  "  best <- infinity",
  "  FOR each candidate target t taken from nums",
  "    total <- 0",
  "    FOR each index k",
  "      total <- total + |nums[k] - t| * cost[k]",
  "    best <- smaller of best and total",
  "  RETURN best",
];

const MAX_LENGTH = 50;
const MAX_VALUE = 1000;

export const python = PYTHON_LINES.join("\n");
export const code = CODE_LINES.map((text, index) => ({ line: index + 1, text }));

// Pseudocode line -> Python line doing the same action.
export const pythonLineMap = { 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8 };

export function parseInput(text) {
  let obj;
  try {
    obj = typeof text === "string" ? JSON.parse(text) : text;
  } catch {
    throw new Error('Input must be a JSON object such as {"nums": [1,3,5,2], "cost": [2,3,1,14]}');
  }
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) throw new Error("Input must be a JSON object with nums and cost keys");
  const { nums, cost } = obj;
  if (!Array.isArray(nums) || !Array.isArray(cost)) throw new Error("nums and cost must both be arrays of integers");
  if (nums.length < 1 || nums.length > MAX_LENGTH) {
    throw new Error(`nums must contain between 1 and ${MAX_LENGTH} entries for this visualization`);
  }
  if (cost.length !== nums.length) throw new Error("cost must have the same length as nums");
  nums.forEach((value, index) => {
    if (!Number.isInteger(value) || value < 0 || value > MAX_VALUE) throw new Error(`nums[${index}] must be an integer from 0 to ${MAX_VALUE}`);
  });
  cost.forEach((price, index) => {
    if (!Number.isInteger(price) || price < 0 || price > MAX_VALUE) throw new Error(`cost[${index}] must be an integer from 0 to ${MAX_VALUE}`);
  });
  return { nums, cost };
}

export function buildTrace(input) {
  const { nums, cost } = input.nums ? input : parseInput(input);
  const n = nums.length;
  const frames = [];
  let best = Infinity;
  const snap = (phase, activeLine, message, extra = {}) => frames.push({
    phase, activeLine, message, i: -1, k: -1, target: null, total: 0,
    best: Number.isFinite(best) ? best : null, ...extra,
  });

  snap("setup", 2, "Start with no best cost.");
  for (let i = 0; i < n; i++) {
    const target = nums[i];
    snap("candidate", 3, `Try target ${target} (taken from index ${i}).`, { i, target });
    let total = 0;
    snap("reset", 4, `Total cost for target ${target} starts at 0.`, { i, target });
    for (let k = 0; k < n; k++) {
      const term = Math.abs(nums[k] - target) * cost[k];
      total += term;
      snap("sum", 6, `|${nums[k]} - ${target}| * ${cost[k]} = ${term}, total is now ${total}.`, { i, k, target, total });
    }
    best = Math.min(best, total);
    snap("update", 7, `Total ${total} for target ${target}; best is ${best}.`, { i, target, total });
  }
  snap("done", 8, `Minimum cost is ${best}.`, { result: best });
  return { input: nums, cost, result: best, frames };
}
