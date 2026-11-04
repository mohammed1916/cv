export const MAX_SIZE = 25

export const phases = [
  { id: 'seed', label: 'Seed', description: 'Lay one corridor so the working cell has exactly 1 path.' },
  { id: 'double', label: 'Double', description: 'A 2 by 2 open block gives two ways through, doubling the count.' },
  { id: 'skip', label: 'Bit 0', description: 'This binary digit adds nothing.' },
  { id: 'route', label: 'Step aside', description: 'Move one cell away so the next corridor cannot touch the block.' },
  { id: 'tap', label: 'Add 1', description: 'A corridor from the edge brings in exactly one more path.' },
  { id: 'done', label: 'Result', description: 'The working cell is the grid\'s corner and holds k.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with k.')
  const { k } = input
  if (!Number.isInteger(k) || k < 1 || k > 1000) throw new Error('k is an integer from 1 to 1000.')
  return { k }
}

// Paths from (0, 0) to every free cell; null marks a blocked cell.
export function countPaths(grid) {
  const counts = grid.map(row => Array.from(row, () => null))
  grid.forEach((row, r) => {
    for (let c = 0; c < row.length; c++) {
      if (row[c] !== '.') continue
      counts[r][c] = r === 0 && c === 0 ? 1 : (counts[r - 1]?.[c] ?? 0) + (counts[r][c - 1] ?? 0)
    }
  })
  return counts
}

export function buildTrace({ k }) {
  const free = Array.from({ length: MAX_SIZE }, () => Array(MAX_SIZE).fill(false))
  const edge = Array.from({ length: MAX_SIZE }, () => Array(MAX_SIZE).fill(false))
  const bits = k.toString(2)
  const raw = []
  let r = 2
  let c = 2
  let x = 1
  const chain = [1]
  const carve = (cells, isEdge = false) => {
    const fresh = []
    for (const [i, j] of cells) {
      if (!free[i][j]) fresh.push([i, j])
      free[i][j] = true
      if (isEdge) edge[i][j] = true
    }
    return fresh
  }
  const push = (phase, activeLine, pythonLine, message, bitIndex, fresh) => raw.push({
    phase, activeLine, pythonLine, message, bitIndex, fresh, cell: [r, c], x, chain: [...chain],
    free: free.map(row => row.join()), edge: edge.map(row => row.join()),
  })

  let fresh = carve([[0, 0], [0, 1], [0, 2], [1, 2], [2, 2]], true)
  push('seed', L('carve a corridor'), P('r, c = 2, 2'), `k in binary is ${bits}. The leading 1 is the start: one corridor reaches cell (2, 2), so it has exactly 1 path.`, 0, fresh)
  for (let b = 1; b < bits.length; b++) {
    fresh = carve([[r, c + 1], [r + 1, c], [r + 1, c + 1]])
    r += 1; c += 1
    x *= 2
    chain.push(x)
    push('double', L('open the 2 by 2 block'), P('(r + 1, c + 1)]'), `Open a 2 by 2 block. Every path can go around it by the top or by the left, so ${x / 2} doubles to ${x} at (${r}, ${c}).`, b, fresh)
    if (bits[b] === '0') {
      push('skip', L('if the digit is 1'), P("if bit == '1'"), `Digit ${b} of ${bits} is 0, so ${x} needs nothing added.`, b, [])
      continue
    }
    const fromTop = c <= r
    if (fromTop) {
      fresh = carve([[r, c + 1]])
      push('route', L('step one cell along'), P('carve([(r, c + 1)])'), `Digit ${b} is 1. Step right to (${r}, ${c + 1}). The cell above it stays blocked, so the block's top path cannot slip in twice.`, b, fresh)
      fresh = [...carve([[r, c + 2]]), ...carve([...Array(c + 3).keys()].map(j => [0, j]), true), ...carve([...Array(r).keys()].map(i => [i, c + 2]), true)]
      c += 2
    } else {
      fresh = carve([[r + 1, c]])
      push('route', L('step one cell along'), P('carve([(r + 1, c)])'), `Digit ${b} is 1. Step down to (${r + 1}, ${c}). The cell left of it stays blocked, so the block's left path cannot slip in twice.`, b, fresh)
      fresh = [...carve([[r + 2, c]]), ...carve([...Array(r + 3).keys()].map(i => [i, 0]), true), ...carve([...Array(c).keys()].map(j => [r + 2, j]), true)]
      r += 2
    }
    x += 1
    chain.push(x)
    push('tap', L('carve a corridor from the edge'), P(fromTop ? 'for i in range(r))' : 'for j in range(c))'), `An edge row or column only ever carries 1 path, so a corridor from it adds exactly 1: ${x - 1} + 1 = ${x} at (${r}, ${c}).`, b, fresh)
  }
  const rows = r + 1
  const cols = c + 1
  const cropGrid = text => text.slice(0, rows).map(row => row.split(',').slice(0, cols).map(cell => cell === 'true'))
  const frames = raw.map(({ free: f, edge: e, ...frame }) => {
    const open = cropGrid(f)
    const grid = open.map(row => row.map(cell => (cell ? '.' : '#')).join(''))
    return { ...frame, grid, edge: cropGrid(e), counts: countPaths(grid), rows, cols }
  })
  const result = frames.at(-1).grid
  const counts = frames.at(-1).counts
  frames.push({ ...frames.at(-1), phase: 'done', activeLine: L('crop the grid'), pythonLine: P('return ['), message: `The grid is ${rows} by ${cols}, within the limit of ${MAX_SIZE}, and its corner holds ${counts[rows - 1][cols - 1]} paths.`, bitIndex: bits.length, fresh: [] })
  return { input: { k }, result, bits, frames }
}

export const code = `build a grid with exactly k paths
  carve a corridor to (2, 2), which then has 1 path
  for each binary digit of k after the first
    open the 2 by 2 block below and right of the cell, doubling its count
    if the digit is 1
      step one cell along, across whichever side has more room left
      carve a corridor from the edge into the next cell, adding 1
  crop the grid at the working cell and return it`.split('\n').map((text, index) => ({ line: index + 1, text }))
function L(s) {
  const index = code.findIndex(line => line.text.includes(s))
  if (index < 0) throw new Error(`Pseudocode line missing: ${s}`)
  return index + 1
}

export const python = `def build_grid(k):
    grid = [['#'] * 25 for _ in range(25)]
    def carve(cells):
        for i, j in cells:
            grid[i][j] = '.'
    r, c = 2, 2
    carve([(0, 0), (0, 1), (0, 2), (1, 2), (2, 2)])
    for bit in bin(k)[3:]:
        carve([(r, c + 1), (r + 1, c), (r + 1, c + 1)])
        r, c = r + 1, c + 1
        if bit == '1':
            if c <= r:
                carve([(r, c + 1)])
                carve([(r, c + 2)])
                carve((0, j) for j in range(c + 3))
                carve((i, c + 2) for i in range(r))
                c += 2
            else:
                carve([(r + 1, c)])
                carve([(r + 2, c)])
                carve((i, 0) for i in range(r + 3))
                carve((r + 2, j) for j in range(c))
                r += 2
    return [''.join(row[:c + 1]) for row in grid[:r + 1]]
`
function P(s) {
  const index = python.split('\n').findIndex(line => line.includes(s))
  if (index < 0) throw new Error(`Python line missing: ${s}`)
  return index + 1
}
