export const phases = [
  { id: 'start', label: 'Start', description: 'Stand at the origin and mark it as visited.' },
  { id: 'step', label: 'Take a step', description: 'Move one unit in the direction of the current letter.' },
  { id: 'check', label: 'Check visited', description: 'If the new point is already in the visited set, the path crosses itself.' },
  { id: 'record', label: 'Record point', description: 'A new point is added to the visited set.' },
  { id: 'done', label: 'Complete', description: 'Report whether a crossing was found.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object such as {"path": "NESW"}.')
  const { path } = input
  if (typeof path !== 'string' || !/^[NSEW]{1,20}$/.test(path)) throw new Error('path is a string of 1 to 20 letters, each N, S, E or W.')
  return { path }
}

const STEP = { N: [0, 1], S: [0, -1], E: [1, 0], W: [-1, 0] }

export function buildTrace({ path }) {
  const at = n => ({ activeLine: n, pythonLine: n })
  let x = 0
  let y = 0
  const visited = new Set(['0,0'])
  const pointsOf = () => [...visited].map(key => key.split(',').map(Number))
  const snap = (index, move) => ({ index, move, x, y, visited: pointsOf() })
  const frames = [{ phase: 'start', ...at(3), snapshot: snap(null, null), message: 'Start at (0, 0) and mark it as visited.' }]
  for (let index = 0; index < path.length; index++) {
    const move = path[index]
    const [dx, dy] = STEP[move]
    x += dx
    y += dy
    frames.push({ phase: 'step', ...at(6), snapshot: snap(index, move), message: `Move ${move} to (${x}, ${y}).` })
    const key = `${x},${y}`
    if (visited.has(key)) {
      frames.push({ phase: 'check', ...at(8), snapshot: snap(index, move), message: `(${x}, ${y}) was already visited, so the path crosses itself.` })
      frames.push({ phase: 'done', ...at(8), snapshot: snap(index, move), message: 'Return true.' })
      return { input: { path }, result: true, frames }
    }
    frames.push({ phase: 'check', ...at(7), snapshot: snap(index, move), message: `(${x}, ${y}) is new.` })
    visited.add(key)
    frames.push({ phase: 'record', ...at(9), snapshot: snap(index, move), message: `Record (${x}, ${y}) as visited.` })
  }
  frames.push({ phase: 'done', ...at(10), snapshot: snap(null, null), message: 'No point was revisited. Return false.' })
  return { input: { path }, result: false, frames }
}

const pseudo = [
  'path crosses(path):',
  '  x = 0, y = 0',
  '  visited = {(0, 0)}',
  '  for each move in path:',
  '    (dx, dy) = N(0,1), S(0,-1), E(1,0), W(-1,0) for move',
  '    x, y = x + dx, y + dy',
  '    if (x, y) is in visited:',
  '      return true',
  '    add (x, y) to visited',
  '  return false',
]

const pythonLines = [
  'def is_path_crossing(path):',
  '    x = y = 0',
  '    visited = {(0, 0)}',
  '    for move in path:',
  '        dx, dy = {"N": (0, 1), "S": (0, -1), "E": (1, 0), "W": (-1, 0)}[move]',
  '        x, y = x + dx, y + dy',
  '        if (x, y) in visited:',
  '            return True',
  '        visited.add((x, y))',
  '    return False',
]

export const code = pseudo.map((text, index) => ({ line: index + 1, text }))
export const python = pythonLines.join('\n')
