export const PYTHON_LINES = [
  "def sumOfMultiples(n):",
  "    total = 0",
  "    for x in range(1, n + 1):",
  "        if x % 3 == 0 or x % 5 == 0 or x % 7 == 0:",
  "            total += x",
  "    return total",
];
export const python = PYTHON_LINES.join("\n");
export const CODE = [
  "SUM-MULTIPLES(n)",
  "total <- 0",
  "for x from 1 to n",
  "if x is divisible by 3, 5, or 7",
  "total <- total + x",
  "return total",
];
export const code = CODE.map((text, index) => ({ line: index + 1, text }));

export function parseInput(text) {
  const obj = typeof text === "string" ? JSON.parse(text) : text;
  if (obj === null || typeof obj !== "object" || Array.isArray(obj)) {
    throw new Error('Input must be a JSON object such as {"n": 7}.');
  }
  const { n } = obj;
  if (!Number.isInteger(n) || n < 1 || n > 1000) {
    throw new Error("n must be an integer from 1 to 1000.");
  }
  return { n };
}

export function buildTrace(input) {
  const { n } = input;
  const frames = [];
  let total = 0;
  frames.push({
    phase: "init", activeLine: 2, pythonLine: 2, x: 0, total, hit: null,
    message: "Start with total = 0.",
  });
  for (let x = 1; x <= n; x++) {
    frames.push({
      phase: "loop", activeLine: 3, pythonLine: 3, x, total, hit: null,
      message: `Visit x = ${x}.`,
    });
    const hit = x % 3 === 0 || x % 5 === 0 || x % 7 === 0;
    frames.push({
      phase: "check", activeLine: 4, pythonLine: 4, x, total, hit,
      message: hit
        ? `${x} is divisible by 3, 5, or 7, so it is added.`
        : `${x} is not divisible by 3, 5, or 7, so it is skipped.`,
    });
    if (hit) {
      total += x;
      frames.push({
        phase: "add", activeLine: 5, pythonLine: 5, x, total, hit,
        message: `total becomes ${total}.`,
      });
    }
  }
  frames.push({
    phase: "done", activeLine: 6, pythonLine: 6, x: n, total, hit: null, result: total,
    message: `Return ${total}.`,
  });
  return { input, result: total, frames };
}
