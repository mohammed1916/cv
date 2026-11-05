import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'

const code = [
  'const seen = new Set([key(0, 0)])',
  'let target = master.isTarget() ? [0, 0] : null',
  'const dfs = (i, j) => {',
  '  for (const [d, di, dj, back] of MOVES) {',
  '    const ni = i + di, nj = j + dj',
  '    if (master.canMove(d) && !seen.has(key(ni, nj))) {',
  '      seen.add(key(ni, nj))',
  '      master.move(d)',
  '      if (target === null && master.isTarget()) target = [ni, nj]',
  '      dfs(ni, nj)',
  '      master.move(back)',
  '    }',
  '  }',
  '}',
  'dfs(0, 0)',
  'if (target === null) return -1',
  'const dist = new Map([[key(0, 0), 0]]), queue = [[0, 0]]',
  'for (let head = 0; head < queue.length; head++) {',
  '  const [i, j] = queue[head]',
  '  if (i === target[0] && j === target[1]) return dist.get(key(i, j))',
  '  for (const [, di, dj] of MOVES) {',
  '    const k = key(i + di, j + dj)',
  '    if (seen.has(k) && !dist.has(k)) { dist.set(k, dist.get(key(i, j)) + 1); queue.push([i + di, j + dj]) }',
  '  }',
  '}',
  'return -1',
].map((text, index) => ({ line: index + 1, text }))

const python = `def shortest_path(master):
    MOVES = [('U', -1, 0, 'D'), ('D', 1, 0, 'U'), ('L', 0, -1, 'R'), ('R', 0, 1, 'L')]
    seen = {(0, 0)}
    target = (0, 0) if master.is_target() else None
    def dfs(i, j):
        nonlocal target
        for d, di, dj, back in MOVES:
            ni, nj = i + di, j + dj
            if master.can_move(d) and (ni, nj) not in seen:
                seen.add((ni, nj))
                master.move(d)
                if target is None and master.is_target():
                    target = (ni, nj)
                dfs(ni, nj)
                master.move(back)
    dfs(0, 0)
    if target is None:
        return -1
    from collections import deque
    dist, queue = {(0, 0): 0}, deque([(0, 0)])
    while queue:
        i, j = queue.popleft()
        if (i, j) == target:
            return dist[(i, j)]
        for _, di, dj, _ in MOVES:
            k = (i + di, j + dj)
            if k in seen and k not in dist:
                dist[k] = dist[(i, j)] + 1
                queue.append(k)
    return -1
`

const pyLine = text => python.split('\n').findIndex(line => line.includes(text)) + 1
const PY = {
  seen: pyLine('seen = {(0, 0)}'),
  check: pyLine('if master.can_move(d)'),
  probe: pyLine('master.move(d)'),
  target: pyLine('target = (ni, nj)'),
  back: pyLine('master.move(back)'),
  noTarget: pyLine('if target is None:'),
  bfs: pyLine('i, j = queue.popleft()'),
  done: pyLine('return dist[(i, j)]'),
}
const DIRS = [[-1, 0, 'U', 'D'], [1, 0, 'D', 'U'], [0, -1, 'L', 'R'], [0, 1, 'R', 'L']]

export function parse(text) {
  const input = JSON.parse(text)
  const grid = input?.grid
  if (!Array.isArray(grid) || grid.length < 1 || grid.length > 6 || !grid.every(row => Array.isArray(row) && row.length === grid[0].length && row.length >= 1 && row.length <= 6 && row.every(v => v === 0 || v === 1))) throw new Error('grid is at most 6 by 6 of 0 and 1 rows.')
  if (grid[0][0] !== 1) throw new Error('The robot starts at (0, 0), so that cell must be 1.')
  const [tr, tc] = input.target || []
  if (!Number.isInteger(tr) || !Number.isInteger(tc) || tr < 0 || tc < 0 || tr >= grid.length || tc >= grid[0].length || grid[tr][tc] !== 1) throw new Error('target is an open cell [row, col] inside the grid.')
  return { grid, target: [tr, tc] }
}

