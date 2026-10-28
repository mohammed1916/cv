export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Array.isArray(input.nums) || input.nums.length < 1 || input.nums.length > 12) throw new Error('Use an object with nums: an array of 1 to 12 integers.')
  if (input.nums.some(v => !Number.isInteger(v) || v < 1 || v > 100)) throw new Error('Each nums entry is an integer from 1 to 100.')
  if (!Array.isArray(input.queries) || input.queries.length < 1 || input.queries.length > 5) throw new Error('Use queries: an array of 1 to 5 [l, r] pairs.')
  const n = input.nums.length
  if (input.queries.some(q => !Array.isArray(q) || q.length !== 2 || !Number.isInteger(q[0]) || !Number.isInteger(q[1]) || q[0] < 0 || q[1] >= n || q[0] > q[1])) throw new Error('Each query is [l, r] with 0 <= l <= r < nums.length.')
  return { nums: input.nums, queries: input.queries }
}

export function buildTrace(input) {
  const { nums, queries } = input
  const values = [...new Set(nums)].sort((a, b) => a - b)
  // prefix[v][i] counts how many of the first i numbers equal v.
  const prefix = {}
  for (const v of values) {
    const counts = [0]
    for (const x of nums) counts.push(counts[counts.length - 1] + (x === v ? 1 : 0))
    prefix[v] = counts
  }
  const frames = [{ phase: 'start', activeLine: L('build prefix counts'), index: -1, range: null, present: [], best: null, message: `The array has ${values.length} distinct values. Build a running count for each.` }]
  const result = queries.map(([l, r], q) => {
    let best = -1
    let previous = null
    const present = []
    frames.push({ phase: 'query', activeLine: L('set best to -1'), index: r, range: [l, r], present: [], best: -1, query: q, message: `Query [${l}, ${r}]: list the values present in this range in increasing order.` })
    for (const v of values) {
      if (prefix[v][r + 1] - prefix[v][l] <= 0) continue
      present.push(v)
      if (previous !== null) {
        const gap = v - previous
        best = best === -1 ? gap : Math.min(best, gap)
      }
      previous = v
      frames.push({ phase: 'value', activeLine: L('if a previous value exists'), index: r, range: [l, r], present: [...present], best, query: q, message: `Value ${v} is present. Smallest gap between neighbours so far: ${best === -1 ? 'none' : best}.` })
    }
    frames.push({ phase: 'answer', activeLine: L('add best to answers'), index: r, range: [l, r], present: [...present], best, query: q, message: `Answer for [${l}, ${r}] is ${best}.` })
    return best
  })
  frames.push({ phase: 'done', activeLine: L('return answers'), index: -1, range: null, present: [], best: null, message: `Answers: ${result.join(', ')}.` })
  return { input, result, frames }
}

export const code = `minimum absolute difference between distinct values in each range
  set values to the sorted distinct values of nums
  build prefix counts for each value in values
  set answers to an empty list
  for each query [l, r] do
    set best to -1 and previous to nothing
    for each value v in values do
      if v appears between l and r then
        if a previous value exists then
          set best to the smaller of best and v minus previous, unless best is -1
        set previous to v
    add best to answers
  return answers`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def min_abs_difference_queries(nums, queries):
    values = sorted(set(nums))
    prefix = {}
    for v in values:
        counts = [0]
        for x in nums:
            counts.append(counts[-1] + (1 if x == v else 0))
        prefix[v] = counts
    answers = []
    for l, r in queries:
        best = -1
        previous = None
        for v in values:
            if prefix[v][r + 1] - prefix[v][l] <= 0:
                continue
            if previous is not None:
                gap = v - previous
                best = gap if best == -1 else min(best, gap)
            previous = v
        answers.append(best)
    return answers
`
