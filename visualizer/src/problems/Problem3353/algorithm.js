export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums.')
  const { nums } = input
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 10) throw new Error('nums holds 1 to 10 integers.')
  if (!nums.every(v => Number.isInteger(v) && v >= -50 && v <= 50)) throw new Error('Each value is an integer from -50 to 50.')
  return { nums }
}

// An operation on the prefix ending at index i changes only the gap between i and i + 1,
// so each unequal neighbour pair needs one operation, and one operation fixes it.
export const code = `minimum operations to make every value equal
  values = copy of nums
  ops = 0
  for i from 0 to n minus 2
    if values[i] differs from values[i + 1]
      delta = values[i + 1] minus values[i]
      add delta to every value at indices 0 through i
      ops = ops + 1
  return ops`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def min_total_operations(nums):
    values = list(nums)
    ops = 0
    for i in range(len(values) - 1):
        if values[i] != values[i + 1]:
            delta = values[i + 1] - values[i]
            for p in range(i + 1):
                values[p] += delta
            ops += 1
    return ops
`

const L = s => {
  const index = code.findIndex(c => c.text.includes(s))
  if (index < 0) throw new Error(`Missing pseudocode line: ${s}`)
  return index + 1
}
const P = s => {
  const index = python.split('\n').findIndex(line => line.includes(s))
  if (index < 0) throw new Error(`Missing python line: ${s}`)
  return index + 1
}

export function buildTrace({ nums }) {
  const frames = []
  const values = [...nums]
  let ops = 0
  const push = (phase, codeText, pyText, message, extra = {}) => {
    frames.push({
      phase, activeLine: L(codeText), pythonLine: P(pyText), message,
      values: [...values], ops, index: -1, delta: 0, nums, ...extra,
    })
  }

  push('start', 'values = copy of nums', 'values = list(nums)', `Start with ${values.length} value${values.length === 1 ? '' : 's'}; no operations yet.`)
  for (let i = 0; i + 1 < values.length; i += 1) {
    if (values[i] === values[i + 1]) {
      push('check', 'if values[i] differs from values[i + 1]', 'if values[i] != values[i + 1]', `Positions ${i} and ${i + 1} already match; no operation here.`, { index: i })
      continue
    }
    const delta = values[i + 1] - values[i]
    push('check', 'if values[i] differs from values[i + 1]', 'if values[i] != values[i + 1]', `Positions ${i} and ${i + 1} differ by ${Math.abs(delta)}; one prefix operation closes the gap.`, { index: i, delta })
    for (let p = 0; p <= i; p += 1) values[p] += delta
    ops += 1
    push('apply', 'add delta to every value at indices 0 through i', 'values[p] += delta', `Add ${delta} to indices 0 through ${i}; operations so far: ${ops}.`, { index: i, delta })
  }
  push('done', 'return ops', 'return ops', `All values are now ${values[values.length - 1]}; the answer is ${ops}.`, { result: ops })
  return { input: { nums }, result: ops, frames }
}
