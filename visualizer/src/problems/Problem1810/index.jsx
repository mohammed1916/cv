import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'

const code = [
  'const cost = new Map([[key(0, 0), 0]])',
  'let target = master.isTarget() ? [0, 0] : null',
  'const dfs = (i, j) => {',
  '  for (const [d, di, dj, back] of MOVES) {',
  '    const ni = i + di, nj = j + dj',
  '    if (master.canMove(d) && !cost.has(key(ni, nj))) {',
  '      cost.set(key(ni, nj), master.move(d))',
  '      if (target === null && master.isTarget()) target = [ni, nj]',
  '      dfs(ni, nj)',
  '      master.move(back)',
  '    }',
  '  }',
  '}',
  'dfs(0, 0)',
  'if (target === null) return -1',
  'const dist = new Map([[key(0, 0), 0]]), done = new Set()',
  'while (true) {',
  '  let best = null',
  '  for (const [k, d] of dist) if (!done.has(k) && (best === null || d < dist.get(best))) best = k',
  '  if (best === null) return -1',
  '  if (best === key(...target)) return dist.get(best)',
  '  done.add(best)',
  '  const [i, j] = best.split(\',\').map(Number)',
  '  for (const [, di, dj] of MOVES) {',
  '    const k = key(i + di, j + dj)',
  '    if (cost.has(k) && !done.has(k)) {',
  '      const candidate = dist.get(best) + cost.get(k)',
  '      if (!dist.has(k) || candidate < dist.get(k)) dist.set(k, candidate)',
  '    }',
  '  }',
  '}',
].map((text, index) => ({ line: index + 1, text }))

const python = `def minimum_cost(master):
    MOVES = [('U', -1, 0, 'D'), ('D', 1, 0, 'U'), ('L', 0, -1, 'R'), ('R', 0, 1, 'L')]
    cost = {(0, 0): 0}
    target = (0, 0) if master.is_target() else None
    def dfs(i, j):
        nonlocal target
        for d, di, dj, back in MOVES:
            ni, nj = i + di, j + dj
            if master.can_move(d) and (ni, nj) not in cost:
                cost[(ni, nj)] = master.move(d)
                if target is None and master.is_target():
                    target = (ni, nj)
                dfs(ni, nj)
                master.move(back)
    dfs(0, 0)
    if target is None:
        return -1
    dist, done = {(0, 0): 0}, set()
    while True:
        best = None
        for k, d in dist.items():
            if k not in done and (best is None or d < dist[best]):
                best = k
        if best is None:
            return -1
        if best == target:
            return dist[best]
        done.add(best)
        i, j = best
        for _, di, dj, _ in MOVES:
            k = (i + di, j + dj)
            if k in cost and k not in done:
                candidate = dist[best] + cost[k]
                if k not in dist or candidate < dist[k]:
                    dist[k] = candidate
`

const pyLine = text => python.split('\n').findIndex(line => line.includes(text)) + 1
const PY = {
  start: pyLine('cost = {(0, 0): 0}'),
  reach: pyLine('if target is None and master.is_target():'),
  check: pyLine('if master.can_move(d)'),
  probe: pyLine('cost[(ni, nj)] = master.move(d)'),
  back: pyLine('master.move(back)'),
  noTarget: pyLine('if target is None:'),
  found: pyLine('return dist[best]'),
  relax: pyLine('dist[k] = candidate'),
}
const DIRS = [[-1, 0, 'U', 'D'], [1, 0, 'D', 'U'], [0, -1, 'L', 'R'], [0, 1, 'R', 'L']]

export function parse(text) {
  const input = JSON.parse(text)
  const grid = input?.grid
  if (!Array.isArray(grid) || grid.length < 1 || grid.length > 6 || !grid.every(row => Array.isArray(row) && row.length === grid[0].length && row.length >= 1 && row.length <= 6 && row.every(v => Number.isInteger(v) && v >= 0 && v <= 9))) throw new Error('grid is at most 6 by 6 of digits 0 to 9; 0 is blocked.')
  if (grid[0][0] === 0) throw new Error('The robot starts at (0, 0), so that cell must be open.')
  const [tr, tc] = input.target || []
  if (!Number.isInteger(tr) || !Number.isInteger(tc) || tr < 0 || tc < 0 || tr >= grid.length || tc >= grid[0].length || grid[tr][tc] === 0) throw new Error('target is an open cell [row, col] inside the grid.')
  return { grid, target: [tr, tc] }
}

