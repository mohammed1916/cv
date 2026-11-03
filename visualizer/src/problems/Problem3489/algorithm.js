const PSEUDO = [
  'find the smallest k that makes nums zero',
  'if every value is already zero return 0',
  'cap is the largest value in nums',
  'each index starts with only the sum zero reachable',
  'for k from 1 to the number of queries',
  'each index in the query range may take val or skip it',
  'if every index can reach its value return k',
  'return -1',
]
export const code = PSEUDO.map((text, index) => ({ line: index + 1, text }))
const PS = key => code.find(entry => entry.text.includes(key))?.line ?? 1

export const python = `def min_queries_to_zero(nums, queries):
    if all(x == 0 for x in nums):
        return 0
    cap = max(nums)
    reach = [[False] * (cap + 1) for _ in nums]
    for row in reach:
        row[0] = True
    for k, (l, r, val) in enumerate(queries, start=1):
        for i in range(l, r + 1):
            for s in range(cap, val - 1, -1):
                if reach[i][s - val]:
                    reach[i][s] = True
        if all(reach[i][nums[i]] for i in range(len(nums))):
            return k
    return -1
`
const PYTHON_LINES = python.split('\n')
const PY = key => PYTHON_LINES.findIndex(text => text.includes(key)) + 1

const frame = fields => ({ ...fields, activeLine: PS(fields.pseudo), pythonLine: PY(fields.py) })

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums and queries.')
  const { nums, queries } = input
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 6 || !nums.every(v => Number.isInteger(v) && v >= 0 && v <= 12)) {
    throw new Error('nums has 1 to 6 integers from 0 to 12.')
  }
  if (!Array.isArray(queries) || queries.length < 1 || queries.length > 8) throw new Error('queries has 1 to 8 entries.')
  for (const query of queries) {
    if (!Array.isArray(query) || query.length !== 3) throw new Error('Each query is [l, r, val].')
    const [l, r, val] = query
    if (!Number.isInteger(l) || !Number.isInteger(r) || l < 0 || r < l || r >= nums.length) throw new Error('Each query needs 0 <= l <= r < nums.length.')
    if (!Number.isInteger(val) || val < 1 || val > 6) throw new Error('Each val is an integer from 1 to 6.')
  }
  return { nums, queries }
}

// Each query either decrements an index in its range by val or leaves it alone, so a value is
// reachable at an index when it is a subset sum of the vals of the queries covering that index.
export function buildTrace({ nums, queries }) {
  const frames = []
  const cap = Math.max(...nums)
  const reach = nums.map(() => Array(cap + 1).fill(false))
  reach.forEach(row => { row[0] = true })
  const listOf = row => row.flatMap((ok, s) => (ok ? [s] : []))
  const snapshot = () => reach.map(listOf)
  if (nums.every(x => x === 0)) {
    frames.push(frame({ phase: 'zero', pseudo: 'if every value is already zero', py: 'if all(x == 0', at: -1, k: 0, query: null, reach: snapshot(), range: null,
      message: 'Every value is already zero, so k = 0.' }))
    frames.push(frame({ phase: 'done', pseudo: 'return k', py: 'return 0', at: -1, k: 0, query: null, reach: snapshot(), range: null, message: 'Answer: 0.' }))
    return { input: { nums, queries }, result: 0, frames }
  }
  frames.push(frame({ phase: 'start', pseudo: 'cap is the largest value', py: 'cap = max(nums)', at: -1, k: 0, query: null, reach: snapshot(), range: null,
    message: `Sums above ${cap} can never help, so track reachable sums up to ${cap}.` }))
  for (let k = 1; k <= queries.length; k++) {
    const [l, r, val] = queries[k - 1]
    frames.push(frame({ phase: 'query', pseudo: 'for k from 1', py: 'for k, (l, r, val)', at: l, k, query: [l, r, val], reach: snapshot(), range: [l, r],
      message: `Query ${k}: indices ${l} to ${r} may each drop by ${val} or stay.` }))
    for (let i = l; i <= r; i++) {
      for (let s = cap; s >= val; s--) {
        if (reach[i][s - val]) reach[i][s] = true
      }
      frames.push(frame({ phase: 'update', pseudo: 'each index in the query range', py: 'for i in range(l, r + 1)', at: i, k, query: [l, r, val], reach: snapshot(), range: [l, r],
        message: `Index ${i} can now total ${listOf(reach[i]).join(', ')}; target ${nums[i]}.` }))
    }
    const ok = nums.every((x, i) => reach[i][x])
    frames.push(frame({ phase: 'check', pseudo: 'if every index can reach its value', py: 'if all(reach[i][nums[i]]', at: -1, k, query: [l, r, val], reach: snapshot(), range: [l, r],
      message: ok ? `Every index reaches its target after ${k} queries.` : `Some index still misses its target after ${k} queries.` }))
    if (ok) {
      frames.push(frame({ phase: 'done', pseudo: 'return k', py: 'return k', at: -1, k, query: null, reach: snapshot(), range: null, message: `Answer: ${k}.` }))
      return { input: { nums, queries }, result: k, frames }
    }
  }
  frames.push(frame({ phase: 'done', pseudo: 'return -1', py: 'return -1', at: -1, k: queries.length, query: null, reach: snapshot(), range: null, message: 'No prefix of queries works: answer -1.' }))
  return { input: { nums, queries }, result: -1, frames }
}
