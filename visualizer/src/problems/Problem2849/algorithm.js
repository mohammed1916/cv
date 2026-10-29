const PYTHON_LINES = [
  "def isReachableAtTime(sx, sy, fx, fy, t):",
  "    dx = abs(fx - sx)",
  "    dy = abs(fy - sy)",
  "    if dx == 0 and dy == 0:",
  "        return t != 1",
  "    return max(dx, dy) <= t",
];

const CODE_LINES = [
  "dx <- |fx - sx|",
  "dy <- |fy - sy|",
  "if the start equals the finish",
  "  return t is not 1",
  "return max(dx, dy) is at most t",
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
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("Input must be a JSON object with sx, sy, fx, fy and t.");
  const { sx, sy, fx, fy, t } = input;
  for (const [name, value, lo, hi] of [["sx", sx, 1, 1e9], ["sy", sy, 1, 1e9], ["fx", fx, 1, 1e9], ["fy", fy, 1, 1e9], ["t", t, 0, 1e9]]) {
    if (!Number.isInteger(value) || value < lo || value > hi) throw new Error(`${name} must be an integer from ${lo} to ${hi}.`);
  }
  return { sx, sy, fx, fy, t };
}

export function buildTrace(input) {
  const { sx, sy, fx, fy, t } = parseInput(input);
  const frames = [];
  const push = (phase, activeLine, pythonLine, message, extra = {}) => frames.push({
    phase, activeLine, pythonLine, message, values: [0, 0, 0], active: -1, roles: ["", "", ""], detail: "", ...extra,
  });

  const dx = Math.abs(fx - sx);
  push("distance", 1, py("dx = abs(fx - sx)"), `Horizontal distance |${fx} - ${sx}| = ${dx}.`, { values: [dx, 0, t], active: 0, roles: ["current", "", ""], detail: `dx = ${dx}` });
  const dy = Math.abs(fy - sy);
  push("distance", 2, py("dy = abs(fy - sy)"), `Vertical distance |${fy} - ${sy}| = ${dy}.`, { values: [dx, dy, t], active: 1, roles: ["", "current", ""], detail: `dy = ${dy}` });
  if (dx === 0 && dy === 0) {
    const result = t !== 1;
    push("check", 3, py("if dx == 0 and dy == 0:"), "Start equals finish, so a move is required.", { values: [dx, dy, t], active: 2, roles: ["", "", "current"] });
    push("result", 4, py("return t != 1"), `Start equals finish, so the answer is ${result} for t = ${t}.`, { values: [dx, dy, t], active: 2, roles: ["", "", "current"], detail: `return ${result}` });
    return { input: { sx, sy, fx, fy, t }, result, frames };
  }
  push("check", 3, py("if dx == 0 and dy == 0:"), "Start differs from finish.", { values: [dx, dy, t], active: -1, roles: ["", "", ""] });
  const need = Math.max(dx, dy);
  const result = need <= t;
  push("result", 5, py("return max(dx, dy) <= t"),
    `Need max(${dx}, ${dy}) = ${need} diagonal-or-straight steps; t = ${t} gives answer ${result}.`,
    { values: [dx, dy, t], active: 2, roles: ["", "", "current"], detail: `return ${result}` });
  return { input: { sx, sy, fx, fy, t }, result, frames };
}
