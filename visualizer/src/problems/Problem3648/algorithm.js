export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use a JSON object with n, m and k.')
  const { n, m, k } = input
  if (!Number.isInteger(n) || n < 1 || n > 1000) throw new Error('n must be an integer from 1 to 1000.')
  if (!Number.isInteger(m) || m < 1 || m > 1000) throw new Error('m must be an integer from 1 to 1000.')
  if (!Number.isInteger(k) || k < 0 || k > 1000) throw new Error('k must be an integer from 0 to 1000.')
  return { n, m, k }
}

export function buildTrace(input) {
  const { n, m, k } = input
  const side = 2 * k + 1
  const rows = Math.ceil(n / side)
  const cols = Math.ceil(m / side)
  const frames = [
    { phase: 'side', activeLine: L('set side to 2k + 1'), rows: null, cols: null, result: null, message: `Each sensor covers a ${side} by ${side} block.` },
    { phase: 'rows', activeLine: L('rows needed'), rows, cols: null, result: null, message: `${n} rows need ${rows} bands of height ${side}.` },
    { phase: 'cols', activeLine: L('cols needed'), rows, cols, result: null, message: `${m} columns need ${cols} bands of width ${side}.` },
    { phase: 'done', activeLine: L('return rows times cols'), rows, cols, result: rows * cols, message: `Answer: ${rows} times ${cols} = ${rows * cols} sensors.` },
  ]
  return { input: { n, m, k }, result: rows * cols, frames }
}

export const code = `minimum sensors to cover the grid (n, m, k):
  set side to 2k + 1, the width of one sensor's block
  rows needed = ceiling of n divided by side
  cols needed = ceiling of m divided by side
  return rows times cols`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def min_sensors(n, m, k):
    side = 2 * k + 1
    rows = (n + side - 1) // side
    cols = (m + side - 1) // side
    return rows * cols
`
