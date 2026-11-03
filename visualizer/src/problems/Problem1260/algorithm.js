export const phases = [
  { id: 'start', label: 'Start', description: 'Flatten the grid in row-major order. Shifting by k is the same as shifting by k mod the cell count, so reduce k first.' },
  { id: 'place', label: 'Move each value', description: 'The value at flat position i moves to flat position (i + k) mod total. Row and column come back from the new flat index.' },
  { id: 'done', label: 'Complete', description: 'The filled table is the shifted grid.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object such as {"grid": [[1, 2], [3, 4]], "k": 1}.')
  const { grid, k } = input
  if (!Array.isArray(grid) || grid.length < 1 || grid.length > 6) throw new Error('grid holds 1 to 6 rows in this view.')
  const width = Array.isArray(grid[0]) ? grid[0].length : 0
  if (width < 1 || width > 6) throw new Error('Each row holds 1 to 6 values in this view.')
  for (const row of grid) {
    if (!Array.isArray(row) || row.length !== width || !row.every(v => Number.isInteger(v) && v >= 0 && v <= 99)) {
      throw new Error('Every row must have the same length, with integers from 0 to 99.')
    }
  }
  if (!Number.isInteger(k) || k < 0 || k > 60) throw new Error('k is an integer from 0 to 60.')
  return { grid, k }
}

const L = s => code.findIndex(c => c.text.includes(s)) + 1
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1

export function buildTrace({ grid, k }) {
  const m = grid.length
  const n = grid[0].length
  const total = m * n
  const flat = grid.flat()
  const kEff = k % total
  const result = Array.from({ length: m }, () => Array(n).fill(null))
  const snap = (extra = {}) => ({
    source: grid, result: result.map(row => [...row]), m, n, total, k, kEff, ...extra,
  })
  const frames = [{
    phase: 'start', activeLine: L('k = k mod total'), pythonLine: P('k %= total'), snapshot: snap(),
    message: `${total} cells, so shifting by ${k} is the same as shifting by ${kEff}. Each value moves forward ${kEff} flat positions, wrapping from the last cell to the first.`,
  }]

  for (let index = 0; index < total; index++) {
    const target = (index + kEff) % total
    result[Math.floor(target / n)][target % n] = flat[index]
    frames.push({
      phase: 'place', activeLine: L('target = (index + k) mod total'), pythonLine: P('target = (index + k) % total'),
      snapshot: snap({ index, target, value: flat[index], filled: index + 1 }),
      message: `Value ${flat[index]} at flat position ${index} (row ${Math.floor(index / n)}, column ${index % n}) moves to position ${target} (row ${Math.floor(target / n)}, column ${target % n}).`,
    })
  }

  frames.push({
    phase: 'done', activeLine: L('return result'), pythonLine: P('return result'), snapshot: snap({ complete: true }),
    message: 'Every cell is filled exactly once, so the table is the shifted grid.',
  })
  return { input: { grid, k }, result, frames }
}

export const code = [
  'shift_grid(grid, k):',
  '  m, n = size of grid; total = m * n',
  '  k = k mod total',
  '  result = m x n table, empty',
  '  for index from 0 to total - 1:',
  '    target = (index + k) mod total',
  '    result[target / n][target mod n] = grid[index / n][index mod n]',
  '  return result',
].map((text, index) => ({ line: index + 1, text }))

export const python = `def shift_grid(grid, k):
    m, n = len(grid), len(grid[0])
    total = m * n
    k %= total
    result = [[0] * n for _ in range(m)]
    for index in range(total):
        target = (index + k) % total
        result[target // n][target % n] = grid[index // n][index % n]
    return result
`
