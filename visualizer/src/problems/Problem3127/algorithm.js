const PYTHON_LINES = [
  "def canMakeSquare(grid):",
  "    for r in range(2):",
  "        for c in range(2):",
  '            cells = [grid[r][c], grid[r][c + 1], grid[r + 1][c], grid[r + 1][c + 1]]',
  '            if cells.count("B") != 2:',
  "                return True",
  "    return False",
];

const CODE = [
  "FUNCTION canMakeSquare(grid)",
  "    FOR each top row r FROM 0 TO 1",
  "        FOR each left column c FROM 0 TO 1",
  "            cells ← the four cells of the 2 by 2 square at (r, c)",
  '            IF count of "B" in cells is not 2',
  "                RETURN true",
  "    RETURN false",
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
    throw new Error('Input must be a JSON object like {"grid": [["B","W","B"],...]}');
  }
  const { grid } = data;
  if (!Array.isArray(grid) || grid.length !== 3 || grid.some(row => !Array.isArray(row) || row.length !== 3)) {
    throw new Error("grid must be a 3 by 3 array of rows");
  }
  if (grid.some(row => row.some(cell => cell !== "B" && cell !== "W"))) {
    throw new Error('Every cell must be "B" or "W"');
  }
  return { grid };
}

export function buildTrace(input) {
  const { grid } = parseInput(input);
  const frames = [];
  const window = (r, c) => {
    const cells = [];
    for (let i = 0; i < 9; i += 1) {
      const row = Math.floor(i / 3);
      const col = i % 3;
      if (row >= r && row <= r + 1 && col >= c && col <= c + 1) cells.push(i);
    }
    return cells;
  };
  const push = (frame) => frames.push({ grid, square: null, cells: [], index: -1, ...frame });

  push({ phase: "setup", activeLine: 1, pythonLine: 1, message: "Check each 2 by 2 square in the 3 by 3 grid." });
  let result = false;
  outer:
  for (let r = 0; r <= 1; r += 1) {
    push({ phase: "scan", activeLine: 2, pythonLine: 2, square: [r, -1], message: `Top row r = ${r}.` });
    for (let c = 0; c <= 1; c += 1) {
      const cells = window(r, c);
      const values = cells.map(i => grid[Math.floor(i / 3)][i % 3]);
      const blackCount = values.filter(v => v === "B").length;
      push({ phase: "scan", activeLine: 3, pythonLine: 3, square: [r, c], cells, message: `Left column c = ${c}; square at (${r}, ${c}).` });
      push({ phase: "check", activeLine: 4, pythonLine: 4, square: [r, c], cells, message: `Cells ${values.join(", ")} hold ${blackCount} "B".` });
      if (blackCount !== 2) {
        result = true;
        push({ phase: "done", activeLine: 5, pythonLine: 5, square: [r, c], cells, message: "Changing at most one cell makes this square one color. Return true.", result });
        break outer;
      }
    }
  }
  if (!result) {
    push({ phase: "done", activeLine: 6, pythonLine: 6, message: "No square has 1 or 3 blue cells. Return false.", result });
  }
  return { input: { grid }, result, frames };
}
