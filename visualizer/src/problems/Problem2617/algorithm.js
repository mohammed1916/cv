const CODE = [
  "FUNCTION minVisitedCells(grid)",
  "    m, n ← dimensions of grid; dist[r][c] ← infinity for every cell",
  "    dist[0][0] ← 1",
  "    FOR r FROM 0 TO m − 1",
  "        FOR c FROM 0 TO n − 1",
  "            IF (r, c) is not the start THEN",
  "                FOR each p < c in row r with p + grid[r][p] ≥ c: dist[r][c] ← min(dist[r][c], dist[r][p] + 1)",
  "                FOR each q < r in column c with q + grid[q][c] ≥ r: dist[r][c] ← min(dist[r][c], dist[q][c] + 1)",
  "    RETURN dist[m − 1][n − 1] if finite, else −1",
];
export const code = CODE.map((text, index) => ({ line: index + 1, text }));
export const python = `def minVisitedCells(grid):
    m, n = len(grid), len(grid[0])
    INF = float("inf")
    dist = [[INF] * n for _ in range(m)]
    dist[0][0] = 1
    for r in range(m):
        for c in range(n):
            if r == 0 and c == 0:
                continue
            for p in range(c):
                if p + grid[r][p] >= c:
                    dist[r][c] = min(dist[r][c], dist[r][p] + 1)
            for q in range(r):
                if q + grid[q][c] >= r:
                    dist[r][c] = min(dist[r][c], dist[q][c] + 1)
    return dist[m - 1][n - 1] if dist[m - 1][n - 1] != INF else -1
`;
export const pythonLineMap = { 1: 1, 2: 4, 3: 5, 4: 6, 5: 7, 6: 8, 7: 9, 8: 12, 9: 15 };

const snapshot = table => table.map(row => row.map(cell => (Array.isArray(cell) ? [...cell] : cell)));
function emit(frames, table, info, write = false) {
  if (write) table[info.row][info.column] = info.value;
  frames.push({ phase: info.phase, activeLine: info.line, message: info.message, row: info.row, column: info.column, value: info.value, table: snapshot(table) });
}

export function parseInput(text) {
  let data;
  try { data = typeof text === "string" ? JSON.parse(text) : text; }
  catch { throw new Error('Input must be valid JSON, for example {"grid": [[2, 1, 0], [1, 0, 0]]}.'); }
  if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error("Input must be a JSON object with key grid.");
  const { grid } = data;
  if (!Array.isArray(grid) || grid.length < 1 || grid.length > 8) throw new Error("grid must have 1 to 8 rows (visualization cap).");
  const width = Array.isArray(grid[0]) ? grid[0].length : 0;
  if (width < 1 || width > 8) throw new Error("grid rows must have 1 to 8 columns (visualization cap).");
  if (!grid.every(row => Array.isArray(row) && row.length === width && row.every(v => Number.isInteger(v) && v >= 0 && v <= 99))) {
    throw new Error("grid must be rectangular, and every cell must be an integer from 0 to 99.");
  }
  return { grid };
}

export function buildTrace(input) {
  const { grid } = input;
  const m = grid.length, n = grid[0].length;
  const dist = Array.from({ length: m }, () => Array(n).fill(Infinity));
  const table = Array.from({ length: m }, () => Array(n).fill(null));
  const rowLabels = Array.from({ length: m }, (_, r) => `row ${r}`);
  const columnLabels = Array.from({ length: n }, (_, c) => `col ${c}`);
  const frames = [];
  const shown = v => (v === Infinity ? null : v);
  dist[0][0] = 1;
  table[0][0] = 1;
  emit(frames, table, { phase: "setup", line: 3, row: 0, column: 0, value: 1, message: "The start cell is visited once, so dist = 1." });
  for (let r = 0; r < m; r++) {
    for (let c = 0; c < n; c++) {
      if (r === 0 && c === 0) continue;
      emit(frames, table, { phase: "scan", line: 6, row: r, column: c, value: null, message: `Cell (${r}, ${c}): look at cells that can jump here.` });
      for (let p = 0; p < c; p++) {
        if (p + grid[r][p] >= c) dist[r][c] = Math.min(dist[r][c], dist[r][p] + 1);
      }
      table[r][c] = shown(dist[r][c]);
      emit(frames, table, { phase: "compute", line: 7, row: r, column: c, value: shown(dist[r][c]), message: `After the row jumps, dist = ${shown(dist[r][c]) ?? "infinity"}.` });
      for (let q = 0; q < r; q++) {
        if (q + grid[q][c] >= r) dist[r][c] = Math.min(dist[r][c], dist[q][c] + 1);
      }
      table[r][c] = shown(dist[r][c]);
      emit(frames, table, { phase: "compute", line: 8, row: r, column: c, value: shown(dist[r][c]), message: `After the column jumps, dist = ${shown(dist[r][c]) ?? "infinity"}.` });
    }
  }
  const answer = dist[m - 1][n - 1] === Infinity ? -1 : dist[m - 1][n - 1];
  emit(frames, table, { phase: "result", line: 9, row: m - 1, column: n - 1, value: answer, message: `Return ${answer}.` });
  return { input, result: answer, frames, rowLabels, columnLabels };
}
