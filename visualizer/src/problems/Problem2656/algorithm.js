export const PYTHON_LINES = [
  "def maximizeSum(nums, k):",
  "    best = max(nums)",
  "    score = 0",
  "    for _ in range(k):",
  "        score += best",
  "        best += 1",
  "    return score",
];
export const python = PYTHON_LINES.join("\n");
export const CODE = [
  "MAXIMIZE-SUM(nums, k)",
  "best <- largest value in nums",
  "score <- 0",
  "repeat k times",
  "score <- score + best",
  "best <- best + 1",
  "return score",
];
export const code = CODE.map((text, index) => ({ line: index + 1, text }));

export function parseInput(text) {
  const obj = typeof text === "string" ? JSON.parse(text) : text;
  if (obj === null || typeof obj !== "object" || Array.isArray(obj)) {
    throw new Error('Input must be a JSON object such as {"nums": [1, 2, 3], "k": 2}.');
  }
  const { nums, k } = obj;
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 100) {
    throw new Error("nums must be an array of 1 to 100 integers.");
  }
  if (!nums.every((v) => Number.isInteger(v) && v >= 1 && v <= 100)) {
    throw new Error("Each element of nums must be an integer from 1 to 100.");
  }
  if (!Number.isInteger(k) || k < 1 || k > 100) {
    throw new Error("k must be an integer from 1 to 100.");
  }
  return { nums, k };
}

export function buildTrace(input) {
  const { nums, k } = input;
  const frames = [];
  let best = Math.max(...nums);
  let score = 0;
  frames.push({
    phase: "init", activeLine: 2, pythonLine: 2, best, score, step: 0,
    message: `The current maximum is ${best}.`,
  });
  frames.push({
    phase: "init", activeLine: 3, pythonLine: 3, best, score, step: 0,
    message: "Start with score = 0.",
  });
  for (let i = 1; i <= k; i++) {
    frames.push({
      phase: "loop", activeLine: 4, pythonLine: 4, best, score, step: i,
      message: `Operation ${i} of ${k}.`,
    });
    score += best;
    frames.push({
      phase: "pick", activeLine: 5, pythonLine: 5, best, score, step: i,
      message: `Pick ${best}; score becomes ${score}.`,
    });
    best += 1;
    frames.push({
      phase: "bump", activeLine: 6, pythonLine: 6, best, score, step: i,
      message: `Replace it with ${best}, which is the new maximum.`,
    });
  }
  frames.push({
    phase: "done", activeLine: 7, pythonLine: 7, best, score, step: k, result: score,
    message: `Return ${score}.`,
  });
  return { input, result: score, frames };
}
