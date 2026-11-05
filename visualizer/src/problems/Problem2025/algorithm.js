export const phases = [
  { id: 'start', label: 'Pivots', description: 'A pivot p splits the array into a left part before p and a right part from p; it is valid when the two sums are equal.' },
  { id: 'nochange', label: 'Without a change', description: 'Count the pivots that are already valid.' },
  { id: 'change', label: 'Change one index', description: 'Changing index i by delta moves every pivot on one side of i; count the pivots that become valid.' },
  { id: 'done', label: 'Result', description: 'Return the largest count over no change and every single change.' },
]

export const code = `function waysToPartition(nums, k) {
  const n = nums.length
  const total = nums.reduce((sum, v) => sum + v, 0)
  const leftSums = []
  let prefix = 0
  for (let p = 1; p < n; p++) {
    prefix += nums[p - 1]
    leftSums[p] = prefix
  }
  let best = 0
  let base = 0
  for (let p = 1; p < n; p++) if (2 * leftSums[p] === total) base++
  best = base
  for (let i = 0; i < n; i++) {
    const delta = k - nums[i]
    let count = 0
    for (let p = 1; p < n; p++) {
      const diff = 2 * leftSums[p] - total
      if (p <= i && diff === delta) count++
      if (p > i && diff === -delta) count++
    }
    best = Math.max(best, count)
  }
  return best
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def ways_to_partition(nums, k):
    n = len(nums)
    total = sum(nums)
    left_sums = [0] * n
    prefix = 0
    for p in range(1, n):
        prefix += nums[p - 1]
        left_sums[p] = prefix
    base = sum(1 for p in range(1, n) if 2 * left_sums[p] == total)
    best = base
    for i in range(n):
        delta = k - nums[i]
        count = 0
        for p in range(1, n):
            diff = 2 * left_sums[p] - total
            if p <= i and diff == delta:
                count += 1
            if p > i and diff == -delta:
                count += 1
        best = max(best, count)
    return best
`

const C = fragment => code.findIndex(c => c.text.includes(fragment)) + 1
const P = fragment => python.split('\n').findIndex(line => line.includes(fragment)) + 1

export function parseInput(text) {
  let obj
  try { obj = JSON.parse(text) } catch { throw new Error('Use a JSON object such as {"nums":[2,-1,2],"k":0}.') }
  const { nums, k } = obj || {}
  if (!Array.isArray(nums) || nums.length < 2 || nums.length > 30 || !nums.every(v => Number.isInteger(v) && Math.abs(v) <= 100)) {
    throw new Error('nums must have 2 to 30 whole numbers between -100 and 100.')
  }
  if (!Number.isInteger(k) || Math.abs(k) > 100) throw new Error('k must be a whole number between -100 and 100.')
  return { nums, k }
}

export function buildTrace({ nums, k }) {
  const frames = []
  const n = nums.length
  const total = nums.reduce((sum, v) => sum + v, 0)
  const leftSums = []
  let prefix = 0
  for (let p = 1; p < n; p++) {
    prefix += nums[p - 1]
    leftSums[p] = prefix
  }
  const add = (phase, c, p, message, change, count) => frames.push({
    phase, activeLine: C(c), pythonLine: P(p), message,
    snapshot: { nums, k, total, leftSums, change, count, best: frames.length ? frames[frames.length - 1].snapshot.best : 0 },
  })
  add('start', 'const total', 'total = sum', `Total ${total}; ${n - 1} possible pivots.`, null, 0)
  let base = 0
  for (let p = 1; p < n; p++) if (2 * leftSums[p] === total) base++
  let best = base
  add('nochange', 'let base = 0', 'base = sum', `${base} pivot(s) are valid without changing anything.`, null, base)
  for (let i = 0; i < n; i++) {
    const delta = k - nums[i]
    let count = 0
    for (let p = 1; p < n; p++) {
      const diff = 2 * leftSums[p] - total
      if (p <= i && diff === delta) count++
      if (p > i && diff === -delta) count++
    }
    best = Math.max(best, count)
    add('change', 'for (let i = 0; i < n', 'for i in range(n)', `Change index ${i} to ${k}: ${count} valid pivot(s).`, { index: i, delta }, count)
  }
  add('done', 'return best', 'return best', `Maximum number of valid pivots: ${best}.`, null, best)
  return { input: { nums, k }, result: best, frames }
}
