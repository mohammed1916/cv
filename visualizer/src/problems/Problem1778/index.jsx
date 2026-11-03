import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'

const code = [
  'explore(r, c) with depth-first search',
  '  mark (r, c) as known open',
  '  if (r, c) is the target, remember it',
  '  for each direction',
  '    skip cells already probed',
  '    if the master says open, move in, explore, move back',
  '    otherwise mark the neighbour blocked',
  'breadth-first search over known open cells from (0, 0)',
  'return the distance to the target, or -1',
].map((text, index) => ({ line: index + 1, text }))

const python = `def shortest_path(master):
    DIRS = [(-1, 0, 'U', 'D'), (1, 0, 'D', 'U'), (0, -1, 'L', 'R'), (0, 1, 'R', 'L')]
    open_cells, seen, target = {(0, 0)}, {(0, 0)}, None
    def explore(r, c):
        nonlocal target
        if master.is_target():
            target = (r, c)
        for dr, dc, move, back in DIRS:
            nr, nc = r + dr, c + dc
            if (nr, nc) in seen:
                continue
            seen.add((nr, nc))
            if master.can_move(move):
                master.move(move)
                open_cells.add((nr, nc))
                explore(nr, nc)
                master.move(back)
    explore(0, 0)
    if target is None:
        return -1
    from collections import deque
    dist, queue = {(0, 0): 0}, deque([(0, 0)])
    while queue:
        r, c = queue.popleft()
        for dr, dc, _, _ in DIRS:
            nxt = (r + dr, c + dc)
            if nxt in open_cells and nxt not in dist:
                dist[nxt] = dist[(r, c)] + 1
                queue.append(nxt)
    return dist.get(target, -1)
`

const PY = { explore: 4, target: 6, probeOpen: 13, back: 17, probeBlocked: 13, bfs: 27, done: 30 }
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
  push('start', 1, PY.explore, 'The robot wakes up at (0, 0) and can only ask about neighbours.')
  const explore = (r, c) => {
    open.add(key(r, c))
    if (r === target[0] && c === target[1]) { found = true; push('target', 3, PY.target, `Target found at (${r}, ${c}).`) }
    for (const [dr, dc, move, back] of DIRS) {
      const nr = r + dr, nc = c + dc
      if (seen.has(key(nr, nc))) continue
      seen.add(key(nr, nc))
      if (inside(nr, nc) && grid[nr][nc] === 1) {
        pos = [nr, nc]
        open.add(key(nr, nc))
        push('probe', 6, PY.probeOpen, `Neighbour ${move} of (${r}, ${c}) is open; move in.`)
        explore(nr, nc)
        pos = [r, c]
        push('back', 6, PY.back, `Step ${back} back to (${r}, ${c}).`)
      } else {
        blocked.add(key(nr, nc))
        push('blocked', 7, PY.probeBlocked, `Neighbour ${move} of (${r}, ${c}) is blocked.`)
      }
    }
  }
  explore(0, 0)
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
    push('bfs', 8, PY.bfs, `Breadth-first search expands (${r}, ${c}) at distance ${dist[key(r, c)]}.`, { ...dist })
  }
  const answer = found ? dist[key(target[0], target[1])] : -1
  push('done', 9, PY.done, answer === -1 ? 'The target cannot be reached.' : `Shortest distance is ${answer}.`, { ...dist })
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
