const PYTHON_LINES = [
  "def maxJump(stones):",
  "    best = stones[1] - stones[0]",
  "    for i in range(len(stones) - 2):",
  "        best = max(best, stones[i + 2] - stones[i])",
  "    return best",
];

const CODE_LINES = [
  "FUNCTION maxJump(stones)",
  "  best <- stones[1] - stones[0]",
  "  FOR i from 0 to count - 3",
  "    best <- the larger of best and stones[i + 2] - stones[i]",
  "  RETURN best",
];

const MAX_STONES = 50;
const MAX_POSITION = 1000000;

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
    throw new Error('Input must be a JSON object such as {"stones": [0,2,5,6,7]}');
  }
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) throw new Error("Input must be a JSON object with a stones key");
  const { stones } = obj;
  if (!Array.isArray(stones)) throw new Error("stones must be an array of integers");
  if (stones.length < 2 || stones.length > MAX_STONES) throw new Error(`stones must contain between 2 and ${MAX_STONES} entries for this visualization`);
  stones.forEach((value, index) => {
    if (!Number.isInteger(value) || value < 0 || value > MAX_POSITION) throw new Error(`stones[${index}] must be an integer from 0 to ${MAX_POSITION}`);
    if (index > 0 && value <= stones[index - 1]) throw new Error("stones must be strictly increasing");
  });
  return { stones };
}

export function buildTrace(input) {
  const { stones } = input.stones ? input : parseInput(input);
  const frames = [];
  let best = stones[1] - stones[0];
  const snap = (phase, activeLine, pyKey, message, extra = {}) => frames.push({
    phase, activeLine, pythonLine: py(pyKey), message, i: -1, best, ...extra,
  });

  snap("setup", 2, "best = stones[1]", `The first jump is ${stones[1]} - ${stones[0]} = ${best}.`);
  for (let i = 0; i < stones.length - 2; i++) {
    snap("scan", 3, "for i in range", `Consider skipping stone ${i + 1}: jump from ${stones[i]} to ${stones[i + 2]}.`, { i });
    const jump = stones[i + 2] - stones[i];
    best = Math.max(best, jump);
    snap("update", 4, "best = max(", `The double jump costs ${jump}, so the best is ${best}.`, { i, jump, best });
  }
  snap("done", 5, "return best", `Return ${best}.`, { result: best, best });
  return { input: { stones }, result: best, frames };
}
