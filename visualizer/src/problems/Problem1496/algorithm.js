export const phases = [
  { id: 'start', label: 'Start', description: 'Begin at the origin and mark it as visited.' },
  { id: 'step', label: 'Take a step', description: 'Move one unit north, south, east or west according to the next letter.' },
  { id: 'revisit', label: 'Crossing', description: 'The new position was already visited, so the path crosses itself.' },
  { id: 'fresh', label: 'New position', description: 'The new position is fresh; mark it as visited and keep walking.' },
  { id: 'done', label: 'Complete', description: 'Return whether the path ever returned to a visited position.' },
]

export const examples = [
  { label: 'Loops back', input: '{"path":"NESWNE"}' },
  { label: 'Straight line', input: '{"path":"EENNW"}' },
]

const MOVE = { N: [0, 1], S: [0, -1], E: [1, 0], W: [-1, 0] }

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data) || typeof data.path !== 'string') throw new Error('Use an object with a path string, such as {"path":"NESW"}.')
  if (data.path.length < 1 || data.path.length > 60) throw new Error('path must have 1 to 60 steps in this visualization.')
  if (!/^[NSEW]+$/.test(data.path)) throw new Error('path may contain only the letters N, S, E and W.')
  return data.path
}

export function buildTrace(input) {
  const path = typeof input === 'string' ? input : input.path
  let x = 0, y = 0
  const visited = new Set(['0,0'])
  const key = () => `${x},${y}`
  const snap = (extra = {}) => ({ path, x, y, visited: [...visited], ...extra })
  const frames = [{ phase: 'start', activeLine: 3, pythonLine: 3, snapshot: snap(),
    message: `Walk ${JSON.stringify(path)} from the origin, looking for a repeated position.` }]
  let crossed = false
  for (const ch of path) {
    const [dx, dy] = MOVE[ch]
    x += dx; y += dy
    frames.push({ phase: 'step', activeLine: 6, pythonLine: 6, snapshot: snap({ step: ch }),
      message: `Move ${ch} to (${x}, ${y}).` })
    if (visited.has(key())) {
      crossed = true
      frames.push({ phase: 'revisit', activeLine: 7, pythonLine: 7, snapshot: snap({ step: ch, crossed: true }),
        message: `(${x}, ${y}) was already visited, so the path crosses itself.` })
      break
    }
    visited.add(key())
    frames.push({ phase: 'fresh', activeLine: 8, pythonLine: 8, snapshot: snap({ step: ch }),
      message: `(${x}, ${y}) is new; record it.` })
  }
  frames.push({ phase: 'done', activeLine: 10, pythonLine: 10, snapshot: snap({ crossed, result: crossed }),
    message: `Return ${crossed}.`, result: crossed })
  for (const f of frames) f.scene = { ...f.snapshot }
  return { input: path, result: crossed, frames }
}

export const code = `function isPathCrossing(path) {
  let x = 0, y = 0
  const visited = new Set(['0,0'])
  for (const ch of path) {
    const [dx, dy] = MOVE[ch]
    x += dx; y += dy
    if (visited.has(x + ',' + y)) return true
    visited.add(x + ',' + y)
  }
  return false
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def is_path_crossing(path):
    x, y = 0, 0
    visited = {(0, 0)}
    for ch in path:
        dx, dy = MOVE[ch]
        x += dx; y += dy
        if (x, y) in visited:
            return True
        visited.add((x, y))
    return False
`
