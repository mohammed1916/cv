const PYTHON_LINES = [
  "def averageValue(nums):",
  "    total = 0",
  "    count = 0",
  "    for x in nums:",
  "        if x % 6 == 0:",
  "            total += x",
  "            count += 1",
  "    if count == 0:",
  "        return 0",
  "    return total // count",
];

const CODE_LINES = [
  "FUNCTION averageValue(nums)",
  "  total <- 0",
  "  count <- 0",
  "  FOR each value x in nums",
  "    IF x is divisible by 6 THEN",
  "      add x to total and add one to count",
  "  IF count is 0 THEN",
  "    RETURN 0",
  "  RETURN total divided by count, rounded down",
];

const MAX_VALUES = 50;
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
    throw new Error('Input must be a JSON object such as {"nums": [1,3,6,10,12,15]}');
  }
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) throw new Error("Input must be a JSON object with a nums key");
  const { nums } = obj;
  if (!Array.isArray(nums)) throw new Error("nums must be an array of integers");
  if (nums.length < 1 || nums.length > MAX_VALUES) throw new Error(`nums must contain between 1 and ${MAX_VALUES} entries for this visualization`);
  nums.forEach((value, index) => {
    if (!Number.isInteger(value) || value < 1 || value > MAX_VALUE) throw new Error(`nums[${index}] must be an integer from 1 to ${MAX_VALUE}`);
  });
  return { nums };
}

export function buildTrace(input) {
  const { nums } = input.nums ? input : parseInput(input);
  let total = 0;
  let count = 0;
  const frames = [];
  const snap = (phase, activeLine, pyKey, message, extra = {}) => frames.push({
    phase, activeLine, pythonLine: py(pyKey), message, i: -1, total, count, counted: [], ...extra,
  });
  const counted = [];

  snap("setup", 2, "total = 0", "Start with a sum of 0 and a count of 0.");
  snap("setup", 2, "count = 0", "The count of multiples of 6 starts at 0.");
  for (let i = 0; i < nums.length; i++) {
    const x = nums[i];
    snap("scan", 3, "for x in nums", `Read value ${x} at index ${i}.`, { i });
    const hit = x % 6 === 0;
    snap("check", 4, "if x % 6 == 0", hit ? `${x} is divisible by 2 and by 3, so it counts.` : `${x} is not divisible by both 2 and 3.`, { i });
    if (hit) {
      total += x;
      counted.push(i);
      snap("record", 5, "total += x", `Add ${x} to the total, now ${total}.`, { i, total, counted: [...counted] });
      count += 1;
      snap("record", 6, "count += 1", `The count is now ${count}.`, { i, total, count, counted: [...counted] });
    }
  }

  if (count === 0) {
    snap("check", 7, "if count == 0", "No value qualifies, so the average is 0.", { total, count, counted: [...counted] });
    snap("done", 8, "return 0", "Return 0.", { result: 0, total, count, counted: [...counted] });
    return { input: nums, result: 0, frames };
  }
  snap("check", 7, "if count == 0", `The count is ${count}, so there is an average to take.`, { total, count, counted: [...counted] });
  const result = Math.floor(total / count);
  snap("done", 9, "return total // count", `Return ${total} divided by ${count}, rounded down, which is ${result}.`, { result, total, count, counted: [...counted] });
  return { input: nums, result, frames };
}