export function build({ grid, target }) {
  const rows = grid.length, cols = grid[0].length
  const inside = (r, c) => r >= 0 && c >= 0 && r < rows && c < cols
  const open = new Set(['0,0']), blocked = new Set(), seen = new Set(['0,0'])
  const frames = []
  const key = (r, c) => `${r},${c}`
  let pos = [0, 0]
  let found = false
  const push = (phase, line, pythonLine, message, dist = {}) => frames.push({
    phase, activeLine: line, pythonLine, message, pos: [...pos], open: [...open], blocked: [...blocked], dist,
  })
  push('start', 1, PY.seen, 'The robot wakes up at (0, 0) and can only ask about neighbours.')
  const explore = (r, c) => {
    if (r === target[0] && c === target[1]) { found = true; push('target', 9, PY.target, `Target found at (${r}, ${c}).`) }
    for (const [dr, dc, move, back] of DIRS) {
      const nr = r + dr, nc = c + dc
      if (seen.has(key(nr, nc))) continue
      if (inside(nr, nc) && grid[nr][nc] === 1) {
        seen.add(key(nr, nc))
        pos = [nr, nc]
        open.add(key(nr, nc))
        push('probe', 8, PY.probe, `Neighbour ${move} of (${r}, ${c}) is open; move in.`)
        explore(nr, nc)
        pos = [r, c]
        push('back', 11, PY.back, `Step ${back} back to (${r}, ${c}).`)
      } else {
        blocked.add(key(nr, nc))
        push('blocked', 6, PY.check, `Neighbour ${move} of (${r}, ${c}) is blocked.`)
      }
    }
  }
  explore(0, 0)
  if (!found) {
    push('done', 16, PY.noTarget, 'The target was not reached by exploration.')
    return { input: { grid, target }, result: -1, frames }
  }
  const dist = { '0,0': 0 }
  const queue = [[0, 0]]
  for (let head = 0; head < queue.length; head++) {
    const [r, c] = queue[head]
    for (const [dr, dc] of DIRS) {
      const nk = key(r + dr, c + dc)
      if (open.has(nk) && dist[nk] === undefined) {
        dist[nk] = dist[key(r, c)] + 1
        queue.push([r + dr, c + dc])
      }
    }
    push('bfs', 19, PY.bfs, `Breadth-first search expands (${r}, ${c}) at distance ${dist[key(r, c)]}.`, { ...dist })
  }
  const answer = dist[key(target[0], target[1])] ?? -1
  push('done', 20, PY.done, answer === -1 ? 'The target cannot be reached.' : `Shortest distance is ${answer}.`, { ...dist })
  return { input: { grid, target }, result: answer, frames }
}

const definition = {
  phases: [
    { id: 'start', label: 'Wake', description: 'Start at (0, 0).' },
    { id: 'target', label: 'Target', description: 'Notice the target cell.' },
    { id: 'probe', label: 'Probe', description: 'Move into open neighbours.' },
    { id: 'blocked', label: 'Blocked', description: 'Record blocked neighbours.' },
    { id: 'back', label: 'Backtrack', description: 'Return along the path.' },
    { id: 'bfs', label: 'Breadth-first', description: 'Measure distances on the known map.' },
    { id: 'done', label: 'Result', description: 'Report the distance.' },
  ],
  parse, build, code, python,
  inputLabel: 'Object with grid (1 open, 0 blocked), target [row, col]',
  url: 'https://leetcode.com/problems/shortest-path-in-a-hidden-grid/',
  complexity: 'Exploration visits each reachable cell and each edge a constant number of times; the search after exploration is breadth-first. The visual shows the full grid only for learning, the robot sees only neighbours.',
  examples: [
    { label: 'Example', input: '{"grid":[[1,1,0],[1,0,1],[1,1,1]],"target":[2,2]}' },
    { label: 'Walled off', input: '{"grid":[[1,0,1],[1,0,1]],"target":[0,2]}' },
  ],
}

export default function ShortestPathInAHiddenGrid() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <table aria-label="Learned grid">
      <tbody>{run.input.grid.map((row, r) => <tr key={r}>{row.map((_, c) => {
        const k = `${r},${c}`
        const isPos = step.pos[0] === r && step.pos[1] === c
        const isTarget = run.input.target[0] === r && run.input.target[1] === c
        const label = isPos ? 'robot' : step.dist[k] !== undefined ? `d${step.dist[k]}` : step.open.includes(k) ? 'open' : step.blocked.includes(k) ? 'wall' : '?'
        return <td key={c} data-state={label} aria-label={`cell ${r},${c}: ${label}${isTarget ? ', target' : ''}`}>
          {isTarget ? 'T ' : ''}{label}
        </td>
      })}</tr>)}</tbody>
    </table>
    <output aria-label="Distance so far">{step.dist[`${run.input.target[0]},${run.input.target[1]}`] ?? 'not yet'}</output>
  </>} renderReasoning={() => <>
    <p>The robot never sees the grid, only whether a neighbour is open. Depth-first exploration with backtracking records every reachable cell and every wall it touches.</p>
    <p>Once the map is known, ordinary breadth-first search finds the shortest route, because every move costs the same.</p>
  </>} />
}
