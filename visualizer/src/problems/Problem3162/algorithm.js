const PYTHON_LINES = [
  "def countGoodPairs(nums1, nums2, k):",
  "    count = 0",
  "    for x in nums1:",
  "        for y in nums2:",
  "            if x % (y * k) == 0:",
  "                count += 1",
  "    return count",
];

const CODE = [
  "FUNCTION countGoodPairs(nums1, nums2, k)",
  "    count ← 0",
  "    FOR each x IN nums1",
  "        FOR each y IN nums2",
  "            IF x is divisible by y × k",
  "                count ← count + 1",
  "    RETURN count",
];

export const code = CODE.map((text, index) => ({ line: index + 1, text }));
export const python = PYTHON_LINES.join("\n");

function readArray(value, name) {
  if (!Array.isArray(value) || value.length < 1 || value.length > 20) {
    throw new Error(`${name} must be an array of 1 to 20 integers for the visualization`);
  }
  if (value.some(v => !Number.isInteger(v) || v < 1 || v > 50)) {
    throw new Error(`${name} values must be integers between 1 and 50`);
  }
  return value;
}

export function parseInput(text) {
  let data = text;
  if (typeof text === "string") {
    try {
      data = JSON.parse(text);
    } catch (error) {
      throw new Error(`Input must be valid JSON: ${error.message}`);
    }
  }
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error('Input must be a JSON object like {"nums1": [1,3,4], "nums2": [1,3,4], "k": 1}');
  }
  const nums1 = readArray(data.nums1, "nums1");
  const nums2 = readArray(data.nums2, "nums2");
  if (!Number.isInteger(data.k) || data.k < 1 || data.k > 50) {
    throw new Error("k must be an integer between 1 and 50");
  }
  return { nums1, nums2, k: data.k };
}

export function buildTrace(input) {
  const { nums1, nums2, k } = parseInput(input);
  const frames = [];
  let count = 0;
  const push = (frame) => frames.push({ nums1, nums2, k, count, i: -1, j: -1, ...frame });

  push({ phase: "setup", activeLine: 2, pythonLine: 2, message: "Start with zero good pairs." });
  for (let i = 0; i < nums1.length; i += 1) {
    push({ phase: "outer", activeLine: 3, pythonLine: 3, i, message: `Take x = nums1[${i}] = ${nums1[i]}.` });
    for (let j = 0; j < nums2.length; j += 1) {
      push({ phase: "inner", activeLine: 4, pythonLine: 4, i, j, message: `Take y = nums2[${j}] = ${nums2[j]}.` });
      const divisor = nums2[j] * k;
      const good = nums1[i] % divisor === 0;
      push({ phase: "check", activeLine: 5, pythonLine: 5, i, j, message: `${nums1[i]} % (${nums2[j]} × ${k}) = ${nums1[i] % divisor}.` });
      if (good) {
        count += 1;
        push({ phase: "check", activeLine: 6, pythonLine: 6, i, j, message: `Good pair (${i}, ${j}); count is now ${count}.` });
      }
    }
  }
  push({ phase: "done", activeLine: 7, pythonLine: 7, message: `Return ${count}.`, result: count });

  return { input: { nums1, nums2, k }, result: count, frames };
}
