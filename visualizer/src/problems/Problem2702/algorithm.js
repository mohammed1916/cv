// Visualization caps: up to 8 values, each 1 to 50, with 1 <= y < x <= 10.
const MAX_LEN = 8
const MAX_VALUE = 50
const MAX_X = 10

export const code = `function minOperations(nums, x, y) {
  let lo = 0, hi = Math.max(...nums); // set lo to 0 and hi to the largest value
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2); // set mid to the middle of lo and hi
    let picks = 0;
    for (const v of nums) {
      const left = v - mid * y;
      if (left > 0) picks += Math.ceil(left / (x - y)); // if left is positive, add the picks it needs
    }
    if (picks <= mid) hi = mid; // if picks is at most mid, mid works
    else lo = mid + 1; // otherwise set lo to mid plus 1
  }
  return lo; // return lo
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def min_operations(nums, x, y):
    lo, hi = 0, max(nums)
    while lo < hi:
        mid = (lo + hi) // 2
        picks = 0
        for v in nums:
            left = v - mid * y
            if left > 0:
                picks += -(-left // (x - y))
        if picks <= mid:
            hi = mid
        else:
            lo = mid + 1
    return lo`

const L = (text) => {
  const index = code.findIndex((line) => line.text.includes(text))
  if (index < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return index + 1
}

const PY_LINES = python.split('\n')
const PY = (text) => {
  const index = PY_LINES.findIndex((line) => line.includes(text))
  if (index < 0) throw new Error(`Missing python line: ${text}`)
  return index + 1
}

export const phases = [
  { id: 'start', label: 'Range', description: 'Set the search range for the number of operations k.' },
  { id: 'probe', label: 'Probe', description: 'Test whether mid operations are enough.' },
  { id: 'element', label: 'Element', description: 'Work out how many chosen operations this value still needs.' },
  { id: 'feasible', label: 'Enough', description: 'The picks fit inside mid, so mid works.' },
  { id: 'infeasible', label: 'Too few', description: 'The picks exceed mid, so more operations are needed.' },
  { id: 'done', label: 'Result', description: 'lo is the fewest operations that work.' },
]

export function parseInput(text) {
  const input = typeof text === 'string' ? JSON.parse(text) : text
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums, x and y.')
  const { nums, x, y } = input
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > MAX_LEN) throw new Error(`nums has 1 to ${MAX_LEN} values in this visualization.`)
  if (!nums.every((v) => Number.isInteger(v) && v >= 1 && v <= MAX_VALUE)) throw new Error(`Each value is an integer from 1 to ${MAX_VALUE}.`)
  if (!Number.isInteger(x) || !Number.isInteger(y) || y < 1 || x <= y || x > MAX_X) throw new Error(`Use integers with 1 <= y < x <= ${MAX_X}.`)
  return { nums, x, y }
}

export function buildTrace({ nums, x, y }) {
  const frames = []
  let lo = 0
  let hi = Math.max(...nums)
  const frame = (phase, activeText, pythonText, message, state = {}) => frames.push({
    phase,
    activeLine: L(activeText),
    pythonLine: PY(pythonText),
    message,
    lo,
    hi,
    mid: null,
    rows: [],
    picks: null,
    ...state,
  })

  frame('start', 'set lo to 0 and hi to the largest value', 'lo, hi = 0, max(nums)', `Search k from ${lo} to ${hi}.`)
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2)
    frame('probe', 'set mid to the middle', 'mid = (lo + hi) // 2', `Test whether ${mid} operation${mid === 1 ? '' : 's'} can be enough.`, { mid })
    let picks = 0
    const rows = []
    for (const v of nums) {
      const left = v - mid * y
      const need = left > 0 ? Math.ceil(left / (x - y)) : 0
      picks += need
      rows.push({ value: v, left, need })
      frame('element', 'if left is positive', 'if left > 0:', `${v} minus ${mid} times ${y} leaves ${left}, so it needs ${need} chosen operation${need === 1 ? '' : 's'}.`, { mid, rows: rows.slice(), picks })
    }
    if (picks <= mid) {
      hi = mid
      frame('feasible', 'if picks is at most mid', 'if picks <= mid:', `${picks} picks fit within ${mid}, so ${mid} works and hi becomes ${mid}.`, { mid, rows: rows.slice(), picks })
    } else {
      lo = mid + 1
      frame('infeasible', 'otherwise set lo to mid plus 1', 'lo = mid + 1', `${picks} picks exceed ${mid}, so lo becomes ${lo}.`, { mid, rows: rows.slice(), picks })
    }
  }
  frame('done', 'return lo', 'return lo', `The fewest operations is ${lo}.`)
  return { input: { nums, x, y }, result: lo, frames }
}
