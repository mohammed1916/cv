const MAX_N = 4
const OFFICIAL_MAX = 10

export const python = `def special_grid(n):
    side = 1 << n
    grid = [[0] * side for _ in range(side)]

    def fill(top, left, size, first):
        if size == 1:
            grid[top][left] = first
            return
        half = size // 2
        block = half * half
        fill(top, left + half, half, first)
        fill(top + half, left + half, half, first + block)
        fill(top + half, left, half, first + 2 * block)
        fill(top, left, half, first + 3 * block)

    fill(0, 0, side, 0)
    return grid`

const pseudo = `make an empty grid with side 2^n
to fill a square starting from value first:
  if the square is one cell, write first there and stop
  split it: half = size / 2, block = half squared
  top-right gets the block of values starting at first
  bottom-right gets the block starting at first + block
  bottom-left gets the block starting at first + 2 blocks
  top-left gets the block starting at first + 3 blocks
fill the whole grid starting from value 0
return the grid`
const pseudoLines = pseudo.split('\n')
export const code = pseudoLines.map((text, index) => ({ line: index + 1, text }))

const lineIn = (lines, text) => {
  const index = lines.findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing code line: ${text}`)
  return index + 1
}
const pyLines = python.split('\n')
const L = text => lineIn(pseudoLines, text)
const P = text => lineIn(pyLines, text)

export const phases = [
  { id: 'start', label: 'Start', description: 'Allocate the grid and call fill on all of it.' },
  { id: 'split', label: 'Split', description: 'Cut the square into four and share out its values.' },
  { id: 'descend', label: 'Descend', description: 'Recurse into the next quadrant in order.' },
  { id: 'place', label: 'Place', description: 'A single cell takes the only value it owns.' },
  { id: 'check', label: 'Check', description: 'Confirm neighbouring quadrants do not overlap.' },
  { id: 'done', label: 'Result', description: 'Return the grid.' },
]
export const inputLabel = 'Object with n (the grid side is 2^n)'
export const complexity = `O(4^n) time and space: one write per cell and about a third as many split calls. The rules allow n up to ${OFFICIAL_MAX}; the visualization stops at n = ${MAX_N} to keep every cell readable.`
export const url = 'https://leetcode.com/problems/fill-a-special-grid/'
export const examples = [
  { label: 'Three levels', input: '{"n":3}' },
  { label: 'Largest shown', input: '{"n":4}' },
]

// Quadrants in the order they receive values, as offsets in half-size steps from the square's corner.
export const QUADRANTS = [
  { name: 'top-right', short: 'TR', dr: 0, dc: 1, py: 'fill(top, left + half, half, first)', pseudo: 'top-right gets' },
  { name: 'bottom-right', short: 'BR', dr: 1, dc: 1, py: 'fill(top + half, left + half, half, first + block)', pseudo: 'bottom-right gets' },
  { name: 'bottom-left', short: 'BL', dr: 1, dc: 0, py: 'fill(top + half, left, half, first + 2 * block)', pseudo: 'bottom-left gets' },
  { name: 'top-left', short: 'TL', dr: 0, dc: 0, py: 'fill(top, left, half, first + 3 * block)', pseudo: 'top-left gets' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with n.')
  const { n } = input
  if (!Number.isInteger(n) || n < 0 || n > OFFICIAL_MAX) throw new Error(`n must be a whole number from 0 to ${OFFICIAL_MAX}.`)
  if (n > MAX_N) throw new Error(`n = ${n} is valid, but this visualization shows at most n = ${MAX_N} (a 16 by 16 grid).`)
  return { n }
}

export function buildTrace({ n }) {
  const side = 2 ** n
  const grid = Array.from({ length: side }, () => Array(side).fill(null))
  const frames = []
  const stack = []
  const push = (phase, pseudoText, pyText, message, extra = {}) => frames.push({
    phase, activeLine: L(pseudoText), pythonLine: P(pyText), message,
    grid: grid.map(row => [...row]), stack: stack.map(entry => ({ ...entry })), block: null, placed: null, compare: null, ...extra,
  })
  const range = (first, size) => `${first}..${first + size * size - 1}`

  push('start', 'make an empty grid', 'grid = [[0]', `The grid is ${side} by ${side}, with ${side * side} values to place.`)
  push('start', 'fill the whole grid', 'fill(0, 0, side, 0)', `The whole grid owns the values ${range(0, side)}.`, { block: { top: 0, left: 0, size: side } })

  function fill(top, left, size, first) {
    const block = { top, left, size }
    if (size === 1) {
      grid[top][left] = first
      stack.push({ top, left, size, first, child: -1 })
      push('place', 'one cell', 'grid[top][left] = first', `A one-cell square owns exactly one value, so row ${top}, column ${left} gets ${first}.`, { block, placed: { row: top, col: left } })
      stack.pop()
      return
    }
    const half = size / 2
    const share = half * half
    stack.push({ top, left, size, first, child: -1 })
    push('split', 'split it', 'half = size // 2', `This ${size} by ${size} square owns ${range(first, size)}. Each quadrant takes ${share} of them, lowest first.`, { block })
    const entry = stack[stack.length - 1]
    QUADRANTS.forEach((quadrant, index) => {
      entry.child = index
      const childFirst = first + index * share
      const childTop = top + quadrant.dr * half
      const childLeft = left + quadrant.dc * half
      push('descend', quadrant.pseudo, quadrant.py, `Quadrant ${index + 1} of 4 is the ${quadrant.name}. It owns ${range(childFirst, half)}.`, { block: { top: childTop, left: childLeft, size: half } })
      fill(childTop, childLeft, half, childFirst)
    })
    stack.pop()
  }
  fill(0, 0, side, 0)

  if (side > 1) {
    const half = side / 2
    const cells = quadrant => {
      const values = []
      for (let r = 0; r < half; r++) for (let c = 0; c < half; c++) values.push(grid[r + quadrant.dr * half][c + quadrant.dc * half])
      return values
    }
    for (let index = 0; index < 3; index++) {
      const a = QUADRANTS[index]
      const b = QUADRANTS[index + 1]
      const maxA = Math.max(...cells(a))
      const minB = Math.min(...cells(b))
      push('check', 'return the grid', 'return grid', `The largest ${a.name} value is ${maxA} and the smallest ${b.name} value is ${minB}, so ${maxA} < ${minB}.`, {
        compare: { a: a.short, b: b.short, maxA, minB },
        blocks: [a, b].map(q => ({ top: q.dr * half, left: q.dc * half, size: half })),
      })
    }
  }
  const result = grid.map(row => [...row])
  push('done', 'return the grid', 'return grid', side === 1 ? 'A single cell is already special, so the answer is that one value.' : `All ${side * side} values are placed. The order holds at every level because each square only ever uses its own block.`)
  return { input: { n }, result, frames }
}
