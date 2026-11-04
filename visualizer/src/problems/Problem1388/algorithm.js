export const phases = [
  { id: 'start', label: 'Start', description: 'Read the circular slices; n = length / 3 slices must be chosen.' },
  { id: 'inspect', label: 'Cut', description: 'Some optimum leaves out either the first slice or the last slice, so the circle becomes a line.' },
  { id: 'update', label: 'Line DP', description: 'Track the best total for each count of chosen slices, with no two neighbours both chosen.' },
  { id: 'done', label: 'Complete', description: 'The better of the two lines gives the answer.' },
]

export function parseInput(text) {
  const value = JSON.parse(text)
  const slices = value?.slices
  if (!Array.isArray(slices) || slices.length % 3 !== 0 || slices.length < 3 || slices.length > 30 || slices.some(v => !Number.isInteger(v) || v < 1 || v > 1000)) {
    throw new Error('Enter JSON like {"slices":[5,1,9,2,7,4]} with a length that is a multiple of 3 (3–30), and integers from 1 to 1000.')
  }
  return { slices }
}

const NEG = -Infinity
const LINE = { start: 2, cut: 3, pick: 11, done: 3 }

// Shared line-DP. `frames` receives one update per value; `pass` labels which cut is being solved.
function pickTrace(values, k, pass, frames) {
  const dp = [[0, ...Array(k).fill(NEG)]] // dp[i][j]: best total of j chosen values among the first i
  for (let i = 0; i < values.length; i++) {
    const before = dp[Math.max(i - 1, 0)]
    const row = [...dp[i]]
    for (let j = 1; j <= k; j++) {
      if (before[j - 1] > NEG) row[j] = Math.max(row[j], before[j - 1] + values[i])
    }
    dp.push(row)
    frames.push({
      phase: 'update', activeLine: LINE.pick,
      message: `${pass}: value ${values[i]} at position ${i}. Best totals for 0..${k} chosen: ${row.map(v => (v === NEG ? '—' : v)).join(', ')}.`,
      snapshot: { pass, index: i, value: values[i], row: row.slice(), taken: k, linePos: i, table: dp.map(r => r.slice()) },
    })
  }
  return dp[values.length][k]
}

export function buildTrace(input) {
  const { slices } = input
  const n = slices.length / 3
  const frames = []
  frames.push({
    phase: 'start', activeLine: LINE.start,
    message: `Choose ${n} of the ${slices.length} slices so that no two chosen slices are neighbours on the circle.`,
    snapshot: { slices, pass: null, index: null, row: null, value: null, taken: n, best: null },
  })
  frames.push({
    phase: 'inspect', activeLine: LINE.cut,
    message: 'Either the first slice or the last slice is left out in an optimum. Solve both lines.',
    snapshot: { slices, pass: null, index: null, row: null, value: null, taken: n, best: null },
  })
  const dropLast = pickTrace(slices.slice(0, -1), n, 'Without the last slice', frames)
  const dropFirst = pickTrace(slices.slice(1), n, 'Without the first slice', frames)
  const result = Math.max(dropLast, dropFirst)
  frames.push({
    phase: 'done', activeLine: LINE.done,
    message: `Best without the last slice: ${dropLast}. Best without the first slice: ${dropFirst}. The answer is ${result}.`,
    snapshot: { slices, pass: null, index: null, row: null, value: null, taken: n, best: result },
  })
  return { input, result, frames }
}

const CODE = [
  'function maxSizeSlices(slices) {',
  '  const n = slices.length / 3',
  '  return Math.max(pick(slices.slice(1), n), pick(slices.slice(0, -1), n))',
  '}',
  'function pick(values, k) {',
  '  const dp = [[0, ...Array(k).fill(-Infinity)]]',
  '  for (let i = 0; i < values.length; i++) {',
  '    const before = dp[Math.max(i - 1, 0)]',
  '    const row = [...dp[i]]',
  '    for (let j = 1; j <= k; j++) {',
  '      if (before[j - 1] > -Infinity) row[j] = Math.max(row[j], before[j - 1] + values[i])',
  '    }',
  '    dp.push(row)',
  '  }',
  '  return dp[values.length][k]',
  '}',
]
export const code = CODE.map((text, index) => ({ line: index + 1, text }))
export const pythonLineMap = { 1: 1, 2: 2, 3: 3, 4: 3, 5: 5, 6: 7, 7: 8, 8: 9, 9: 10, 10: 11, 11: 13, 12: 13, 13: 14, 14: 14, 15: 15, 16: 15 }

export const python = `def max_pizza(slices):
    n = len(slices) // 3
    return max(pick(slices[1:], n), pick(slices[:-1], n))

def pick(values, k):
    NEG = float('-inf')
    dp = [[0] + [NEG] * k]
    for i, v in enumerate(values):
        before = dp[max(i - 1, 0)]
        row = dp[i][:]
        for j in range(1, k + 1):
            if before[j - 1] > NEG:
                row[j] = max(row[j], before[j - 1] + v)
        dp.append(row)
    return dp[-1][k]`
