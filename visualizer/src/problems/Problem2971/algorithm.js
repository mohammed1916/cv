export const python = [
  "def largestPerimeter(nums):",
  "    nums = sorted(nums)",
  "    total = sum(nums)",
  "    for i in range(len(nums) - 1, 1, -1):",
  "        if total - nums[i] > nums[i]:",
  "            return total",
  "        total -= nums[i]",
  "    return -1",
].join("\n");

export const code = [
  "sort nums in ascending order",
  "set total to the sum of all sides",
  "for i from the largest index down to 2",
  "if total minus nums[i] is greater than nums[i]",
  "return total",
  "remove nums[i] from total",
  "return -1",
].map((text, index) => ({ line: index + 1, text }));

function parseJson(text) {
  try { return JSON.parse(text); } catch { throw new Error('Input must be valid JSON, for example {"nums": [2, 3, 4]}.'); }
}

export function parseInput(text) {
  const data = typeof text === "string" ? parseJson(text) : text;
  if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error('Input must be a JSON object with a "nums" array.');
  const { nums } = data;
  if (!Array.isArray(nums) || nums.length < 3 || nums.length > 50) throw new Error("nums must hold 3 to 50 integers for this visualization.");
  if (!nums.every(v => Number.isInteger(v) && v >= 1 && v <= 1000000000)) throw new Error("Every nums value must be an integer from 1 to 1000000000.");
  return { nums: [...nums] };
}

export function buildTrace(input) {
  const sorted = [...input.nums].sort((a, b) => a - b);
  const n = sorted.length;
  let total = sorted.reduce((sum, v) => sum + v, 0);
  const frames = [];
  const push = (f) => frames.push({ seq: sorted, index: -1, stats: { total }, ...f });
  push({ phase: "sort", activeLine: 1, pythonLine: 2, message: "Sort the sides ascending; the largest side sits at the end." });
  push({ phase: "init", activeLine: 2, pythonLine: 3, message: `Total of all sides is ${total}.` });
  let result = -1;
  for (let i = n - 1; i >= 2; i--) {
    push({ phase: "loop", activeLine: 3, pythonLine: 4, index: i, message: `Try sorted[${i}] = ${sorted[i]} as the longest side.` });
    const others = total - sorted[i];
    const valid = others > sorted[i];
    push({ phase: "check", activeLine: 4, pythonLine: 5, index: i, stats: { total, others, valid }, message: `Other sides sum to ${others}; a polygon needs ${others} > ${sorted[i]}: ${valid}.` });
    if (valid) {
      result = total;
      push({ phase: "done", activeLine: 5, pythonLine: 6, index: i, stats: { total, result }, message: `Valid polygon; perimeter ${total}.` });
      break;
    }
    total -= sorted[i];
    push({ phase: "shrink", activeLine: 6, pythonLine: 7, index: i, message: `Drop ${sorted[i]}; it cannot be the longest side.` });
  }
  if (result === -1) push({ phase: "done", activeLine: 7, pythonLine: 8, index: -1, stats: { total, result: -1 }, message: "No polygon can be formed; return -1." });
  return { input, result, frames };
}
