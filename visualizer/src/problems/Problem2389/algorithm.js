export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.nums) || !Array.isArray(input.queries)) throw new Error('Use {"nums": [...], "queries": [...]}.')
  if (input.nums.length < 1 || input.nums.length > 8 || input.queries.length < 1 || input.queries.length > 6) throw new Error('Use 1 to 8 numbers and 1 to 6 queries.')
  if (input.nums.some(v => !Number.isInteger(v) || v < 1 || v > 20)) throw new Error('Numbers are integers from 1 to 20.')
  if (input.queries.some(v => !Number.isInteger(v) || v < 1 || v > 60)) throw new Error('Queries are integers from 1 to 60.')
  return { nums: input.nums, queries: input.queries }
}

export function buildTrace({ nums, queries }) {
  const sorted = [...nums].sort((a, b) => a - b)
  const prefix = [0]
  for (const value of sorted) prefix.push(prefix[prefix.length - 1] + value)
  const answers = []
  const frames = [{ phase: 'start', activeLine: L('const sorted = [...nums]'), pythonLine: P('ordered = sorted(nums)'), query: null, lo: null, hi: null, mid: null, count: null, sorted, prefix, message: `Sorted numbers ${sorted.join(', ')}; prefix sums ${prefix.join(', ')}.` }]
  queries.forEach((limit, index) => {
    let lo = 0
    let hi = sorted.length
    frames.push({ phase: 'query', activeLine: L('let lo = 0'), pythonLine: P('lo, hi = 0, len(ordered)'), query: index, limit, lo, hi, mid: null, count: null, sorted, prefix, message: `Query ${index}, limit ${limit}: search counts from ${lo} to ${hi}.` })
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1
      const fits = prefix[mid] <= limit
      if (fits) lo = mid
      else hi = mid - 1
      frames.push({ phase: 'query', activeLine: L('const mid ='), pythonLine: P('mid = (lo + hi + 1)'), query: index, limit, lo, hi, mid, fits, count: null, sorted, prefix, message: `Test ${mid} smallest numbers: sum ${prefix[mid]} ${fits ? 'fits' : 'is too large'}, so the range becomes ${lo} to ${hi}.` })
    }
    answers.push(lo)
    frames.push({ phase: 'query', activeLine: L('return lo'), pythonLine: P('answers.append(lo)'), query: index, limit, lo, hi, mid: null, count: lo, sorted, prefix, message: `Limit ${limit}: the largest count is ${lo}, with sum ${prefix[lo]}.` })
  })
  frames.push({ phase: 'done', activeLine: L('return answers'), pythonLine: P('return answers'), query: null, lo: null, hi: null, mid: null, count: null, sorted, prefix, message: `Answers: ${answers.join(', ')}.` })
  return { input: { nums, queries }, prefix, result: answers, frames }
}

export const code = `function answerQueries(nums, queries) {
  const sorted = [...nums].sort((a, b) => a - b)
  const prefix = [0]
  for (const value of sorted) prefix.push(prefix[prefix.length - 1] + value)
  return queries.map(limit => {
    let lo = 0
    let hi = sorted.length
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1
      if (prefix[mid] <= limit) lo = mid
      else hi = mid - 1
    }
    return lo
  })
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1

export const python = `def answer_queries(nums, queries):
    ordered = sorted(nums)
    prefix = [0]
    for value in ordered:
        prefix.append(prefix[-1] + value)
    answers = []
    for limit in queries:
        lo, hi = 0, len(ordered)
        while lo < hi:
            mid = (lo + hi + 1) // 2
            if prefix[mid] <= limit:
                lo = mid
            else:
                hi = mid - 1
        answers.append(lo)
    return answers
`
