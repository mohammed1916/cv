const MAX = 8

export function parseInput(text) {
  const data = JSON.parse(text)
  const { zero, one, limit } = data ?? {}
  for (const [name, value] of [['zero', zero], ['one', one], ['limit', limit]]) {
    if (!Number.isInteger(value) || value < 1 || value > MAX) throw new Error(`${name} must be an integer from 1 to ${MAX}.`)
  }
  return { zero, one, limit }
}

export const code = `count stable binary arrays(zero, one, limit)
  make tables ends0 and ends1 of size (zero + 1) by (one + 1), filled with 0
  set ends0[0][0] and ends1[0][0] to 1 for the empty prefix
  for i from 0 to zero
    for j from 0 to one
      if i and j are both 0 then skip the empty prefix
      ends0[i][j] = sum of ends1[i - k][j] for k from 1 to min(i, limit)
      ends1[i][j] = sum of ends0[i][j - k] for k from 1 to min(j, limit)
  return ends0[zero][one] + ends1[zero][one]`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

const grid = (rows, cols) => Array.from({ length: rows }, () => Array(cols).fill(0))
const copy = table => table.map(row => [...row])

// A run of equal symbols may be at most limit long, so each block of a run is added to a table ending in the other symbol.
export function buildTrace({ zero, one, limit }) {
  const ends0 = grid(zero + 1, one + 1)
  const ends1 = grid(zero + 1, one + 1)
  ends0[0][0] = 1
  ends1[0][0] = 1
  const frames = [{ phase: 'start', cell: [0, 0], ends0: copy(ends0), ends1: copy(ends1), activeLine: L('set ends0[0][0]'), message: 'The empty prefix can be followed by either symbol, so both tables start with a 1 at the origin.' }]
  for (let i = 0; i <= zero; i++) {
    for (let j = 0; j <= one; j++) {
      if (i === 0 && j === 0) continue
      let sum = 0
      for (let k = 1; k <= Math.min(i, limit); k++) sum += ends1[i - k][j]
      ends0[i][j] = sum
      frames.push({ phase: 'zeros', cell: [i, j], ends0: copy(ends0), ends1: copy(ends1), activeLine: L('ends0[i][j] = sum'), message: `${i} zeros and ${j} ones, ending in 0: ${sum} arrays.` })
      sum = 0
      for (let k = 1; k <= Math.min(j, limit); k++) sum += ends0[i][j - k]
      ends1[i][j] = sum
      frames.push({ phase: 'ones', cell: [i, j], ends0: copy(ends0), ends1: copy(ends1), activeLine: L('ends1[i][j] = sum'), message: `${i} zeros and ${j} ones, ending in 1: ${sum} arrays.` })
    }
  }
  const result = ends0[zero][one] + ends1[zero][one]
  frames.push({ phase: 'done', cell: [zero, one], ends0: copy(ends0), ends1: copy(ends1), activeLine: L('return ends0[zero][one]'), message: `Stable arrays with ${zero} zeros and ${one} ones: ${result}.` })
  return { input: { zero, one, limit }, result, frames }
}

export const python = `def count_stable_arrays(zero, one, limit):
    ends0 = [[0] * (one + 1) for _ in range(zero + 1)]
    ends1 = [[0] * (one + 1) for _ in range(zero + 1)]
    # col_sums[i][j] is the sum of ends1[t][j] for t < i; row_sums[i][j] is the sum of ends0[i][t] for t < j.
    col_sums = [[0] * (one + 1) for _ in range(zero + 2)]
    row_sums = [[0] * (one + 2) for _ in range(zero + 1)]
    for i in range(zero + 1):
        for j in range(one + 1):
            if i == 0 and j == 0:
                ends0[0][0] = 1
                ends1[0][0] = 1
            else:
                ends0[i][j] = col_sums[i][j] - col_sums[max(0, i - limit)][j]
                ends1[i][j] = row_sums[i][j] - row_sums[i][max(0, j - limit)]
            row_sums[i][j + 1] = row_sums[i][j] + ends0[i][j]
            col_sums[i + 1][j] = col_sums[i][j] + ends1[i][j]
    return ends0[zero][one] + ends1[zero][one]
`
