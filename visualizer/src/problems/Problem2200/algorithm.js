// LeetCode 2200: Find All K-Distant Indices in an Array.
// Every index j holding key "vouches" for the indices within distance k of it. Walk j left to right and mark the
// window [j - k, j + k]; the marked indices, in order, are the answer. The walk keeps the marked set sorted.

const MAX_LEN = 14
const MAX_VALUE = 9

export function parseInput(text) {
  let spec
  try { spec = JSON.parse(text) } catch { throw new Error('Use JSON like {"nums":[3,4,9,6],"key":9,"k":1}.') }
  if (!spec || !Array.isArray(spec.nums) || !Number.isInteger(spec.key) || !Number.isInteger(spec.k)) throw new Error('Give nums, key and k.')
  if (spec.nums.length < 1 || spec.nums.length > MAX_LEN) throw new Error(`Use 1 to ${MAX_LEN} values. The visualization caps the length there.`)
  if (!spec.nums.every(v => Number.isInteger(v) && v >= 0 && v <= MAX_VALUE)) throw new Error(`Each value is an integer from 0 to ${MAX_VALUE}.`)
  if (spec.k < 0 || spec.k > spec.nums.length) throw new Error('k is from 0 up to the array length.')
  if (!spec.nums.includes(spec.key)) throw new Error('key must appear in nums.')
  return { nums: spec.nums, key: spec.key, k: spec.k }
}

export const code = `FUNCTION findKDistantIndices(nums, key, k)
    n ← length of nums
    marked ← array of n false values
    FOR j from 0 to n - 1
        IF nums[j] = key THEN
            FOR i from max(0, j - k) to min(n - 1, j + k)
                marked[i] ← true
    result ← indices i where marked[i] is true, in order
    RETURN result`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def find_k_distant_indices(nums, key, k):
    n = len(nums)
    marked = [False] * n
    for j in range(n):
        if nums[j] == key:
            for i in range(max(0, j - k), min(n - 1, j + k) + 1):
                marked[i] = True
    return [i for i in range(n) if marked[i]]
`

const L = text => {
  const index = code.findIndex(line => line.text.includes(text))
  if (index < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return index + 1
}
const P = text => {
  const index = python.split('\n').findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing python line: ${text}`)
  return index + 1
}

export const phases = [
  { id: 'start', label: 'Scan', description: 'Nothing is marked yet.' },
  { id: 'mark', label: 'Mark windows', description: 'Each key index marks the indices within k of it.' },
  { id: 'done', label: 'Result', description: 'The marked indices in order.' },
]

export function buildTrace({ nums, key, k }) {
  const n = nums.length
  const marked = Array(n).fill(false)
  const frames = []
  const push = (phase, j, activeLine, pythonLine, message, extra = {}) => frames.push({
    phase, index: j, j, l: j >= 0 ? Math.max(0, j - k) : -1, r: j >= 0 ? Math.min(n - 1, j + k) : -1,
    activeLine, pythonLine, message, nums, key, k, marked: marked.slice(), ...extra,
  })
  push('start', -1, L('marked ← array'), P('marked = [False]'), `Find every index within ${k} of a ${key}.`)
  for (let j = 0; j < n; j++) {
    if (nums[j] !== key) continue
    const lo = Math.max(0, j - k)
    const hi = Math.min(n - 1, j + k)
    for (let i = lo; i <= hi; i++) marked[i] = true
    push('mark', j, L('IF nums[j] = key'), P('if nums[j] == key'),
      `Index ${j} holds ${key}. It marks ${lo} to ${hi}.`, { lo, hi })
  }
  const result = []
  marked.forEach((m, i) => { if (m) result.push(i) })
  push('done', -1, L('RETURN result'), P('return [i for i'), `Result: ${result.join(', ')}.`, { result })
  return { input: { nums, key, k }, result, frames }
}
