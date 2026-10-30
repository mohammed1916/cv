const PYTHON_LINES = [
  "def minimumSum(nums):",
  "    n = len(nums)",
  "    best = -1",
  "    for j in range(1, n - 1):",
  "        left_min = None",
  "        for i in range(j):",
  "            if nums[i] < nums[j] and (left_min is None or nums[i] < left_min):",
  "                left_min = nums[i]",
  "        right_min = None",
  "        for k in range(j + 1, n):",
  "            if nums[k] < nums[j] and (right_min is None or nums[k] < right_min):",
  "                right_min = nums[k]",
  "        if left_min is not None and right_min is not None:",
  "            total = left_min + nums[j] + right_min",
  "            if best == -1 or total < best:",
  "                best = total",
  "    return best",
];

export const python = PYTHON_LINES.join("\n");

export const code = [
  { line: 1, text: "Read n as the length of nums; set best = -1" },
  { line: 2, text: "For each peak index j from 1 to n - 2" },
  { line: 3, text: "Find the smallest value left of j that is below nums[j]" },
  { line: 4, text: "Find the smallest value right of j that is below nums[j]" },
  { line: 5, text: "If both exist, total = left + nums[j] + right; keep the smaller total in best" },
  { line: 6, text: "Return best" },
];

const LIMITS = { minLength: 3, maxLength: 50, minValue: 1, maxValue: 50 };

export function parseInput(text) {
  let data = text;
  if (typeof text === "string") {
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error('Input must be a JSON object such as {"nums":[8,6,1,5,3]}');
    }
  }
  if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error("Input must be a JSON object");
  const { nums } = data;
  if (!Array.isArray(nums)) throw new Error("nums must be an array of integers");
  if (nums.length < LIMITS.minLength || nums.length > LIMITS.maxLength) {
    throw new Error(`nums must have between ${LIMITS.minLength} and ${LIMITS.maxLength} values`);
  }
  nums.forEach((value, index) => {
    if (!Number.isInteger(value) || value < LIMITS.minValue || value > LIMITS.maxValue) {
      throw new Error(`nums[${index}] must be an integer from ${LIMITS.minValue} to ${LIMITS.maxValue}`);
    }
  });
  return { nums: [...nums] };
}

function frame(fields) {
  return { result: null, j: null, leftMin: null, rightMin: null, best: -1, explanation: "", ...fields };
}

export function buildTrace(input) {
  const { nums } = parseInput(input);
  const n = nums.length;
  const frames = [];
  let best = -1;
  frames.push(frame({
    phase: "setup", activeLine: 1, pythonLine: 2, best,
    message: `n = ${n}. best starts at -1, meaning no mountain yet.`,
    explanation: "A mountain is a triplet i < j < k where nums[j] is larger than both outer values.",
  }));
  for (let j = 1; j < n - 1; j += 1) {
    frames.push(frame({
      phase: "peak", activeLine: 2, pythonLine: 4, j, best,
      message: `Peak candidate j = ${j} with value ${nums[j]}.`,
      explanation: `Look for the cheapest valid left and right partners around index ${j}.`,
    }));
    let leftMin = null;
    for (let i = 0; i < j; i += 1) {
      if (nums[i] < nums[j] && (leftMin === null || nums[i] < leftMin)) leftMin = nums[i];
    }
    frames.push(frame({
      phase: "left", activeLine: 3, pythonLine: 8, j, leftMin, best,
      message: leftMin === null ? `No value left of ${j} is below ${nums[j]}.` : `Smallest left partner below ${nums[j]} is ${leftMin}.`,
      explanation: "Only values strictly smaller than the peak can form the left side.",
    }));
    let rightMin = null;
    for (let k = j + 1; k < n; k += 1) {
      if (nums[k] < nums[j] && (rightMin === null || nums[k] < rightMin)) rightMin = nums[k];
    }
    frames.push(frame({
      phase: "right", activeLine: 4, pythonLine: 12, j, leftMin, rightMin, best,
      message: rightMin === null ? `No value right of ${j} is below ${nums[j]}.` : `Smallest right partner below ${nums[j]} is ${rightMin}.`,
      explanation: "The same test on the right side gives the cheapest right partner.",
    }));
    if (leftMin !== null && rightMin !== null) {
      const total = leftMin + nums[j] + rightMin;
      if (best === -1 || total < best) best = total;
      frames.push(frame({
        phase: "record", activeLine: 5, pythonLine: 16, j, leftMin, rightMin, best,
        message: `Total ${leftMin} + ${nums[j]} + ${rightMin} = ${total}; best is now ${best}.`,
        explanation: "The smaller of the old best and this total is kept.",
      }));
    } else {
      frames.push(frame({
        phase: "record", activeLine: 5, pythonLine: 13, j, leftMin, rightMin, best,
        message: "This peak has no complete mountain; best is unchanged.",
        explanation: "A mountain needs a partner on both sides.",
      }));
    }
  }
  const result = best;
  frames.push(frame({
    phase: "done", activeLine: 6, pythonLine: 17, result, best,
    message: `Return ${result}.`,
    explanation: result === -1 ? "No peak had partners on both sides." : "The smallest total across all peaks is returned.",
  }));
  return { input: { nums }, result, frames };
}
