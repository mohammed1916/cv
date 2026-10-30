const PYTHON_LINES = [
  "def findIndices(nums, indexDifference, valueDifference):",
  "    n = len(nums)",
  "    for i in range(n):",
  "        for j in range(n):",
  "            if abs(i - j) >= indexDifference and abs(nums[i] - nums[j]) >= valueDifference:",
  "                return [i, j]",
  "    return [-1, -1]",
];

export const python = PYTHON_LINES.join("\n");

export const code = [
  { line: 1, text: "Read n as the length of nums" },
  { line: 2, text: "For each index i from 0 to n - 1" },
  { line: 3, text: "For each index j from 0 to n - 1" },
  { line: 4, text: "If |i - j| >= indexDifference and |nums[i] - nums[j]| >= valueDifference" },
  { line: 5, text: "Return [i, j]" },
  { line: 6, text: "Return [-1, -1]" },
];

const LIMITS = { maxLength: 100, maxValue: 50, maxIndexDifference: 100, maxValueDifference: 50 };

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
  return { result: null, i: null, j: null, indexOk: null, valueOk: null, explanation: "", ...fields };
}

export function buildTrace(input) {
  const { nums, indexDifference, valueDifference } = parseInput(input);
  const n = nums.length;
  const frames = [];
  frames.push(frame({
    phase: "setup", activeLine: 1, pythonLine: 2,
    message: `n = ${n}. Check every ordered pair (i, j).`,
    explanation: "The brute force compares every ordered pair, so the first pair that satisfies both gaps is returned.",
  }));
  for (let i = 0; i < n; i += 1) {
    frames.push(frame({
      phase: "loop", activeLine: 2, pythonLine: 3, i,
      message: `Outer index i = ${i}.`,
      explanation: `Start scanning partners j for i = ${i}.`,
    }));
    for (let j = 0; j < n; j += 1) {
      const indexOk = Math.abs(i - j) >= indexDifference;
      const valueOk = Math.abs(nums[i] - nums[j]) >= valueDifference;
      frames.push(frame({
        phase: "check", activeLine: 4, pythonLine: 5, i, j, indexOk, valueOk,
        message: `Pair (${i}, ${j}): index gap ${Math.abs(i - j)} ${indexOk ? ">=" : "<"} ${indexDifference}, value gap ${Math.abs(nums[i] - nums[j])} ${valueOk ? ">=" : "<"} ${valueDifference}.`,
        explanation: indexOk && valueOk ? "Both conditions hold, so this pair is the answer." : "At least one condition fails; move on.",
      }));
      if (indexOk && valueOk) {
        const result = [i, j];
        frames.push(frame({
          phase: "done", activeLine: 5, pythonLine: 6, i, j, indexOk, valueOk, result,
          message: `Return [${i}, ${j}].`,
          explanation: "The first qualifying pair in scan order is returned.",
        }));
        return { input: { nums, indexDifference, valueDifference }, result, frames };
      }
    }
  }
  const result = [-1, -1];
  frames.push(frame({
    phase: "done", activeLine: 6, pythonLine: 7, result,
    message: "No pair satisfies both conditions. Return [-1, -1].",
    explanation: "Every pair was checked and none qualified.",
  }));
  return { input: { nums, indexDifference, valueDifference }, result, frames };
}