export function build({ grid, target }) {
  const rows = grid.length, cols = grid[0].length
  const inside = (r, c) => r >= 0 && c >= 0 && r < rows && c < cols
  const key = (r, c) => `${r},${c}`
  const cost = { '0,0': 0 }
  const seen = new Set(['0,0'])
  const frames = []
  let pos = [0, 0]
  let found = false
  const push = (phase, line, pythonLine, message, best = {}) => frames.push({
    phase, activeLine: line, pythonLine, message, pos: [...pos], cost: { ...cost }, best: { ...best },
  })
  push('start', 1, PY.start, 'Start at (0, 0). Its cost is not counted.')
  const explore = (r, c) => {
    if (r === target[0] && c === target[1]) { found = true; push('reach', 8, PY.reach, `Target reached at (${r}, ${c}).`) }
    for (const [dr, dc, move, back] of DIRS) {
      const nr = r + dr, nc = c + dc
      if (seen.has(key(nr, nc))) continue
      if (inside(nr, nc) && grid[nr][nc] > 0) {
        seen.add(key(nr, nc))
        pos = [nr, nc]
        cost[key(nr, nc)] = grid[nr][nc]
        push('probe', 7, PY.probe, `Step ${move} into (${nr}, ${nc}); its cost is ${grid[nr][nc]}.`)
        explore(nr, nc)
        pos = [r, c]
        push('back', 10, PY.back, `Step ${back} back to (${r}, ${c}).`)
      } else {
        blocked(r, c, move)
      }
    }
  }
  const blocked = (r, c, move) => push('blocked', 6, PY.check, `Neighbour ${move} of (${r}, ${c}) is blocked.`)
  explore(0, 0)
  if (!found) {
    push('done', 15, PY.noTarget, 'The target was not reached by exploration.')
    return { input: { grid, target }, result: -1, frames }
  }
  const best = { '0,0': 0 }
  const open = new Set(Object.keys(cost))
  const done = new Set()
  while (done.size < open.size) {
    let current = null
    for (const k of open) if (!done.has(k) && best[k] !== undefined && (current === null || best[k] < best[current])) current = k
    if (current === null) break
    done.add(current)
    const [r, c] = current.split(',').map(Number)
    for (const [dr, dc] of DIRS) {
      const nk = key(r + dr, c + dc)
      if (open.has(nk) && (best[nk] === undefined || best[current] + cost[nk] < best[nk])) {
        best[nk] = best[current] + cost[nk]
        push('relax', 28, PY.relax, `Cost to (${r + dr}, ${c + dc}) is now ${best[nk]}.`, best)
      }
    }
  }
  const answer = best[key(target[0], target[1])] ?? -1
  push('done', 21, PY.found, answer === -1 ? 'The target is unreachable.' : `Minimum path cost is ${answer}.`, best)
  return { input: { grid, target }, result: answer, frames }
}

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin at (0, 0).' },
    { id: 'reach', label: 'Target', description: 'Exploration reaches the target.' },
    { id: 'probe', label: 'Explore', description: 'Step into an open neighbour and read its cost.' },
    { id: 'blocked', label: 'Blocked', description: 'A neighbour is closed to the robot.' },
    { id: 'back', label: 'Backtrack', description: 'Return along the explored path.' },
    { id: 'relax', label: 'Relax', description: 'Update the cheapest known cost.' },
    { id: 'done', label: 'Result', description: 'Report the cheapest cost.' },
  ],
  parse, build, code, python,
  inputLabel: 'Object with grid (digits, 0 is blocked) and target [row, col]',
  url: 'https://leetcode.com/problems/minimum-path-cost-in-a-hidden-grid/',
  complexity: 'Exploration visits each reachable cell a constant number of times; the cost search is Dijkstra on the recorded cells. The sample is capped at 6 by 6.',
  examples: [
    { label: 'Example', input: '{"grid":[[1,3,1],[0,2,9],[4,1,1]],"target":[2,2]}' },
    { label: 'Walled', input: '{"grid":[[1,0],[0,5]],"target":[1,1]}' },
  ],
}

export default function MinimumPathCostInAHiddenGrid() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <table aria-label="Learned costs">
      <tbody>{run.input.grid.map((row, r) => <tr key={r}>{row.map((_, c) => {
        const k = `${r},${c}`
        const isPos = step.pos[0] === r && step.pos[1] === c
        const label = isPos ? 'robot' : step.best[k] !== undefined ? `total ${step.best[k]}` : step.cost[k] !== undefined ? `cost ${step.cost[k]}` : '?'
        return <td key={c} data-state={label} aria-label={`cell ${r},${c}: ${label}`}>{label}</td>
      })}</tr>)}</tbody>
    </table>
  </>} renderReasoning={() => <>
    <p>The robot pays for every cell it enters, so the cheapest route is a weighted shortest path. Exploration first gives the map, then Dijkstra picks the cheapest order of expansion.</p>
    <p>Stepping back after each probe keeps the robot inside the explored region.</p>
  </>} />
}
