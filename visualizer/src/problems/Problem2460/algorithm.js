const PYTHON_LINES = [
  "def applyOperations(nums):",
  "    n = len(nums)",
  "    for i in range(n - 1):",
  "        if nums[i] == nums[i + 1]:",
  "            nums[i] *= 2",
  "            nums[i + 1] = 0",
  "    result = [x for x in nums if x != 0]",
  "    zeros = n - len(result)",
  "    return result + [0] * zeros",
];

const CODE_LINES = [
  "FUNCTION applyOperations(nums)",
  "  n <- length of nums",
  "  FOR i from 0 to n - 2",
  "    IF nums[i] equals nums[i + 1] THEN",
  "      double nums[i] and set nums[i + 1] to 0",
  "  collect the non-zero values in their original order",
  "  append zeros until the collected list has length n",
  "  RETURN the collected list",
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
    throw new Error('Input must be a JSON object such as {"nums": [1,2,2,1,1,0]}');
  }
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) throw new Error("Input must be a JSON object with a nums key");
  const { nums } = obj;
  if (!Array.isArray(nums)) throw new Error("nums must be an array of integers");
  if (nums.length < 2 || nums.length > MAX_VALUES) throw new Error(`nums must contain between 2 and ${MAX_VALUES} entries for this visualization`);
  nums.forEach((value, index) => {
    if (!Number.isInteger(value) || value < 0 || value > MAX_VALUE) throw new Error(`nums[${index}] must be an integer from 0 to ${MAX_VALUE}`);
  });
  return { nums };
}

export function buildTrace(input) {
  const { nums: source } = input.nums ? input : parseInput(input);
  const n = source.length;
  const nums = [...source];
  const frames = [];
  const snap = (phase, activeLine, pyKey, message, extra = {}) => frames.push({
    phase, activeLine, pythonLine: py(pyKey), message, i: -1, cur: [...nums], ...extra,
  });

  snap("setup", 2, "n = len(nums)", `Work on a copy of the ${n} values.`);
  for (let i = 0; i < n - 1; i++) {
    snap("pair", 3, "for i in range", `Compare positions ${i} and ${i + 1}.`, { i });
    const same = nums[i] === nums[i + 1];
    snap("check", 4, "if nums[i] == nums[i + 1]", same ? `${nums[i]} equals ${nums[i + 1]}, so merge them.` : `${nums[i]} differs from ${nums[i + 1]}, so leave them alone.`, { i });
    if (same) {
      nums[i] *= 2;
      snap("merge", 5, "nums[i] *= 2", `Double position ${i} to ${nums[i]}.`, { i });
      nums[i + 1] = 0;
      snap("merge", 5, "nums[i + 1] = 0", `Set position ${i + 1} to 0.`, { i: i + 1 });
    }
  }

  const collected = nums.filter(x => x !== 0);
  snap("collect", 6, "result = [x for x in nums", `Keep the non-zero values in order: ${collected.join(", ") || "none"}.`, { result: collected });
  const zeros = n - collected.length;
  snap("pad", 7, "zeros = n - len(result)", `Add ${zeros} zero(s) at the end.`, { result: collected, zeros });
  const result = [...collected, ...Array(zeros).fill(0)];
  snap("done", 8, "return result + [0] * zeros", `Return [${result.join(", ")}].`, { result, cur: result });
  return { input: { nums: source }, result, frames };
}
