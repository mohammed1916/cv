const MOD = 1000000007n

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums, p and queries.')
  const { nums, p, queries } = input
  if (!Array.isArray(nums) || nums.length > 8 || !nums.every(v => Number.isInteger(v) && v >= 0 && v <= 9)) throw new Error('nums holds up to 8 integers from 0 to 9.')
  if (!Number.isInteger(p) || p < 0 || p > 9) throw new Error('p is an integer from 0 to 9.')
  if (!Array.isArray(queries) || queries.length < 1 || queries.length > 6) throw new Error('queries lists 1 to 6 [value, k] pairs.')
  let size = nums.length
  for (const q of queries) {
    if (!Array.isArray(q) || q.length !== 2 || !Number.isInteger(q[0]) || q[0] < 0 || q[0] > 9) throw new Error('Each query is [value 0 to 9, k].')
    size += 1
    if (!Number.isInteger(q[1]) || q[1] < 1 || q[1] > size) throw new Error('k must be between 1 and the number of elements after the insert.')
  }
  return { nums, p, queries }
}

function powMod(base, exp) {
  let result = 1n
  let b = BigInt(base) % MOD
  let e = BigInt(exp)
  while (e > 0n) {
    if (e & 1n) result = (result * b) % MOD
    b = (b * b) % MOD
    e >>= 1n
  }
  return result
}

// Keep the elements in a sorted list. After each insert, the k-th largest is the element at index size - k.
// Then p is replaced by p raised to that element, modulo 1000000007.
export function buildTrace({ nums, p, queries }) {
  const arr = [...nums].sort((a, b) => a - b)
  const frames = []
  const outputs = []
  let current = Number(p)
  const snap = extra => ({ arr: arr.slice(), p: current, ...extra })
  frames.push(snap({ pythonLine: PY('arr = sorted(nums)'), phase: 'start', activeLine: L('arr = nums in sorted order'), query: -1, value: null, k: null, x: null, before: null, insertAt: -1, message: `Start with ${arr.length} element${arr.length === 1 ? '' : 's'} and p = ${current}.` }))
  queries.forEach(([value, k], q) => {
    let at = arr.findIndex(v => v > value)
    if (at < 0) at = arr.length
    arr.splice(at, 0, value)
    frames.push(snap({ pythonLine: PY('insort(arr, value)'), phase: 'insert', activeLine: L('insert value into arr in sorted order'), query: q, value, k, x: null, before: current, insertAt: at, message: `Query ${q + 1}: insert ${value}; now ${arr.length} elements.` }))
    const x = arr[arr.length - k]
    frames.push(snap({ pythonLine: PY('x = arr[len(arr) - k]'), phase: 'select', activeLine: L('x = the element at position'), query: q, value, k, x, before: current, insertAt: at, message: `The ${k}${k === 1 ? 'st' : k === 2 ? 'nd' : k === 3 ? 'rd' : 'th'} largest is ${x}.` }))
    const before = current
    current = Number(powMod(before, x))
    outputs.push(current)
    frames.push(snap({ pythonLine: PY('p = pow(p, x, MOD)'), phase: 'power', activeLine: L('p = p raised to the power x'), query: q, value, k, x, before, insertAt: at, message: `p becomes ${before}^${x} mod 1000000007 = ${current}.` }))
  })
  frames.push(snap({ pythonLine: PY('return out'), phase: 'done', activeLine: L('return out'), query: -1, value: null, k: null, x: null, before: null, insertAt: -1, message: `Values of p after each query: [${outputs.join(', ')}].` }))
  return { input: { nums, p, queries }, result: outputs, frames }
}

export const code = `p after each query, where each query inserts a value and then raises p to a k-th largest element
  arr = nums in sorted order
  out = empty list
  for each [value, k] query
    insert value into arr in sorted order
    x = the element at position size minus k, the k-th largest
    p = p raised to the power x, modulo 1000000007
    append p to out
  return out`.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = s => {
  const index = code.findIndex(c => c.text.includes(s))
  if (index < 0) throw new Error(`Missing pseudocode line: ${s}`)
  return index + 1
}

export const python = `import bisect

def power_updates(nums, p, queries):
    MOD = 1000000007
    arr = sorted(nums)
    out = []
    for value, k in queries:
        bisect.insort(arr, value)
        x = arr[len(arr) - k]
        p = pow(p, x, MOD)
        out.append(p)
    return out
`

const PY = s => {
  const index = python.split('\n').findIndex(line => line.includes(s))
  if (index < 0) throw new Error(`Missing python line: ${s}`)
  return index + 1
}
