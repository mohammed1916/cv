const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b))

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || !Array.isArray(data.nums) || !Array.isArray(data.queries) || !Number.isInteger(data.p)) {
    throw new Error('Use {"nums": [...], "p": p, "queries": [[index, value], ...]}.')
  }
  const { nums, p, queries } = data
  if (nums.length < 2 || nums.length > 8) throw new Error('nums must have 2 to 8 entries for the visualization.')
  if (nums.some(v => !Number.isInteger(v) || v < 1 || v > 60)) throw new Error('nums entries are integers from 1 to 60.')
  if (p < 1 || p > 30) throw new Error('p is an integer from 1 to 30.')
  if (queries.length < 1 || queries.length > 10) throw new Error('Use 1 to 10 queries.')
  for (const q of queries) {
    if (!Array.isArray(q) || q.length !== 2) throw new Error('Each query is [index, value].')
    if (!Number.isInteger(q[0]) || q[0] < 0 || q[0] >= nums.length) throw new Error('Query index is out of range.')
    if (!Number.isInteger(q[1]) || q[1] < 1 || q[1] > 60) throw new Error('Query value is an integer from 1 to 60.')
  }
  return { nums, p, queries }
}

export function buildTrace(input) {
  const { nums, p, queries } = input
  const n = nums.length
  const values = [...nums]
  let count = 0
  const frames = [{ phase: 'start', activeLine: L('let count be 0'), values: [...values], best: [], good: null, count, message: `Each query changes one value; after it, look for a subset of size below ${n} with gcd exactly ${p}.` }]
  queries.forEach(([index, value], q) => {
    values[index] = value
    frames.push({ phase: 'update', activeLine: L('set values at index'), values: [...values], best: [], good: null, count, index, message: `Query ${q + 1} sets position ${index} to ${value}.` })
    let best = new Map()
    for (const x of values) {
      if (x % p !== 0) continue
      const updates = new Map([[x, 1]])
      for (const [g, s] of best) {
        const h = gcd(g, x)
        if (!updates.has(h) || s + 1 < updates.get(h)) updates.set(h, s + 1)
      }
      for (const [g, s] of updates) if (!best.has(g) || s < best.get(g)) best.set(g, s)
      frames.push({ phase: 'element', activeLine: L('extend every entry'), values: [...values], best: [...best].map(([g, s]) => [g, s]), good: null, count, index, message: `Element ${x} joins the table. Smallest size for each gcd: ${[...best].map(([g, s]) => `${g}:${s}`).join(', ')}.` })
    }
    const good = best.has(p) && best.get(p) < n
    if (good) count++
    frames.push({ phase: 'check', activeLine: L('if best has gcd p'), values: [...values], best: [...best].map(([g, s]) => [g, s]), good, count, index, message: good ? `A good subsequence exists after query ${q + 1}. Count is ${count}.` : `No subset of size below ${n} has gcd ${p} after query ${q + 1}.` })
  })
  frames.push({ phase: 'done', activeLine: L('return count'), values: [...values], best: [], good: null, count, message: `Queries with a good subsequence: ${count}.` })
  return { input, result: count, frames }
}

export const code = `count the queries that leave a good subsequence
  let count be 0
  let values be a copy of nums
  for each query (index, value) in order
    set values at index to value
    let best be an empty map from gcd to smallest subset size
    for each element x that is a multiple of p
      extend every entry of best with x and add x alone
    if best has gcd p with size less than n then
      add 1 to count
  return count`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def good_subsequence_queries(nums, p, queries):
    from math import gcd
    n = len(nums)
    values = list(nums)
    count = 0
    for index, value in queries:
        values[index] = value
        best = {}
        for x in values:
            if x % p != 0:
                continue
            updates = {x: 1}
            for g, s in best.items():
                h = gcd(g, x)
                if h not in updates or s + 1 < updates[h]:
                    updates[h] = s + 1
            for g, s in updates.items():
                if g not in best or s < best[g]:
                    best[g] = s
        if p in best and best[p] < n:
            count += 1
    return count
`
