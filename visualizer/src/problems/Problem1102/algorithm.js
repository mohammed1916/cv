// LeetCode 1102: Path With Maximum Minimum Value.
// A path's score is the smallest value it visits. Grow outward from the top-left cell, always expanding the
// frontier cell with the best score so far. Each neighbour gets min(its path score, the neighbour's value),
// and it is kept only when that improves its own best score.

// Visualization caps (the draft did not verify official bounds).
const MAX_SIDE = 8;
const MAX_VALUE = 1000;

const CODE_LINES = [
  'FUNCTION maximumMinimumPath(grid)',
  '    rows, cols ← size of grid',
  '    best ← rows × cols table filled with -1 (no path yet)',
  '    best[0][0] ← grid[0][0]; frontier ← [(0, 0)]',
  '    WHILE frontier is not empty',
  '        (r, c) ← remove the frontier cell with the largest best value',
  '        FOR each neighbour (nr, nc) inside the grid',
  '            score ← min(best[r][c], grid[nr][nc])',
  '            IF score > best[nr][nc] THEN best[nr][nc] ← score; add (nr, nc) to frontier',
  '    RETURN best[rows-1][cols-1]',
];

const PY_LINES = [
  'import heapq',
  '',
  'class Solution:',
  '    def maximumMinimumPath(self, grid: list[list[int]]) -> int:',
  '        rows, cols = len(grid), len(grid[0])',
  '        best = [[-1] * cols for _ in range(rows)]',
  '        best[0][0] = grid[0][0]',
  '        frontier = [(-grid[0][0], 0, 0)]',
  '        while frontier:',
  '            negative, r, c = heapq.heappop(frontier)',
  '            if -negative != best[r][c]:',
  '                continue',
  '            for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):',
  '                nr, nc = r + dr, c + dc',
  '                if 0 <= nr < rows and 0 <= nc < cols:',
  '                    score = min(best[r][c], grid[nr][nc])',
  '                    if score > best[nr][nc]:',
  '                        best[nr][nc] = score',
  '                        heapq.heappush(frontier, (-score, nr, nc))',
  '        return best[rows - 1][cols - 1]',
  '',
  'if __name__ == "__main__":',
  '    import sys, json',
  '    print(json.dumps(Solution().maximumMinimumPath(json.loads(sys.stdin.read()))))',
];

export const code = CODE_LINES.map((text, index) => ({ line: index + 1, text }));
export const python = PY_LINES.join('\n');

export const phases = [
  { id: 'setup', label: 'Grid', description: 'Start from the top-left cell with its own value as the score.' },
  { id: 'expand', label: 'Expand', description: 'Take the frontier cell with the best score so far.' },
  { id: 'relax', label: 'Neighbour', description: 'Score a neighbour by the smaller of the path score and its own value.' },
  { id: 'done', label: 'Answer', description: 'The bottom-right best score is the answer.' },
];

const L = (text) => {
  const index = code.findIndex((entry) => entry.text.includes(text));
  if (index < 0) throw new Error(`Missing pseudocode line: ${text}`);
  return index + 1;
};

const P = (text) => {
  const index = PY_LINES.findIndex((line) => line.includes(text));
  if (index < 0) throw new Error(`Missing python line: ${text}`);
  return index + 1;
};

export function parseInput(input) {
  const grid = typeof input === 'string' ? JSON.parse(input) : input;
  if (!Array.isArray(grid) || grid.length < 1 || grid.length > MAX_SIDE) throw new Error(`Use a grid with 1 to ${MAX_SIDE} rows.`);
  const cols = Array.isArray(grid[0]) ? grid[0].length : 0;
  if (cols < 1 || cols > MAX_SIDE) throw new Error(`Each row has 1 to ${MAX_SIDE} columns.`);
  for (const row of grid) {
    if (!Array.isArray(row) || row.length !== cols) throw new Error('The grid must be rectangular.');
    for (const value of row) {
      if (!Number.isInteger(value) || value < 0 || value > MAX_VALUE) throw new Error(`Grid values are integers from 0 to ${MAX_VALUE}.`);
    }
  }
  return grid.map((row) => [...row]);
}

function snapshot(best) {
  return best.map((row) => [...row]);
}

export function buildTrace(input) {
  const grid = parseInput(input);
  const rows = grid.length;
  const cols = grid[0].length;
  const best = Array.from({ length: rows }, () => Array.from({ length: cols }, () => -1));
  best[0][0] = grid[0][0];
  let frontier = [{ r: 0, c: 0 }];
  const frames = [];
  frames.push({
    pythonLine: P('best = [[-1]'), phase: 'setup', activeLine: L('best ← rows × cols table'),
    current: null, neighbour: null, score: null, improved: null, best: snapshot(best), frontier: frontier.map((cell) => ({ ...cell })),
    message: `Start at the top-left cell with score ${grid[0][0]}.`,
  });
  while (frontier.length) {
    let pick = 0;
    for (let i = 1; i < frontier.length; i += 1) {
      if (best[frontier[i].r][frontier[i].c] > best[frontier[pick].r][frontier[pick].c]) pick = i;
    }
    const [{ r, c }] = frontier.splice(pick, 1);
    frames.push({
      pythonLine: P('negative, r, c = heapq.heappop'), phase: 'expand', activeLine: L('(r, c) ← remove the frontier cell'),
      current: { r, c }, neighbour: null, score: null, improved: null, best: snapshot(best), frontier: frontier.map((cell) => ({ ...cell })),
      message: `Expand (${r}, ${c}) with path score ${best[r][c]}.`,
    });
    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
      const score = Math.min(best[r][c], grid[nr][nc]);
      const improved = score > best[nr][nc];
      if (improved) {
        best[nr][nc] = score;
        frontier.push({ r: nr, c: nc });
      }
      frames.push({
        pythonLine: P(improved ? 'best[nr][nc] = score' : 'if score > best[nr][nc]:'), phase: 'relax', activeLine: L('score ← min(best[r][c]'),
        current: { r, c }, neighbour: { r: nr, c: nc }, score, improved, best: snapshot(best), frontier: frontier.map((cell) => ({ ...cell })),
        message: improved
          ? `(${nr}, ${nc}) gets score ${score}, which improves its best, so it joins the frontier.`
          : `(${nr}, ${nc}) would get ${score}, which does not beat its best ${best[nr][nc]}.`,
      });
    }
  }
  const answer = best[rows - 1][cols - 1];
  frames.push({
    pythonLine: P('return best[rows - 1][cols - 1]'), phase: 'done', activeLine: L('RETURN best[rows-1][cols-1]'),
    current: null, neighbour: null, score: null, improved: null, best: snapshot(best), frontier: [],
    message: `The bottom-right cell's best score is ${answer}.`,
  });
  return { input: grid, answer, best, frames };
}
