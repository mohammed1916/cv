// LeetCode 1197: Minimum Knight Moves.
// The board is infinite, so the search runs breadth-first on a window that reaches two cells beyond the target
// in every direction. Breadth-first order finds each cell's fewest moves when it is first discovered.

// Visualization cap (the draft did not verify official bounds).
const MAX_COORD = 12;
const MOVES = [[1, 2], [2, 1], [2, -1], [1, -2], [-1, -2], [-2, -1], [-2, 1], [-1, 2]];

const CODE_LINES = `function minKnightMoves(x, y) {
  const margin = Math.max(Math.abs(x), Math.abs(y)) + 2
  const moves = [[1, 2], [2, 1], [2, -1], [1, -2], [-1, -2], [-2, -1], [-2, 1], [-1, 2]]
  const dist = new Map([['0,0', 0]])
  const queue = [[0, 0]]
  for (let head = 0; head < queue.length; head++) {
    const [r, c] = queue[head]
    if (r === x && c === y) return dist.get(\`\${r},\${c}\`)
    for (const [dr, dc] of moves) {
      const nr = r + dr
      const nc = c + dc
      const key = \`\${nr},\${nc}\`
      if (nr >= -margin && nr <= margin && nc >= -margin && nc <= margin && !dist.has(key)) {
        dist.set(key, dist.get(\`\${r},\${c}\`) + 1)
        queue.push([nr, nc])
      }
    }
  }
  return -1
}`.split('\n');

const PY_LINES = [
  'from collections import deque',
  '',
  'class Solution:',
  '    def minKnightMoves(self, x: int, y: int) -> int:',
  '        margin = max(abs(x), abs(y)) + 2',
  '        moves = ((1, 2), (2, 1), (2, -1), (1, -2), (-1, -2), (-2, -1), (-2, 1), (-1, 2))',
  '        dist = {(0, 0): 0}',
  '        queue = deque([(0, 0)])',
  '        while queue:',
  '            r, c = queue.popleft()',
  '            if (r, c) == (x, y):',
  '                return dist[(r, c)]',
  '            for dr, dc in moves:',
  '                nr, nc = r + dr, c + dc',
  '                if -margin <= nr <= margin and -margin <= nc <= margin and (nr, nc) not in dist:',
  '                    dist[(nr, nc)] = dist[(r, c)] + 1',
  '                    queue.append((nr, nc))',
  '        return -1',
  '',
  'if __name__ == "__main__":',
  '    import sys, json',
  '    data = json.loads(sys.stdin.read())',
  '    print(json.dumps(Solution().minKnightMoves(data["x"], data["y"])))',
];

export const code = CODE_LINES.map((text, index) => ({ line: index + 1, text }));
export const python = PY_LINES.join('\n');

export const phases = [
  { id: 'setup', label: 'Window', description: 'Set the search window around the origin and the target.' },
  { id: 'expand', label: 'Pop cell', description: 'Take the oldest cell from the queue.' },
  { id: 'relax', label: 'Knight move', description: 'Try one of the eight knight moves from this cell.' },
  { id: 'done', label: 'Answer', description: 'The target was popped; its distance is the answer.' },
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
  const data = typeof input === 'string' ? JSON.parse(input) : input;
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with x and y.');
  const { x, y } = data;
  for (const [name, value] of [['x', x], ['y', y]]) {
    if (!Number.isInteger(value) || Math.abs(value) > MAX_COORD) throw new Error(`${name} is an integer from -${MAX_COORD} to ${MAX_COORD}.`);
  }
  return { x, y };
}

export function buildTrace(input) {
  const { x, y } = parseInput(input);
  const margin = Math.max(Math.abs(x), Math.abs(y)) + 2;
  const order = [{ r: 0, c: 0, dist: 0 }];
  const known = new Map([['0,0', 0]]);
  const frames = [];
  let popped = 0;
  let answer = -1;
  frames.push({
    pythonLine: P('margin = max(abs(x)'), phase: 'setup', activeLine: L('const margin = Math.max'),
    current: null, discovered: 1, popped: 0, candidate: null, isNew: null, margin, target: { r: x, c: y },
    message: `Search a window from -${margin} to ${margin} for (${x}, ${y}).`,
  });
  let head = 0;
  let found = false;
  while (head < order.length && !found) {
    const current = order[head];
    head += 1;
    popped = head;
    frames.push({
      pythonLine: P('r, c = queue.popleft()'), phase: 'expand', activeLine: L('const [r, c] = queue[head]'),
      current: { r: current.r, c: current.c, dist: current.dist }, discovered: order.length, popped, candidate: null, isNew: null,
      margin, target: { r: x, c: y }, message: `Pop (${current.r}, ${current.c}), which is ${current.dist} move${current.dist === 1 ? '' : 's'} away.`,
    });
    if (current.r === x && current.c === y) {
      answer = current.dist;
      frames.push({
        pythonLine: P('return dist[(r, c)]'), phase: 'done', activeLine: L('if (r === x && c === y)'),
        current: { r: current.r, c: current.c, dist: current.dist }, discovered: order.length, popped, candidate: null, isNew: null,
        margin, target: { r: x, c: y }, message: `The target is reached in ${answer} move${answer === 1 ? '' : 's'}.`,
      });
      found = true;
      break;
    }
    for (const [dr, dc] of MOVES) {
      const nr = current.r + dr;
      const nc = current.c + dc;
      if (nr < -margin || nr > margin || nc < -margin || nc > margin) continue;
      const key = `${nr},${nc}`;
      const isNew = !known.has(key);
      if (isNew) {
        known.set(key, current.dist + 1);
        order.push({ r: nr, c: nc, dist: current.dist + 1 });
      }
      frames.push({
        pythonLine: P(isNew ? 'dist[(nr, nc)] = dist[(r, c)] + 1' : 'if -margin <= nr'), phase: 'relax', activeLine: L('if (nr >= -margin'),
        current: { r: current.r, c: current.c, dist: current.dist }, discovered: order.length, popped, candidate: { r: nr, c: nc },
        isNew, margin, target: { r: x, c: y },
        message: isNew
          ? `(${nr}, ${nc}) is new at distance ${current.dist + 1}, so it joins the queue.`
          : `(${nr}, ${nc}) already has a distance, so it is skipped.`,
      });
    }
  }
  return { input: { x, y }, answer, order, margin, frames };
}
