const PY = [
  "from collections import deque",
  "",
  "def maxMoves(kx, ky, positions):",
  "    size = 50",
  "    moves = ((1, 2), (2, 1), (-1, 2), (-2, 1), (1, -2), (2, -1), (-1, -2), (-2, -1))",
  "    def knight_distance(start):",
  "        dist = [[-1] * size for _ in range(size)]",
  "        dist[start[0]][start[1]] = 0",
  "        queue = deque([start])",
  "        while queue:",
  "            x, y = queue.popleft()",
  "            for dx, dy in moves:",
  "                nx, ny = x + dx, y + dy",
  "                if 0 <= nx < size and 0 <= ny < size and dist[nx][ny] < 0:",
  "                    dist[nx][ny] = dist[x][y] + 1",
  "                    queue.append((nx, ny))",
  "        return dist",
  "    points = [(kx, ky)] + [tuple(p) for p in positions]",
  "    n = len(positions)",
  "    cost = [[0] * (n + 1) for _ in range(n + 1)]",
  "    for a in range(n + 1):",
  "        dist = knight_distance(points[a])",
  "        for b in range(n + 1):",
  "            cost[a][b] = dist[points[b][0]][points[b][1]]",
  "    full = (1 << n) - 1",
  "    best = [[0] * (n + 1) for _ in range(1 << n)]",
  "    for mask in range(full - 1, -1, -1):",
  "        alice_turn = bin(mask).count(\"1\") % 2 == 0",
  "        for last in range(n + 1):",
  "            choice = None",
  "            for p in range(n):",
  "                if (mask >> p) & 1:",
  "                    continue",
  "                value = cost[last][p + 1] + best[mask | (1 << p)][p + 1]",
  "                if choice is None or (value > choice if alice_turn else value < choice):",
  "                    choice = value",
  "            best[mask][last] = choice",
  "    return best[0][0]",
];

const at = text => {
  const index = PY.findIndex(line => line.includes(text));
  if (index < 0) throw new Error(`Missing Python line: ${text}`);
  return index + 1;
};

export const python = PY.join('\n');

export const code = [
  { line: 1, text: 'function maxMoves(kx, ky, positions)' },
  { line: 2, text: 'compute knight distances from the start and from every pawn with breadth-first search' },
  { line: 3, text: 'cost[a][b] = knight distance from point a to pawn b' },
  { line: 4, text: 'best[all captured][any point] = 0' },
  { line: 5, text: 'for each captured set from full down to empty' },
  { line: 6, text: 'for each last captured point' },
  { line: 7, text: 'for each pawn p not yet captured' },
  { line: 8, text: 'value = cost from last to p + best[captured plus p][p]' },
  { line: 9, text: 'best = largest value if Alice moves, smallest if Bob moves' },
  { line: 10, text: 'return best for nothing captured from the knight start' },
];

const SIZE = 50;
const KNIGHT = [[1, 2], [2, 1], [-1, 2], [-2, 1], [1, -2], [2, -1], [-1, -2], [-2, -1]];

function knightDistance([sx, sy]) {
  const dist = Array.from({ length: SIZE }, () => Array(SIZE).fill(-1));
  dist[sx][sy] = 0;
  const queue = [[sx, sy]];
  for (let head = 0; head < queue.length; head++) {
    const [x, y] = queue[head];
    for (const [dx, dy] of KNIGHT) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx >= 0 && nx < SIZE && ny >= 0 && ny < SIZE && dist[nx][ny] < 0) {
        dist[nx][ny] = dist[x][y] + 1;
        queue.push([nx, ny]);
      }
    }
  }
  return dist;
}

export function parseInput(text) {
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('Input must be JSON, for example {"kx": 1, "ky": 1, "positions": [[0, 0]]}');
  }
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Input must be a JSON object with kx, ky, and positions');
  const { kx, ky, positions } = data;
  const inside = v => Number.isInteger(v) && v >= 0 && v <= 49;
  if (!inside(kx) || !inside(ky)) throw new Error('kx and ky must be integers from 0 to 49');
  if (!Array.isArray(positions) || positions.length < 1 || positions.length > 6) {
    throw new Error(`positions must have 1 to 6 pawns for the visualization (got ${Array.isArray(positions) ? positions.length : 'none'})`);
  }
  const seen = new Set();
  for (const p of positions) {
    if (!Array.isArray(p) || p.length !== 2 || !inside(p[0]) || !inside(p[1])) throw new Error('Each pawn must be [x, y] with coordinates from 0 to 49');
    if (p[0] === kx && p[1] === ky) throw new Error('No pawn may start on the knight square');
    const key = `${p[0]},${p[1]}`;
    if (seen.has(key)) throw new Error(`Pawn positions must be unique (duplicate ${key})`);
    seen.add(key);
  }
  return { kx, ky, positions };
}

export function buildTrace(input) {
  const { kx, ky, positions } = input;
  const n = positions.length;
  const points = [[kx, ky], ...positions];
  const cost = points.map(p => {
    const dist = knightDistance(p);
    return points.map(([x, y]) => dist[x][y]);
  });
  const full = (1 << n) - 1;
  const best = Array.from({ length: 1 << n }, () => Array(n + 1).fill(0));
  const frames = [];
  const state = { mask: full, last: -1, p: -1, value: null, answer: null };
  const snap = (phase, activeLine, pythonLine, message, explanation) => frames.push({
    phase, activeLine, pythonLine, message, explanation, n, full, positions, best: best.map(row => row.slice()), ...state, relatedLines: [activeLine],
  });

  snap('start', 4, at('best = [[0]'), 'All pawns captured: no moves remain, so every value is 0.', 'The DP fills masks from full down to empty.');
  for (let mask = full - 1; mask >= 0; mask--) {
    state.mask = mask;
    const aliceTurn = (mask.toString(2).replace(/0/g, '').length) % 2 === 0;
    for (let last = 0; last <= n; last++) {
      state.last = last;
      let choice = null;
      for (let p = 0; p < n; p++) {
        if ((mask >> p) & 1) continue;
        const value = cost[last][p + 1] + best[mask | (1 << p)][p + 1];
        state.p = p;
        state.value = value;
        if (choice === null || (aliceTurn ? value > choice : value < choice)) choice = value;
      }
      best[mask][last] = choice;
      state.value = choice;
      snap('fill', 9, at('best[mask][last] = choice'), `Mask ${mask.toString(2).padStart(n, '0')}, last point ${last}: ${aliceTurn ? 'Alice maximizes' : 'Bob minimizes'} to ${choice}.`,
        `${aliceTurn ? 'Alice' : 'Bob'} is to move when ${mask.toString(2).replace(/0/g, '').length} pawns are captured.`);
    }
  }
  state.answer = best[0][0];
  state.mask = 0;
  state.last = 0;
  snap('done', 10, at('return best[0][0]'), `Maximum total moves: ${state.answer}.`, 'Alice moves first and maximizes the total moves made by both players.');
  return { input, result: state.answer, frames };
}
