const PYTHON_LINES = [
  "def destroyTargets(nums, space):",
  "    count = {}",
  "    smallest = {}",
  "    for x in nums:",
  "        r = x % space",
  "        count[r] = count.get(r, 0) + 1",
  "        if r not in smallest or x < smallest[r]:",
  "            smallest[r] = x",
  "    best = None",
  "    for r in count:",
  "        if best is None or (count[r], -smallest[r]) > (count[best], -smallest[best]):",
  "            best = r",
  "    return smallest[best]",
];

const CODE_LINES = [
  "FUNCTION destroyTargets(nums, space)",
  "  count <- empty map from remainder to number of targets",
  "  smallest <- empty map from remainder to smallest target",
  "  FOR each target x in nums",
  "    remainder <- x modulo space",
  "    add one to count[remainder]",
  "    IF x is the first or smallest target with this remainder THEN",
  "      smallest[remainder] <- x",
  "  best <- nothing",
  "  FOR each remainder in count",
  "    IF this group destroys more, or ties with a smaller seed THEN",
  "      best <- remainder",
  "  RETURN smallest[best]",
];

const MAX_TARGETS = 50;
const MAX_VALUE = 1000;

export const python = PYTHON_LINES.join("\n");
export const code = CODE_LINES.map((text, index) => ({ line: index + 1, text }));

const py = key => {
  const index = PYTHON_LINES.findIndex(line => line.includes(key));
  if (index < 0) throw new Error(`Python line for "${key}" is missing`);
  return index + 1;
};

export function parseInput(text) {
  let obj;
  try {
    obj = typeof text === "string" ? JSON.parse(text) : text;
  } catch {
    throw new Error('Input must be a JSON object such as {"nums": [3,7,8,1,1,5], "space": 2}');
  }
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) throw new Error("Input must be a JSON object with nums and space keys");
  const { nums, space } = obj;
  if (!Array.isArray(nums)) throw new Error("nums must be an array of positive integers");
  if (nums.length < 1 || nums.length > MAX_TARGETS) throw new Error(`nums must contain between 1 and ${MAX_TARGETS} entries for this visualization`);
  nums.forEach((value, index) => {
    if (!Number.isInteger(value) || value < 1 || value > MAX_VALUE) throw new Error(`nums[${index}] must be an integer from 1 to ${MAX_VALUE}`);
  });
  if (!Number.isInteger(space) || space < 1 || space > MAX_VALUE) throw new Error(`space must be an integer from 1 to ${MAX_VALUE}`);
  return { nums, space };
}

export function buildTrace(input) {
  const { nums, space } = input.nums ? input : parseInput(input);
  const count = new Map();
  const smallest = new Map();
  const frames = [];
  const snap = (phase, activeLine, pyKey, message, extra = {}) => frames.push({
    phase, activeLine, pythonLine: py(pyKey), message, i: -1, r: null,
    groups: [...count].map(([key, n]) => ({ remainder: key, count: n, smallest: smallest.get(key) })),
    best: null, ...extra,
  });

  snap("setup", 2, "count = {}", "Start with empty tallies for each remainder modulo space.");
  for (let i = 0; i < nums.length; i++) {
    const x = nums[i];
    snap("scan", 4, "for x in nums", `Read target ${x} at index ${i}.`, { i });
    const r = x % space;
    snap("remainder", 5, "r = x % space", `${x} modulo ${space} is ${r}.`, { i, r });
    count.set(r, (count.get(r) ?? 0) + 1);
    snap("tally", 6, "count[r] = count.get", `Remainder ${r} now has ${count.get(r)} target(s).`, { i, r });
    const firstOrSmaller = !smallest.has(r) || x < smallest.get(r);
    snap("check", 7, "if r not in smallest", firstOrSmaller ? `${x} is the smallest target seen with remainder ${r}.` : `${x} is not smaller than the current seed for remainder ${r}.`, { i, r });
    if (firstOrSmaller) {
      smallest.set(r, x);
      snap("seed", 8, "smallest[r] = x", `Keep ${x} as the seed for remainder ${r}.`, { i, r });
    }
  }

  snap("pick", 9, "best = None", "No group has been chosen yet.");
  let best = null;
  for (const r of count.keys()) {
    snap("group", 10, "for r in count", `Compare the group with remainder ${r}.`, { r });
    const better = best === null
      || count.get(r) > count.get(best)
      || (count.get(r) === count.get(best) && smallest.get(r) < smallest.get(best));
    if (better) {
      best = r;
      snap("choose", 12, "best = r", `Remainder ${r} is the best group so far.`, { r, best });
    }
  }

  const result = smallest.get(best);
  snap("done", 13, "return smallest", `Return ${result}, the smallest seed that destroys ${count.get(best)} target(s).`, { r: best, best, result });
  return { input: { nums, space }, result, frames };
}
