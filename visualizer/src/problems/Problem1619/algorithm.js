export const phases = [
  { id: 'start', label: 'Start', description: 'Count the values and work out how many to drop from each end: five percent of the length.' },
  { id: 'sort', label: 'Sort', description: 'Put the values in order so the smallest and largest are at the two ends.' },
  { id: 'trim', label: 'Trim ends', description: 'Remove the smallest k and the largest k values.' },
  { id: 'sum', label: 'Average', description: 'Add the kept values and divide by how many remain.' },
  { id: 'done', label: 'Result', description: 'Report the trimmed mean.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object such as {"arr": [1, 2, 3, ...]}.')
  const { arr } = input
  if (!Array.isArray(arr) || arr.length < 20 || arr.length > 40 || arr.length % 20 !== 0) throw new Error('arr must hold 20, 40 values (a multiple of 20 so five percent is whole).')
  if (!arr.every(v => Number.isInteger(v) && v >= 0 && v <= 1000)) throw new Error('Each value is an integer from 0 to 1000.')
  return { arr }
}

// Lines of the solver the story points at (1-based, matching `code` below).
const L = s => code.findIndex(c => c.text.includes(s)) + 1
const P = s => python.split('\n').findIndex(line => line.includes(s)) + 1

export function buildTrace({ arr }) {
  const frames = []
  const n = arr.length
  const k = n / 20
  const at = (pseudo, py) => ({ activeLine: L(pseudo), pythonLine: P(py) })
  const base = { sorted: null, removedLow: [], removedHigh: [], kept: null, total: 0 }

  frames.push({ phase: 'start', ...at('n = len(arr)', 'n = len(arr)'),
    message: `There are ${n} values. Five percent of ${n} is ${k}, so the ${k} smallest and ${k} largest values are dropped.`,
    snapshot: { ...base, input: arr, k } })

  const sorted = [...arr].sort((p, q) => p - q)
  frames.push({ phase: 'sort', ...at('sort arr', 'arr = sorted(arr)'),
    message: `Sorted: [${sorted.join(', ')}].`, snapshot: { ...base, sorted, k } })

  const removedLow = [], removedHigh = []
  for (let t = 0; t < k; t++) {
    removedLow.push(sorted[t])
    frames.push({ phase: 'trim', ...at('kept = arr[k', 'kept = arr[k'),
      message: `Drop ${sorted[t]} from the bottom end.`, snapshot: { ...base, sorted, k, removedLow: [...removedLow], removedHigh: [...removedHigh] } })
  }
  for (let t = 0; t < k; t++) {
    removedHigh.push(sorted[n - 1 - t])
    frames.push({ phase: 'trim', ...at('kept = arr[k', 'kept = arr[k'),
      message: `Drop ${sorted[n - 1 - t]} from the top end.`, snapshot: { ...base, sorted, k, removedLow: [...removedLow], removedHigh: [...removedHigh] } })
  }

  const kept = sorted.slice(k, n - k)
  let total = 0
  for (const value of kept) {
    total += value
    frames.push({ phase: 'sum', ...at('total += v', 'total += v'),
      message: `Add ${value}; the running total is ${total}.`,
      snapshot: { sorted, k, removedLow, removedHigh, kept, total } })
  }

  const mean = total / kept.length
  frames.push({ phase: 'done', ...at('return total / len(kept)', 'return total / len(kept)'),
    message: `${total} divided by ${kept.length} kept values gives ${mean.toFixed(5)}.`,
    snapshot: { sorted, k, removedLow, removedHigh, kept, total, mean } })
  return { input: { arr }, result: mean, frames }
}

export const code = `trimmed mean (arr):
  n = len(arr)
  k = n / 20
  sort arr
  kept = arr[k : n - k]
  total = 0
  for v in kept: total += v
  return total / len(kept)`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def trimmed_mean(arr):
    n = len(arr)
    k = n // 20
    arr = sorted(arr)
    kept = arr[k:n - k]
    total = 0
    for v in kept:
        total += v
    return total / len(kept)
`
