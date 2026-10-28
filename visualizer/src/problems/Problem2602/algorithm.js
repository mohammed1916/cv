export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.nums) || !Array.isArray(input.queries)) throw new Error('Use {"nums": [...], "queries": [...]}.')
  if (input.nums.length < 1 || input.nums.length > 8 || input.queries.length < 1 || input.queries.length > 5) throw new Error('Use 1 to 8 numbers and 1 to 5 queries.')
  if ([...input.nums, ...input.queries].some(v => !Number.isInteger(v) || v < 1 || v > 20)) throw new Error('Values are integers from 1 to 20.')
  return { nums: input.nums, queries: input.queries }
}

// Number of entries strictly below x, in a sorted list.
const countBelow = (list, x) => {
  let lo = 0
  let hi = list.length
  while (lo < hi) {
    const mid = (lo + hi) >> 1
    if (list[mid] < x) lo = mid + 1
    else hi = mid
  }
  return lo
}

export function buildTrace({ nums, queries }) {
  const ordered = [...nums].sort((a, b) => a - b)
  const n = ordered.length
  const prefix = [0]
  for (const value of ordered) prefix.push(prefix[prefix.length - 1] + value)
  const total = prefix[n]
  const answers = []
  const frames = [{ phase: 'start', activeLine: L('sort nums and build prefix sums'), query: null, below: null, cost: null, message: `Sorted numbers ${ordered.join(', ')}.` }]
  queries.forEach((target, index) => {
    const k = countBelow(ordered, target)
    const raise = target * k - prefix[k]
    const lower = total - prefix[k] - target * (n - k)
    const cost = raise + lower
    answers.push(cost)
    frames.push({ phase: 'query', activeLine: L('count the numbers below'), query: index, below: k, cost, message: `Target ${target}: ${k} numbers below it cost ${raise} to raise, the rest ${lower} to lower; total ${cost}.` })
  })
  frames.push({ phase: 'done', activeLine: L('return the stored costs'), query: null, below: null, cost: null, message: `Costs: ${answers.join(', ')}.` })
  return { input: { nums, queries }, result: answers, frames }
}

export const code = `minimum operations to make every number equal each query value
  sort nums and build prefix sums
  for each query value
    count the numbers below the query value
    cost of raising those numbers is query value times count minus their sum
    cost of lowering the rest is their sum minus query value times their count
    store the total cost
  return the stored costs`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def equalize_costs(nums, queries):
    import bisect
    ordered = sorted(nums)
    n = len(ordered)
    prefix = [0]
    for value in ordered:
        prefix.append(prefix[-1] + value)
    total = prefix[-1]
    answers = []
    for target in queries:
        k = bisect.bisect_left(ordered, target)
        raise_cost = target * k - prefix[k]
        lower_cost = (total - prefix[k]) - target * (n - k)
        answers.append(raise_cost + lower_cost)
    return answers
`
