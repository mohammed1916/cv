export const phases = [
  { id: 'start', label: 'Start', description: 'The missing count before index i is arr[i] - (i + 1), and it never decreases. Search for the first index where it reaches k.' },
  { id: 'inspect', label: 'Inspect midpoint', description: 'Count the positives missing before arr[mid].' },
  { id: 'update', label: 'Move window', description: 'Keep the half of the window that still contains the boundary.' },
  { id: 'done', label: 'Answer', description: 'lo values of the array lie below the answer, so the answer is lo + k.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object such as {"arr": [2, 3, 7], "k": 2}.')
  const { arr, k } = input
  if (!Array.isArray(arr) || arr.length < 1 || arr.length > 60) throw new Error('arr is a list of 1 to 60 integers.')
  if (!arr.every(v => Number.isInteger(v) && v >= 1 && v <= 200)) throw new Error('arr values are integers from 1 to 200.')
  if (!arr.every((v, i) => i === 0 || v > arr[i - 1])) throw new Error('arr must be strictly increasing.')
  if (!Number.isInteger(k) || k < 1 || k > 100) throw new Error('k is an integer from 1 to 100.')
  return { arr, k }
}

export function buildTrace({ arr, k }) {
  const frames = []
  let lo = 0
  let hi = arr.length
  const snap = (mid, missing, extra = {}) => ({ lo, hi, mid, missing, k, ...extra })
  frames.push({ phase: 'start', activeLine: L('lo, hi = 0'), pythonLine: P('lo, hi = 0'), snapshot: snap(null, null), message: `Search the whole array for the first index whose missing count reaches ${k}.` })
  while (lo < hi) {
    const mid = (lo + hi) >> 1
    const missing = arr[mid] - (mid + 1)
    frames.push({ phase: 'inspect', activeLine: L('mid = '), pythonLine: P('mid = '), snapshot: snap(mid, missing), message: `mid ${mid} holds ${arr[mid]}, so ${missing} positive(s) are missing before it.` })
    if (missing < k) {
      lo = mid + 1
      frames.push({ phase: 'update', activeLine: L('lo = mid + 1'), pythonLine: P('lo = mid + 1'), snapshot: snap(mid, missing), message: `${missing} < ${k}: the answer lies after index ${mid}.` })
    } else {
      hi = mid
      frames.push({ phase: 'update', activeLine: L('hi = mid'), pythonLine: P('hi = mid'), snapshot: snap(mid, missing), message: `${missing} >= ${k}: index ${mid} is a candidate, so search the left part.` })
    }
  }
  const result = lo + k
  frames.push({ phase: 'done', activeLine: L('return'), pythonLine: P('return'), snapshot: snap(null, null, { result }), message: `${lo} array values precede the answer, so the answer is ${lo} + ${k} = ${result}.` })
  return { input: { arr, k }, result, frames }
}

export const code = `kth missing (arr, k):
  lo, hi = 0, len(arr)
  while lo < hi:
    mid = (lo + hi) // 2
    missing = arr[mid] - (mid + 1)
    if missing < k:
      lo = mid + 1
    else:
      hi = mid
  return lo + k`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def find_kth_positive(arr, k):
    lo, hi = 0, len(arr)
    while lo < hi:
        mid = (lo + hi) // 2
        missing = arr[mid] - (mid + 1)
        if missing < k:
            lo = mid + 1
        else:
            hi = mid
    return lo + k
`
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1
