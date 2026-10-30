export const code = [
  { line: 1, text: "minimum operations (nums, k):" },
  { line: 2, text: "  set operations to 0" },
  { line: 3, text: "  for each value x in nums" },
  { line: 4, text: "    if x is less than k" },
  { line: 5, text: "      add 1 to operations" },
  { line: 6, text: "  return operations" },
];

export const python = `def minOperations(nums, k):
    operations = 0
    for x in nums:
        if x < k:
            operations += 1
    return operations`;

export function parseInput(text) {
  let obj;
  try {
    obj = JSON.parse(text);
  } catch {
    throw new Error("Input must be a JSON object with nums and k");
  }
  if (!obj || typeof obj !== "object" || !Array.isArray(obj.nums)) {
    throw new Error("nums must be an array of integers");
  }
  if (!Number.isInteger(obj.k)) {
    throw new Error("k must be an integer");
  }
  if (obj.nums.length < 1 || obj.nums.length > 50) {
    throw new Error(`nums length (${obj.nums.length}) must be between 1 and 50 for this visualization`);
  }
  if (obj.nums.some((x) => !Number.isInteger(x))) {
    throw new Error("every value in nums must be an integer");
  }
  return { nums: obj.nums, k: obj.k };
}

export function buildTrace(input) {
  const { nums, k } = input;
  const frames = [];
  const counted = [];
  let operations = 0;
  frames.push({ phase: "start", activeLine: 2, pythonLine: 2, message: "Start with zero operations.", index: -1, counted: [], operations });
  for (let i = 0; i < nums.length; i++) {
    frames.push({ phase: "scan", activeLine: 3, pythonLine: 3, message: `Look at nums[${i}] = ${nums[i]}.`, index: i, counted: [...counted], operations });
    const below = nums[i] < k;
    frames.push({ phase: "check", activeLine: 4, pythonLine: 4, message: `${nums[i]} < ${k}? ${below ? "yes" : "no"}.`, index: i, counted: [...counted], operations });
    if (below) {
      operations += 1;
      counted.push(i);
      frames.push({ phase: "count", activeLine: 5, pythonLine: 5, message: `One more operation is needed. operations = ${operations}.`, index: i, counted: [...counted], operations });
    }
  }
  frames.push({ phase: "done", activeLine: 6, pythonLine: 6, message: `Return ${operations}.`, index: -1, counted: [...counted], operations });
  return { input, result: operations, frames };
}
