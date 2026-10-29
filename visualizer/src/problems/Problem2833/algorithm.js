const PYTHON_LINES = [
  "def furthestDistanceFromOrigin(moves):",
  "    left = moves.count(\"L\")",
  "    right = moves.count(\"R\")",
  "    free = moves.count(\"_\")",
  "    return abs(left - right) + free",
];

const CODE_LINES = [
  "left <- number of 'L' in moves",
  "right <- number of 'R' in moves",
  "free <- number of '_' in moves",
  "return |left - right| + free",
];

export const python = PYTHON_LINES.join("\n");
export const code = CODE_LINES.map((text, index) => ({ line: index + 1, text }));

const py = text => {
  const index = PYTHON_LINES.findIndex(line => line.trim() === text);
  if (index < 0) throw new Error(`missing Python line: ${text}`);
  return index + 1;
};

export function parseInput(text) {
  const input = typeof text === "string" ? JSON.parse(text) : text;
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("Input must be a JSON object with a moves string.");
  const { moves } = input;
  if (typeof moves !== "string") throw new Error("moves must be a string.");
  if (moves.length < 1 || moves.length > 50) throw new Error(`moves length must be between 1 and 50 (got ${moves.length}).`);
  if (!/^[LR_]+$/.test(moves)) throw new Error("moves may contain only 'L', 'R' and '_'.");
  return { moves };
}

export function buildTrace(input) {
  const { moves } = parseInput(input);
  const chars = moves.split("");
  const frames = [];
  const push = (phase, activeLine, pythonLine, message, extra = {}) => frames.push({
    phase, activeLine, pythonLine, message, values: chars, active: -1, roles: Array(chars.length).fill(""), detail: "", ...extra,
  });
  const mark = ch => chars.map(c => (c === ch ? "counted" : ""));

  const left = chars.filter(c => c === "L").length;
  push("count", 1, py("left = moves.count(\"L\")"), `There are ${left} fixed left moves.`, { detail: `left = ${left}`, roles: mark("L") });
  const right = chars.filter(c => c === "R").length;
  push("count", 2, py("right = moves.count(\"R\")"), `There are ${right} fixed right moves.`, { detail: `right = ${right}`, roles: mark("R") });
  const free = chars.filter(c => c === "_").length;
  push("count", 3, py("free = moves.count(\"_\")"), `There are ${free} free moves that can go either way.`, { detail: `free = ${free}`, roles: mark("_") });
  const result = Math.abs(left - right) + free;
  push("result", 4, py("return abs(left - right) + free"),
    `Fixed moves cancel to |${left} - ${right}| = ${Math.abs(left - right)}; add the ${free} free moves to push away from the origin.`,
    { detail: `return ${result}` });
  return { input: { moves }, result, frames };
}
