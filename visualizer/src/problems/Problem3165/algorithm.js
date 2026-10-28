const MOD = 1000000007

export function parseInput(text) {
  const data = JSON.parse(text)
  const nums = data?.nums
  const queries = data?.queries
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 8 || nums.some(v => !Number.isInteger(v) || Math.abs(v) > 20)) {
    throw new Error('nums must be 1 to 8 integers from -20 to 20.')
  }
  if (!Array.isArray(queries) || queries.length < 1 || queries.length > 5) throw new Error('queries must be 1 to 5 pairs of [position, value].')
  for (const q of queries) {
    if (!Array.isArray(q) || q.length !== 2 || !Number.isInteger(q[0]) || q[0] < 0 || q[0] >= nums.length || !Number.isInteger(q[1]) || Math.abs(q[1]) > 20) {
      throw new Error('Each query is [position, value], with the position inside nums and the value from -20 to 20.')
    }
  }
  return { nums, queries }
}

export const code = `sum of best non-adjacent sums over all queries(nums, queries)
  total = 0
  for each [pos, x] in queries
    set nums[pos] to x
    skipped = 0, taken = negative infinity
    for each value v in nums
      remember the old taken value
      taken = skipped + v
      skipped = the larger of skipped and the remembered taken
    add the larger of skipped and taken to total, modulo 1000000007
  return total`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

// The best sum with the last value skipped is kept apart from the best sum with it taken, so no two chosen values are adjacent.
export function buildTrace({ nums, queries }) {
  const values = [...nums]
  let total = 0
  const frames = [{ phase: 'start', index: -1, values: [...values], skipped: 0, taken: null, total, activeLine: L('total = 0'), message: 'Start with a total of zero. Each query changes one value and then re-solves the array.' }]
  for (const [pos, x] of queries) {
    values[pos] = x
    frames.push({ phase: 'query', index: pos, values: [...values], skipped: null, taken: null, total, activeLine: L('set nums[pos] to x'), message: `Query sets position ${pos} to ${x}.` })
    let skipped = 0
    let taken = -Infinity
    values.forEach((v, i) => {
      const previous = taken
      taken = skipped + v
      skipped = Math.max(skipped, previous)
      frames.push({ phase: 'element', index: i, values: [...values], skipped, taken: Number.isFinite(taken) ? taken : null, total, activeLine: L('taken = skipped + v'), message: `Value ${v}: taking it gives ${taken}, skipping it leaves ${skipped}.` })
    })
    const best = Math.max(skipped, taken)
    total = (total + best) % MOD
    frames.push({ phase: 'record', index: -1, values: [...values], skipped, taken: Number.isFinite(taken) ? taken : null, total, activeLine: L('add the larger of skipped'), message: `Best sum for this array is ${best}; running total ${total}.` })
  }
  frames.push({ phase: 'done', index: -1, values: [...values], skipped: null, taken: null, total, activeLine: L('return total'), message: `Sum of all query answers: ${total}.` })
  return { input: { nums, queries }, result: total, frames }
}

export const python = `def sum_of_best_after_queries(nums, queries):
    MOD = 1000000007
    values = list(nums)
    total = 0
    for pos, x in queries:
        values[pos] = x
        skipped, taken = 0, float('-inf')
        for v in values:
            previous = taken
            taken = skipped + v
            skipped = max(skipped, previous)
        total = (total + max(skipped, taken)) % MOD
    return total
`
