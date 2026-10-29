const PYTHON_LINES = [
  "def hasValidPath(grid):",
  "    m, n = len(grid), len(grid[0])",
  "    conn = {1: \"LR\", 2: \"UD\", 3: \"LD\", 4: \"RD\", 5: \"LU\", 6: \"RU\"}",
  "    delta = {\"R\": (0, 1), \"L\": (0, -1), \"D\": (1, 0), \"U\": (-1, 0)}",
  "    opposite = {\"R\": \"L\", \"L\": \"R\", \"D\": \"U\", \"U\": \"D\"}",
  "    seen = {(0, 0)}",
  "    stack = [(0, 0)]",
  "    while stack:",
  "        r, c = stack.pop()",
  "        if (r, c) == (m - 1, n - 1):",
  "            return True",
  "        for d in conn[grid[r][c]]:",
  "            dr, dc = delta[d]",
  "            nr, nc = r + dr, c + dc",
  "            if 0 <= nr < m and 0 <= nc < n and (nr, nc) not in seen and opposite[d] in conn[grid[nr][nc]]:",
  "                seen.add((nr, nc))",
  "                stack.append((nr, nc))",
  "    return False",
];

export const python = PYTHON_LINES.join("\n");

export const code = [
  { line: 1, text: "m, n = grid size; open sides of each street type" },
  { line: 2, text: "seen = {(0,0)}; stack = [(0,0)]" },
  { line: 3, text: "while stack is not empty:" },
  { line: 4, text: "(r, c) = pop the stack" },
  { line: 5, text: "if (r, c) is the bottom-right cell: return true" },
  { line: 6, text: "for each open side d of the street at (r, c):" },
  { line: 7, text: "neighbour = the cell one step toward d" },
  { line: 8, text: "if neighbour is inside, unseen, and has the opposite side open: mark it and push it" },
  { line: 9, text: "return false" },
];

export const pythonLineMap = { 1: 3, 2: 6, 3: 7, 4: 8, 5: 10, 6: 12, 7: 14, 8: 15, 9: 18 };

export const examples = [
  { label: "Reachable", input: '{"grid":[[2,4,3],[6,5,2]]}' },
  { label: "Blocked start", input: '{"grid":[[1,2,1],[1,2,1]]}' },
  { label: "Stuck middle", input: '{"grid":[[1,1,2]]}' },
];

const CONN = { 1: "LR", 2: "UD", 3: "LD", 4: "RD", 5: "LU", 6: "RU" };
const DELTA = { R: [0, 1], L: [0, -1], D: [1, 0], U: [-1, 0] };
const OPPOSITE = { R: "L", L: "R", D: "U", U: "D" };

export function parseInput(text) {
  let data;
  try {
    data = typeof text === "string" ? JSON.parse(text) : text;
  } catch {
    throw new Error('Input must be a JSON object, e.g. {"grid":[[2,4,3],[6,5,2]]}');
  }
  if (data === null || typeof data !== "object" || Array.isArray(data)) throw new Error("Input must be a JSON object with a grid array");
  const { grid } = data;
  if (!Array.isArray(grid) || grid.length < 1 || !Array.isArray(grid[0]) || grid[0].length < 1) throw new Error("grid must be a non-empty array of rows");
  const cols = grid[0].length;
  if (grid.length > 12 || cols > 12) throw new Error(`grid is ${grid.length}x${cols}; the visualization caps each side at 12`);
  grid.forEach((row, r) => {
    if (!Array.isArray(row) || row.length !== cols) throw new Error(`grid row ${r} must have ${cols} cells`);
    row.forEach((v, c) => {
      if (!Number.isInteger(v) || v < 1 || v > 6) throw new Error(`grid[${r}][${c}] must be an integer from 1 to 6`);
    });
  });
  return { grid: grid.map(row => [...row]) };
}

export function buildTrace(input) {
  const grid = input.grid;
  const m = grid.length;
  const n = grid[0].length;
  const key = (r, c) => `${r},${c}`;
  const frames = [];
  const seen = new Set([key(0, 0)]);
  const seenList = [[0, 0]];
  const stack = [[0, 0]];
  const done = [];
  const frame = (phase, activeLine, message, current, neighbour, ok = null) =>
    frames.push({ phase, activeLine, message, current, neighbour, visited: seenList.map(p => [...p]), frontier: stack.map(p => [...p]), done: done.map(p => [...p]), ok });
  frame("start", 2, "Start at the top-left cell.", null, null);
  let result = false;
  while (stack.length) {
    frame("search", 3, "The stack is not empty.", null, null);
    const [r, c] = stack.pop();
    frame("search", 4, `Pop cell (${r},${c}).`, [r, c], null);
    if (r === m - 1 && c === n - 1) {
      result = true;
      frame("search", 5, "Reached the bottom-right cell.", [r, c], null, true);
      break;
    }
    done.push([r, c]);
    for (const d of CONN[grid[r][c]]) {
      frame("search", 6, `Street at (${r},${c}) opens ${d}.`, [r, c], null);
      const [dr, dc] = DELTA[d];
      const nr = r + dr;
      const nc = c + dc;
      const inside = nr >= 0 && nr < m && nc >= 0 && nc < n;
      const linked = inside && CONN[grid[nr][nc]].includes(OPPOSITE[d]);
      if (inside && !seen.has(key(nr, nc)) && linked) {
        seen.add(key(nr, nc));
        seenList.push([nr, nc]);
        stack.push([nr, nc]);
        frame("search", 8, `Cell (${nr},${nc}) opens ${OPPOSITE[d]} back; mark and push it.`, [r, c], [nr, nc]);
      } else {
        frame("search", 8, inside ? `Cell (${nr},${nc}) is seen or does not connect back.` : "That neighbour is outside the grid.", [r, c], inside ? [nr, nc] : null);
      }
    }
  }
  frame("done", 9, result ? "A valid path exists." : "No valid path reaches the bottom-right cell.", null, null, result);
  return { input, result, frames };
}
