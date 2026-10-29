const PYTHON_LINES = [
  "def numberOfCuts(n):",
  "    if n == 1:",
  "        return 0",
  "    if n % 2 == 0:",
  "        return n // 2",
  "    return n",
];

const CODE_LINES = [
  "FUNCTION numberOfCuts(n)",
  "  IF n is 1 THEN",
  "    RETURN 0",
  "  IF n is even THEN",
  "    RETURN n divided by 2",
  "  RETURN n",
];

const MAX_SLICES = 100;

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
    throw new Error('Input must be a JSON object such as {"n": 4}');
  }
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) throw new Error("Input must be a JSON object with an n key");
  const { n } = obj;
  if (!Number.isInteger(n) || n < 1 || n > MAX_SLICES) throw new Error(`n must be an integer from 1 to ${MAX_SLICES}`);
  return { n };
}

export function buildTrace(input) {
  const { n } = input.n !== undefined ? input : parseInput(input);
  const frames = [];
  const snap = (phase, activeLine, pyKey, message, extra = {}) => frames.push({
    phase, activeLine, pythonLine: py(pyKey), message, n, slices: n, ...extra,
  });

  snap("check", 2, "if n == 1", `Is n = ${n} equal to 1?`);
  if (n === 1) {
    snap("done", 3, "return 0", "One slice needs no cuts. Return 0.", { result: 0, slices: 1 });
    return { input: { n }, result: 0, frames };
  }
  snap("even", 4, "if n % 2 == 0", n % 2 === 0 ? `${n} is even, so cuts through the center make pairs of slices.` : `${n} is odd, so every cut adds one slice.`);
  let result;
  if (n % 2 === 0) {
    result = n / 2;
    snap("done", 5, "return n // 2", `Each center cut makes two slices, so ${n} slices need ${result} cuts.`, { result });
  } else {
    result = n;
    frames.push({ phase: "done", activeLine: 6, pythonLine: PYTHON_LINES.length, message: `Each of the ${n} cuts adds one slice, so return ${result}.`, n, slices: n, result });
  }
  return { input: { n }, result, frames };
}
