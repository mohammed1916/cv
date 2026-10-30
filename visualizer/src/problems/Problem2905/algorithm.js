const PYTHON_LINES = [
  "def findIndices(nums, indexDifference, valueDifference):",
  "    n = len(nums)",
  "    mn = mx = 0",
  "    for j in range(indexDifference, n):",
  "        i = j - indexDifference",
  "        if nums[i] < nums[mn]:",
  "            mn = i",
  "        if nums[i] > nums[mx]:",
  "            mx = i",
  "        if abs(nums[j] - nums[mn]) >= valueDifference:",
  "            return [mn, j]",
  "        if abs(nums[mx] - nums[j]) >= valueDifference:",
  "            return [mx, j]",
  "    return [-1, -1]",
];

export const python = PYTHON_LINES.join("\n");

export const code = [
  { line: 1, text: "Read n as the length of nums; set mn = mx = 0" },
  { line: 2, text: "For each index j from indexDifference to n - 1" },
  { line: 3, text: "Let i = j - indexDifference, the newest index that is far enough back" },
  { line: 4, text: "If nums[i] is smaller than nums[mn], set mn = i; if larger than nums[mx], set mx = i" },
  { line: 5, text: "If |nums[j] - nums[mn]| >= valueDifference, return [mn, j]" },
  { line: 6, text: "If |nums[mx] - nums[j]| >= valueDifference, return [mx, j]" },
  { line: 7, text: "Return [-1, -1]" },
];

const LIMITS = { maxLength: 100, maxValue: 1000, maxIndexDifference: 100, maxValueDifference: 1000 };

export function parseInput(text) {
  let data = text;
  if (typeof text === "string") {
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error('Input must be a JSON object such as {"nums":[5,1,4,1],"indexDifference":2,"valueDifference":4}');
    }
  }
  if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error("Input must be a JSON object");
  const { nums, indexDifference, valueDifference } = data;
  if (!Array.isArray(nums) || nums.length < 1) throw new Error("nums must be a non-empty array of integers");
  if (nums.length > LIMITS.maxLength) throw new Error(`nums has ${nums.length} values; the visualization caps it at ${LIMITS.maxLength}`);
  nums.forEach((value, index) => {
    if (!Number.isInteger(value) || value < 0 || value > LIMITS.maxValue) {
      throw new Error(`nums[${index}] must be an integer from 0 to ${LIMITS.maxValue}`);
    }
  });
  if (!Number.isInteger(indexDifference) || indexDifference < 0 || indexDifference > LIMITS.maxIndexDifference) {
    throw new Error(`indexDifference must be an integer from 0 to ${LIMITS.maxIndexDifference}`);
  }
  if (!Number.isInteger(valueDifference) || valueDifference < 0 || valueDifference > LIMITS.maxValueDifference) {
    throw new Error(`valueDifference must be an integer from 0 to ${LIMITS.maxValueDifference}`);
  }
  return { nums: [...nums], indexDifference, valueDifference };
}

function frame(fields) {
  return { result: null, i: null, j: null, mn: 0, mx: 0, explanation: "", ...fields };
}

export function buildTrace(input) {
  const { nums, indexDifference, valueDifference } = parseInput(input);
  const n = nums.length;
  const frames = [];
  let mn = 0;
  let mx = 0;
  frames.push(frame({
    phase: "setup", activeLine: 1, pythonLine: 3, mn, mx,
    message: `n = ${n}. Both tracked indices start at 0.`,
    explanation: "mn and mx remember the position of the smallest and largest value among indices at least indexDifference behind j.",
  }));
  for (let j = indexDifference; j < n; j += 1) {
    const i = j - indexDifference;
    frames.push(frame({
      phase: "loop", activeLine: 2, pythonLine: 4, i, j, mn, mx,
      message: `j = ${j}; the newly eligible index is i = ${i}.`,
      explanation: `Index ${i} is now at least indexDifference = ${indexDifference} positions before j.`,
    }));
    if (nums[i] < nums[mn]) mn = i;
    if (nums[i] > nums[mx]) mx = i;
    frames.push(frame({
      phase: "track", activeLine: 4, pythonLine: 6, i, j, mn, mx,
      message: `Update tracked minimum to index ${mn} (value ${nums[mn]}) and maximum to index ${mx} (value ${nums[mx]}).`,
      explanation: "Only the extreme values matter, because any pair with i can be replaced by the extreme value on that side.",
    }));
    const lowGap = Math.abs(nums[j] - nums[mn]);
    if (lowGap >= valueDifference) {
      const result = [mn, j];
      frames.push(frame({
        phase: "done", activeLine: 5, pythonLine: 11, i, j, mn, mx, result,
        message: `|nums[${j}] - nums[${mn}]| = ${lowGap} >= ${valueDifference}. Return [${mn}, ${j}].`,
        explanation: "The tracked minimum already gives a valid pair.",
      }));
      return { input: { nums, indexDifference, valueDifference }, result, frames };
    }
    frames.push(frame({
      phase: "check", activeLine: 5, pythonLine: 10, i, j, mn, mx,
      message: `|nums[${j}] - nums[${mn}]| = ${lowGap} < ${valueDifference}.`,
      explanation: "The minimum side fails; check the maximum side.",
    }));
    const highGap = Math.abs(nums[mx] - nums[j]);
    if (highGap >= valueDifference) {
      const result = [mx, j];
      frames.push(frame({
        phase: "done", activeLine: 6, pythonLine: 13, i, j, mn, mx, result,
        message: `|nums[${mx}] - nums[${j}]| = ${highGap} >= ${valueDifference}. Return [${mx}, ${j}].`,
        explanation: "The tracked maximum gives a valid pair.",
      }));
      return { input: { nums, indexDifference, valueDifference }, result, frames };
    }
    frames.push(frame({
      phase: "check", activeLine: 6, pythonLine: 12, i, j, mn, mx,
      message: `|nums[${mx}] - nums[${j}]| = ${highGap} < ${valueDifference}. Move to the next j.`,
      explanation: "Neither extreme works for this j.",
    }));
  }
  const result = [-1, -1];
  frames.push(frame({
    phase: "done", activeLine: 7, pythonLine: 14, mn, mx, result,
    message: "No pair satisfies both conditions. Return [-1, -1].",
    explanation: "Every eligible j was checked against the tracked extremes.",
  }));
  return { input: { nums, indexDifference, valueDifference }, result, frames };
}
