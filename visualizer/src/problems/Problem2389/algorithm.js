export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.nums) || !Array.isArray(input.queries)) throw new Error('Use {"nums": [...], "queries": [...]}.')
  if (input.nums.length < 1 || input.nums.length > 8 || input.queries.length < 1 || input.queries.length > 6) throw new Error('Use 1 to 8 numbers and 1 to 6 queries.')
  if (input.nums.some(v => !Number.isInteger(v) || v < 1 || v > 20)) throw new Error('Numbers are integers from 1 to 20.')
  if (input.queries.some(v => !Number.isInteger(v) || v < 1 || v > 60)) throw new Error('Queries are integers from 1 to 60.')
  return { nums: input.nums, queries: input.queries }
}

export function buildTrace({ nums, queries }) {
  const ordered = [...nums].sort((a, b) => a - b)
  const prefix = [0]
  for (const value of ordered) prefix.push(prefix[prefix.length - 1] + value)
  const answers = []
  const frames = [{ phase: 'start', activeLine: L('sort nums from smallest'), query: null, count: null, message: `Sorted numbers ${ordered.join(', ')}; prefix sums ${prefix.join(', ')}.` }]
  queries.forEach((limit, index) => {
    // Largest count k with prefix[k] <= limit; prefix sums only grow.
    let lo = 0
    let hi = ordered.length
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1
      if (prefix[mid] <= limit) lo = mid
      else hi = mid - 1
    }
    answers.push(lo)
    frames.push({ phase: 'query', activeLine: L('find the largest count'), query: index, count: lo, message: `Limit ${limit}: the smallest ${lo} numbers sum to ${prefix[lo]}, within the limit.` })
  })
  frames.push({ phase: 'done', activeLine: L('return the stored counts'), query: null, count: null, message: `Answers: ${answers.join(', ')}.` })
  return { input: { nums, queries }, prefix, result: answers, frames }
}

export const code = `longest subsequence size under each limit
  sort nums from smallest to largest
  build prefix sums, starting from zero
  for each query limit
    find the largest count whose prefix sum is at most the limit
    store that count
  return the stored counts`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def longest_subsequence_sizes(nums, queries):
    import bisect
    ordered = sorted(nums)
    prefix = [0]
    for value in ordered:
        prefix.append(prefix[-1] + value)
    return [bisect.bisect_right(prefix, limit) - 1 for limit in queries]
`
