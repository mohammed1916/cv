const PYTHON_LINES = [
  "def numberOfAlternatingGroups(colors):",
  "    n = len(colors)",
  "    count = 0",
  "    for i in range(n):",
  "        left = colors[(i - 1) % n]",
  "        middle = colors[i]",
  "        right = colors[(i + 1) % n]",
  "        if middle != left and middle != right:",
  "            count += 1",
  "    return count",
];

const CODE = [
  "FUNCTION numberOfAlternatingGroups(colors)",
  "    n ← length of colors",
  "    count ← 0",
  "    FOR each position i FROM 0 TO n − 1",
  "        left ← colors at i − 1, wrapping around the circle",
  "        middle ← colors at i",
  "        right ← colors at i + 1, wrapping around the circle",
  "        IF middle differs from left AND middle differs from right",
  "            count ← count + 1",
  "    RETURN count",
];

export const code = CODE.map((text, index) => ({ line: index + 1, text }));
export const python = PYTHON_LINES.join("\n");

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
    throw new Error('Input must be a JSON object like {"colors": [0,1,0,0,1]}');
  }
  const { colors } = data;
  if (!Array.isArray(colors) || colors.length < 3 || colors.length > 100) {
    throw new Error("colors must be an array of 3 to 100 values");
  }
  if (colors.some(v => v !== 0 && v !== 1)) {
    throw new Error("Each color must be 0 (red) or 1 (blue)");
  }
  return { colors };
}

export function buildTrace(input) {
  const { colors } = parseInput(input);
  const n = colors.length;
  const frames = [];
  let count = 0;
  const push = (frame) => frames.push({ colors, n, count, index: -1, window: [], ...frame });

  push({ phase: "setup", activeLine: 2, pythonLine: 2, message: `The circle has ${n} tiles.` });
  push({ phase: "setup", activeLine: 3, pythonLine: 3, message: "Start with zero alternating groups." });
  for (let i = 0; i < n; i += 1) {
    const left = (i - 1 + n) % n;
    const right = (i + 1) % n;
    const win = [left, i, right];
    push({ phase: "scan", activeLine: 4, pythonLine: 4, index: i, window: win, message: `Center at tile ${i}.` });
    push({ phase: "scan", activeLine: 5, pythonLine: 5, index: i, window: win, message: `Left neighbour is tile ${left} (${colors[left]}).` });
    push({ phase: "scan", activeLine: 6, pythonLine: 6, index: i, window: win, message: `Middle tile ${i} is ${colors[i]}.` });
    push({ phase: "scan", activeLine: 7, pythonLine: 7, index: i, window: win, message: `Right neighbour is tile ${right} (${colors[right]}).` });
    const alternating = colors[i] !== colors[left] && colors[i] !== colors[right];
    push({ phase: "check", activeLine: 8, pythonLine: 8, index: i, window: win, message: alternating ? "Middle differs from both neighbours." : "Middle matches a neighbour." });
    if (alternating) {
      count += 1;
      push({ phase: "check", activeLine: 9, pythonLine: 9, index: i, window: win, message: `Alternating group found; count is ${count}.` });
    }
  }
  push({ phase: "done", activeLine: 10, pythonLine: 10, message: `Return ${count}.`, result: count });

  return { input: { colors }, result: count, frames };
}
